// ========================================
// チャット履歴に基づくパーソナライズドクイズ生成
// ========================================
let currentPersonalizedQuiz = null;
let currentQuizIndex = 0;
let personalizedQuizScore = 0;
let quizAnswers = []; // 各問題の回答状態を保持

// HTMLエスケープ関数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 翻訳ヘルパー関数（グローバルスコープから取得）
function t(key, fallback) {
  try {
    const lang = (window.multiLang && window.multiLang.currentLanguage) || 'ja';
    const dict = (window.multiLang && window.multiLang.translations && window.multiLang.translations[lang]) || {};
    return (dict && dict[key]) || fallback;
  } catch (_) {
    return fallback;
  }
}

async function generatePersonalizedQuiz() {
  const statusDiv = document.getElementById('quiz-generation-status');
  const quizContainer = document.getElementById('personalized-quiz-container');
  
  if (!statusDiv || !quizContainer) return;
  
  statusDiv.innerHTML = '<p>チャット履歴を分析中...</p>';
  quizContainer.innerHTML = '';
  
  try {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      statusDiv.innerHTML = '<p style="color:#f44336;">ログインが必要です</p>';
      return;
    }
    
    const db = firebase.firestore();
    
    // 最新のチャット履歴を取得
    // まず、ユーザーが参加しているチャットルームを検索
    const allChatsSnapshot = await db.collection('chats').get();
    let latestMessagesSnapshot = null;
    let chatRoomId = null;
    
    // ユーザーが参加している最新のチャットルームを見つける
    for (const chatDoc of allChatsSnapshot.docs) {
      const roomId = chatDoc.id;
      // chatRoomIdが2つのUIDを_で結合した形式の場合
      if (roomId.includes(currentUser.uid)) {
        const messagesSnapshot = await db.collection('chats').doc(roomId)
          .collection('messages')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        
        if (!messagesSnapshot.empty) {
          chatRoomId = roomId;
          latestMessagesSnapshot = await db.collection('chats').doc(roomId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
          break;
        }
      }
    }
    
    let patientText = '';
    
    if (latestMessagesSnapshot && !latestMessagesSnapshot.empty) {
      const userMessages = [];
      latestMessagesSnapshot.forEach(doc => {
        const msg = doc.data();
        if (msg.senderId === currentUser.uid && msg.text) {
          userMessages.push(msg.text);
        }
      });
      
      patientText = userMessages.reverse().join('\n');
    }
    
    // チャット履歴がない場合は、デフォルトレベルでクイズ生成
    if (!patientText || patientText.trim().length < 10) {
      statusDiv.innerHTML = `<p style="color:#888;">${t('insufficient_chat_history', 'チャット履歴が少ないため、基礎レベルのクイズを生成します')}</p>`;
      await generateQuizByLevel(3, quizContainer, statusDiv);
      return;
    }
    
    // 患者の発言を評価
    statusDiv.innerHTML = `<p>${t('evaluating_understanding', 'あなたの理解度を評価中...')}</p>`;
    const evaluation = await evaluatePatientChat(patientText);
    
    if (!evaluation) {
      statusDiv.innerHTML = `<p style="color:#888;">${t('evaluation_failed', '評価に失敗しました。デフォルトクイズを生成します')}</p>`;
      await generateQuizByLevel(3, quizContainer, statusDiv);
      return;
    }
    
    const knowledgeScore = evaluation.knowledge_score;
    const evalCompleteMsg = t('evaluation_complete', `評価完了：レベル ${knowledgeScore} → 適切な難易度のクイズを生成中...`)
      .replace('{level}', knowledgeScore);
    statusDiv.innerHTML = `<p>${evalCompleteMsg}</p>`;
    
    // 評価レベルに応じたクイズを生成
    await generateQuizByLevel(knowledgeScore, quizContainer, statusDiv, evaluation);
    
  } catch (error) {
    console.error('クイズ生成エラー:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const statusDiv = document.getElementById('quiz-generation-status');
    if (statusDiv) {
      const errorLabel = t('error', 'エラー:');
      // エラーメッセージをより詳細に表示
      let errorMsg = error.message || '不明なエラーが発生しました';
      
      // ネットワークエラーの場合
      if (error.message && error.message.includes('ネットワークエラー')) {
        errorMsg = t('network_error', 'ネットワークエラー: APIに接続できませんでした。インターネット接続を確認してください。');
      }
      // APIエラーの場合
      else if (error.message && (error.message.includes('500') || error.message.includes('HTTP'))) {
        errorMsg = t('api_error', 'APIエラー: サーバーでエラーが発生しました。しばらく待ってから再度お試しください。');
      }
      
      statusDiv.innerHTML = `<p style="color:#f44336;">${errorLabel} ${errorMsg}</p>`;
    }
  }
}

// 患者の発言を評価
async function evaluatePatientChat(patientText) {
  const evalPrompt = `
保健師の視点で、患者の発言から「医学的知識」と「治療への意思」を査定してください。

【評価基準】
1: 会話拒否（対話が成立せず、拒絶している）
2: 知識なし・意思なし（結核を軽視し、治そうとする意思も見られない）
3: 知識なし・意思あり（治したい意欲はあるが、知識不足で誤解や不安が先行している）
4: 知識あり・意思なし（ルールは知っているが、生活の不便さ等を理由に意思が低い）
5: 知識あり・意思あり（正確な知識を持ち、完遂に向けて非常に前向き）

【出力形式：JSON】
{
  "knowledge_score": 数値（1-5）,
  "analysis": {
    "knowledge_status": "知識の分析",
    "intent_status": "意思の分析"
  },
  "reason": "判断根拠（100文字以内）"
}

【分析対象：患者の発言】
${patientText}
`;
  
  try {
    const response = await fetch('/api/evaluate-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: evalPrompt, temperature: 0.0 })
    });
    
    if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
    
    const data = await response.json();
    const result = JSON.parse(data.result || '{}');
    
    return {
      knowledge_score: result.knowledge_score || 3,
      reason: result.reason || '',
      knowledge_analysis: result.analysis?.knowledge_status || '',
      intent_analysis: result.analysis?.intent_status || ''
    };
  } catch (error) {
    console.error('評価エラー:', error);
    return null;
  }
}

// 評価レベルに応じたクイズを生成
async function generateQuizByLevel(level, container, statusDiv, evaluation = null) {
  try {
    // レベルに応じた難易度とトピックを設定
    let difficulty = 'easy';
    let topic = '結核の基礎知識';
    let count = 5;
    
    if (level <= 2) {
      difficulty = 'easy';
      topic = '結核とは何か、基本的な症状と感染経路';
    } else if (level === 3) {
      difficulty = 'medium';
      topic = '結核の治療方法、服薬の重要性、副作用への対処';
    } else if (level === 4) {
      difficulty = 'medium';
      topic = 'DOTS（直接服薬確認療法）、治療継続の重要性、多剤耐性結核';
    } else {
      difficulty = 'hard';
      topic = '結核の詳細な治療プロセス、接触者健診、潜在性結核感染症の治療';
    }
    
    // 現在の言語設定を取得
    const currentLang = (window.multiLang && window.multiLang.currentLanguage) || 'ja';
    
    // 日本語以外の場合はトピックを翻訳
    let translatedTopic = topic;
    if (currentLang !== 'ja') {
      try {
        const translateResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: topic, targetLang: currentLang })
        });
        if (translateResponse.ok) {
          const translateData = await translateResponse.json();
          if (translateData.translated) {
            translatedTopic = translateData.translated;
          }
        }
      } catch (translateError) {
        console.warn('トピックの翻訳に失敗しました。元のトピックを使用します:', translateError);
        // 翻訳に失敗した場合は元のトピックを使用
      }
    }
    
    // クイズ生成APIを呼び出し
    let response;
    try {
      response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: translatedTopic,
          count: count,
          difficulty: difficulty,
          language: currentLang
        })
      });
    } catch (fetchError) {
      throw new Error(`ネットワークエラー: ${fetchError.message || 'APIに接続できませんでした'}`);
    }
    
    if (!response.ok) {
      let errorData = { message: `HTTP ${response.status} エラー` };
      let errorText = '';
      
      try {
        // まずテキストとして取得
        errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // JSONとしてパースを試みる
        if (errorText) {
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            // JSONでない場合はテキストをそのまま使用
            errorData = { 
              message: errorText.substring(0, 200) || `HTTP ${response.status} エラー`,
              detail: errorText
            };
          }
        }
      } catch (textError) {
        console.error('Error reading response:', textError);
        errorData = { 
          message: `HTTP ${response.status} エラー: レスポンスの読み取りに失敗しました`,
          detail: String(textError)
        };
      }
      
      const errorMessage = errorData.message || errorData.error || `クイズ生成APIエラー: ${response.status}`;
      console.error('Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!data || !data.questions) {
      throw new Error('APIからのレスポンスが不正です');
    }
    
    const questions = data.questions || [];
    
    if (questions.length === 0) {
      throw new Error('クイズが生成されませんでした');
    }
    
    // クイズを表示
    currentPersonalizedQuiz = questions;
    currentQuizIndex = 0;
    personalizedQuizScore = 0;
    quizAnswers = []; // 回答状態をリセット
    
    if (statusDiv) {
      const message = t('level_quiz_generated', `レベル ${level} に合わせたクイズを生成しました（${questions.length}問）`)
        .replace('{level}', level)
        .replace('{count}', questions.length);
      statusDiv.innerHTML = `<p style="color:#2E7D32;">✅ ${message}</p>`;
    }
    
    container.innerHTML = ''; // コンテナをクリア
    displayPersonalizedQuiz(questions[0], container, questions.length);
    
  } catch (error) {
    console.error('クイズ生成エラー:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (statusDiv) {
      const errorLabel = t('error', 'エラー:');
      // エラーメッセージをより詳細に表示
      let errorMsg = error.message || '不明なエラーが発生しました';
      
      // ネットワークエラーの場合
      if (error.message && error.message.includes('ネットワークエラー')) {
        errorMsg = t('network_error', 'ネットワークエラー: APIに接続できませんでした。インターネット接続を確認してください。');
      }
      // APIエラーの場合
      else if (error.message && (error.message.includes('500') || error.message.includes('HTTP'))) {
        errorMsg = t('api_error', 'APIエラー: サーバーでエラーが発生しました。しばらく待ってから再度お試しください。');
      }
      
      statusDiv.innerHTML = `<p style="color:#f44336;">${errorLabel} ${errorMsg}</p>`;
    }
  }
}

// パーソナライズドクイズを表示（1問ずつ表示）
function displayPersonalizedQuiz(question, container, totalQuestions) {
  const questionIndex = currentQuizIndex;
  const existingAnswer = quizAnswers[questionIndex];
  const isAnswered = existingAnswer && existingAnswer.answered;
  
  // コンテナをクリアして、現在の問題のみを表示
  container.innerHTML = '';
  
  // 新しい問題カードを作成
  const quizCard = document.createElement('div');
  quizCard.className = 'quiz-card';
  quizCard.setAttribute('data-question-index', questionIndex);
  quizCard.style.cssText = 'background: #fff; border-radius: 12px; padding: 24px; border: 2px solid #fff; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(46, 125, 50, 0.1);';
  container.appendChild(quizCard);
  
  // 問題カードの内容を設定
  quizCard.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px; color: #2E7D32; font-weight: 600;">
      ${t('question_number', '問題')} ${questionIndex + 1} / ${totalQuestions}
    </div>
    <h3 style="font-size: 1.2em; margin-bottom: 20px; color: #1B5E20; line-height: 1.6;">
      ${escapeHtml(question.question)}
    </h3>
    <div class="quiz-choices" style="display: grid; gap: 12px; margin-bottom: 20px;">
      ${question.choices.map((choice, index) => {
        const isCorrect = choice === question.answer;
        const isSelected = isAnswered && existingAnswer.selectedChoice === choice;
        const isWrongSelected = isAnswered && isSelected && !existingAnswer.isCorrect;
        
        let buttonStyle = 'padding: 14px 20px; background: #fff; border: 2px solid #C8E6C9; border-radius: 10px; text-align: left; font-size: 1em; transition: all 0.2s; color: #2E7D32;';
        let hoverStyle = '';
        
        if (isAnswered) {
          // 回答済みの場合
          if (isCorrect) {
            // 正解は赤色
            buttonStyle = 'padding: 14px 20px; background: #f44336; border: 2px solid #d32f2f; border-radius: 10px; text-align: left; font-size: 1em; color: #fff; cursor: default;';
          } else if (isWrongSelected) {
            // 選択した不正解は青色
            buttonStyle = 'padding: 14px 20px; background: #2196F3; border: 2px solid #1976D2; border-radius: 10px; text-align: left; font-size: 1em; color: #fff; cursor: default;';
          } else {
            // その他の選択肢はグレーアウト
            buttonStyle = 'padding: 14px 20px; background: #f5f5f5; border: 2px solid #e0e0e0; border-radius: 10px; text-align: left; font-size: 1em; color: #999; cursor: default;';
          }
        } else {
          // 未回答の場合はホバー効果を追加
          hoverStyle = `onmouseover="this.style.borderColor='#4CAF50'; this.style.background='#E8F5E9';" onmouseout="this.style.borderColor='#C8E6C9'; this.style.background='#fff';"`;
        }
        
        return `
          <button class="choice-btn" data-choice="${escapeHtml(choice)}" 
                  data-is-correct="${isCorrect}"
                  style="${buttonStyle}"
                  ${hoverStyle}
                  ${isAnswered ? 'disabled' : ''}>
            ${String.fromCharCode(65 + index)}. ${escapeHtml(choice)}
            ${isCorrect && isAnswered ? ' ✓' : ''}
          </button>
        `;
      }).join('')}
    </div>
    <div class="quiz-explanation" style="display: ${isAnswered ? 'block' : 'none'}; padding: 16px; background: #E8F5E9; border-radius: 8px; 
                                        border-left: 4px solid #4CAF50; margin-top: 16px;">
      <strong style="color: #2E7D32;">${t('explanation', '解説：')}</strong>
      <p style="margin-top: 8px; color: #1B5E20; line-height: 1.6;">${escapeHtml(question.explanation)}</p>
    </div>
    <div class="quiz-navigation" style="display: ${isAnswered ? 'block' : 'none'}; text-align: center; margin-top: 20px;">
      <button class="quiz-btn" onclick="nextPersonalizedQuestion(${totalQuestions})" 
              style="font-size: 1em; padding: 12px 24px;">
        ${questionIndex + 1 === totalQuestions ? t('view_results', '結果を見る') : t('next_question', '次へ')}
      </button>
    </div>
  `;
  
  // 未回答の場合のみイベントリスナーを追加
  if (!isAnswered) {
    quizCard.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.disabled) return;
        
        const selectedChoice = this.dataset.choice;
        const isCorrect = selectedChoice === question.answer;
        
        // 回答状態を保存
        quizAnswers[questionIndex] = {
          questionIndex: questionIndex,
          selectedChoice: selectedChoice,
          isCorrect: isCorrect,
          answered: true
        };
        
        if (isCorrect) {
          personalizedQuizScore++;
        }
        
        // 問題を再表示して回答状態を反映
        displayPersonalizedQuiz(question, container, totalQuestions);
      });
    });
  }
}

// 次の問題へ
function nextPersonalizedQuestion(totalQuestions) {
  currentQuizIndex++;
  const container = document.getElementById('personalized-quiz-container');
  
  if (currentQuizIndex >= totalQuestions) {
    // クイズ終了
    showPersonalizedQuizResult(totalQuestions);
  } else {
    displayPersonalizedQuiz(currentPersonalizedQuiz[currentQuizIndex], container, totalQuestions);
  }
}

// クイズ結果を表示
function showPersonalizedQuizResult(totalQuestions) {
  const container = document.getElementById('personalized-quiz-container');
  const accuracy = Math.round((personalizedQuizScore / totalQuestions) * 100);
  
  container.innerHTML = `
    <div class="quiz-result-card" style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); 
                                       border-radius: 18px; padding: 40px; text-align: center; color: #fff; box-shadow: 0 4px 24px rgba(46, 125, 50, 0.3);">
      <h2 style="font-size: 2em; margin-bottom: 20px; color: #fff;">🎉 クイズ完了！</h2>
      <div style="font-size: 3em; margin: 20px 0; font-weight: bold;">
        ${personalizedQuizScore} / ${totalQuestions}
      </div>
      <div style="font-size: 1.5em; margin-bottom: 30px;">
        ${t('accuracy_rate_label', '正答率:')} ${accuracy}%
      </div>
      <button class="quiz-btn" onclick="generatePersonalizedQuiz()" 
              style="background: #fff; color: #2E7D32; font-size: 1.1em; padding: 14px 32px; box-shadow: 0 2px 12px rgba(255,255,255,0.3);">
        ${t('retry_quiz', 'もう一度挑戦')}
      </button>
      <button class="quiz-btn" onclick="location.reload()" 
              style="background: rgba(255,255,255,0.2); color: #fff; font-size: 1.1em; padding: 14px 32px; margin-left: 10px; border: 2px solid rgba(255,255,255,0.3);">
        ${t('back_to_results', '結果ページに戻る')}
      </button>
    </div>
  `;
  
  // スコアをFirebaseに保存
  savePersonalizedQuizScore(personalizedQuizScore, totalQuestions, accuracy);
}

// スコアをFirebaseに保存
async function savePersonalizedQuizScore(score, total, accuracy) {
  try {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;
    
    const db = firebase.firestore();
    await db.collection('personalized_quiz_scores').add({
      userId: currentUser.uid,
      score: score,
      total: total,
      accuracy: accuracy,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('スコア保存エラー:', error);
  }
}
