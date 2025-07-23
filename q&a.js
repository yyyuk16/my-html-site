const apiKey = "AIzaSyB4H5H00b7sMJ4pwpnE133Lxlg-mJCoAN8";
const firebaseConfig = {
    apiKey: "AIzaSyC31W-TEE7mIBGFwrRxJAuPugjnEFfWe_k",
    authDomain: "web01-2484d.firebaseapp.com",
    projectId: "web01-2484d",
    storageBucket: "web01-2484d.appspot.com",
    messagingSenderId: "90159472898",
    appId: "1:90159472898:web:261ec71f9919611011e21b"
};


// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// グローバル変数の定義
let currentQuestion = 0;
const totalQuestions = 5;
let score = {
  correct: 0,
  total: 0
};
let currentQuiz = null;
let currentCategory = 'basic'; // デフォルトカテゴリー

// カテゴリー別の問題定義
const quizCategories = {
  about: {
    name: "結核とは",
    prompts: [
      "結核とは何かについての4択クイズを作成してください。JSON形式で「question」「choices」「answer」のキーを持つオブジェクトで返してください。"
    ]
  },
  test: {
    name: "検査方法",
    prompts: [
      "結核の検査方法についての4択クイズを作成してください。JSON形式で「question」「choices」「answer」のキーを持つオブジェクトで返してください。"
    ]
  },
  treatment: {
    name: "治療方法",
    prompts: [
      "結核の治療方法についての4択クイズを作成してください。JSON形式で「question」「choices」「answer」のキーを持つオブジェクトで返してください。"
    ]
  },
  target: {
    name: "感染対象",
    prompts: [
      "結核の感染対象についての4択クイズを作成してください。JSON形式で「question」「choices」「answer」のキーを持つオブジェクトで返してください。"
    ]
  },
  if: {
    name: "結核になったら",
    prompts: [
      "結核になった場合の対応についての4択クイズを作成してください。JSON形式で「question」「choices」「answer」のキーを持つオブジェクトで返してください。"
    ]
  }
};

function getRandomPrompt() {
  const categoryPrompts = quizCategories[currentCategory].prompts;
  return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
}

// カテゴリー選択関数
function selectCategory(category) {
  currentCategory = category;
  currentQuestion = 0;
  score = { correct: 0, total: 0 };
  generateQuiz();
}

// 認証状態の監視
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log("ログイン中:", user.uid);
    // ユーザー情報をローカルストレージに保存
    localStorage.setItem("userName", user.displayName || "匿名ユーザー");
    localStorage.setItem("userEmail", user.email || "");
    localStorage.setItem("userId", user.uid);
    // 初期クイズの生成
    generateQuiz();
  } else {
    console.warn("ログインしていません。ログインページにリダイレクトします。");
    window.location.href = "login.html";
  }
});

// スコア保存関数
async function saveScore() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("ログインしていないためスコアは保存されません");
    return;
  }

  try {
    const accuracy = (score.correct / score.total) * 100;
    const scoreData = {
      correct: score.correct,
      total: score.total,
      accuracy: accuracy,
      timestamp: new Date(), // serverTimestampの代わりに通常のDateを使用
      category: currentCategory,
      categoryName: quizCategories[currentCategory].name
    };

    // ユーザーのドキュメントを取得
    const userDoc = await db.collection('quiz_scores').doc(user.uid).get();
    
    if (userDoc.exists) {
      // 既存のスコア配列を取得
      const existingData = userDoc.data();
      const scores = existingData.scores || [];
      
      // 新しいスコアを追加
      scores.push(scoreData);
      
      // ドキュメントを更新
      await db.collection('quiz_scores').doc(user.uid).update({
        scores: scores,
        latestScore: scoreData
      });
    } else {
      // 新規ドキュメントを作成
      await db.collection('quiz_scores').doc(user.uid).set({
        scores: [scoreData],
        latestScore: scoreData
      });
    }

    console.log("スコア保存成功");
    // 保存成功後に画面遷移
    window.location.href = 'score.html';
  } catch (error) {
    console.error("スコアの保存に失敗しました:", error);
    alert("スコアの保存に失敗しました。もう一度お試しください。");
  }
}

async function generateQuiz() {
  try {
    if (currentQuestion >= totalQuestions) {
      // スコア保存を待ってから画面遷移
      await saveScore();
      return;
    }
   
    const prompt = getRandomPrompt();
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!res.ok) {
      throw new Error(`APIエラー: ${res.status}`);
    }

    const data = await res.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("APIからの応答が不正です");
    }

    const text = data.candidates[0].content.parts[0].text;
    const quiz = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));

    displayQuiz(quiz);
  } catch (error) {
    console.error("エラー:", error);
    alert("クイズの生成に失敗しました: " + error.message);
  }
}

function displayQuiz(quiz) {
  currentQuiz = quiz;
  document.getElementById('question').textContent = `問題 ${currentQuestion + 1}/${totalQuestions}: ${quiz.question}`;

  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';

  quiz.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'choice-btn';
    button.textContent = choice;
    button.onclick = () => checkAnswer(choice);
    choicesContainer.appendChild(button);
  });

  document.getElementById('result').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
}

function checkAnswer(selectedChoice) {
  const buttons = document.getElementsByClassName('choice-btn');
  const result = document.getElementById('result');
  const nextButton = document.getElementById('next-btn');

  for (let button of buttons) {
    button.disabled = true;
    if (button.textContent === currentQuiz.answer) {
      button.classList.add('correct');
    } else if (button.textContent === selectedChoice && selectedChoice !== currentQuiz.answer) {
      button.classList.add('incorrect');
    }
  }

  if (selectedChoice === currentQuiz.answer) {
    result.textContent = '正解です！';
    result.className = 'result correct';
    score.correct++;
  } else {
    result.textContent = `不正解です。正解は ${currentQuiz.answer} でした。`;
    result.className = 'result incorrect';
  }

  score.total++;
  result.style.display = 'block';
  nextButton.style.display = 'block';

  // 最後の問題の場合、ボタンのテキストを変更
  if (currentQuestion + 1 >= totalQuestions) {
    nextButton.textContent = '結果を見る';
  }
}

// 次の問題ボタンのイベントリスナー
document.getElementById('next-btn').onclick = async () => {
  if (currentQuestion + 1 >= totalQuestions) {
    // 最後の問題の場合、スコアを保存して結果ページへ
    await saveScore();
  } else {
    currentQuestion++;
    generateQuiz();
  }
};
