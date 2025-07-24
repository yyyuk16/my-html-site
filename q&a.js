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
      "結核とは何の病気ですか？,細菌による感染症,ウイルスによる感染症,遺伝性の病気,自己免疫疾患,細菌による感染症",
      "結核の主な感染経路はどれですか？,空気感染,接触感染,水系感染,昆虫媒介,空気感染",
      "結核の原因菌は何ですか？,結核菌,インフルエンザウイルス,黄色ブドウ球菌,大腸菌,結核菌",
      "結核の主な症状はどれですか？,長引く咳,腹痛,皮膚のかゆみ,視力低下,長引く咳",
      "結核はどの臓器に最も多く発症しますか？,肺,肝臓,腎臓,心臓,肺"
    ]
  },
  test: {
    name: "検査方法",
    prompts: [
      "結核の診断に使われる検査はどれですか？,ツベルクリン反応,心電図,血糖値測定,尿検査,ツベルクリン反応",
      "結核菌の有無を調べるために行う検査は？,喀痰検査,胃カメラ,CT検査,心エコー,喀痰検査",
      "結核の画像診断でよく使われるものは？,胸部X線,腹部超音波,脳MRI,骨密度検査,胸部X線",
      "結核の感染力を調べる検査は？,喀痰塗抹検査,血圧測定,視力検査,聴力検査,喀痰塗抹検査",
      "ツベルクリン反応検査は何を調べるものですか？,結核感染の有無,肝機能,腎機能,血糖値,結核感染の有無"
    ]
  },
  treatment: {
    name: "治療方法",
    prompts: [
      "結核の治療に使われる主な方法は？,抗菌薬の服用,手術,放射線治療,リハビリ,抗菌薬の服用",
      "結核治療で重要なのは？,薬を決められた期間飲み続ける,薬を途中でやめる,運動を控える,水分を多くとる,薬を決められた期間飲み続ける",
      "結核治療の期間は通常どれくらい？,6か月以上,1週間,1か月,1年未満,6か月以上",
      "結核治療で使われる薬は？,抗結核薬,抗ウイルス薬,抗ヒスタミン薬,鎮痛薬,抗結核薬",
      "治療中に薬を途中でやめるとどうなる？,再発や耐性菌ができる,すぐ治る,副作用が減る,効果が上がる,再発や耐性菌ができる"
    ]
  },
  target: {
    name: "感染対象",
    prompts: [
      "結核に感染しやすいのはどんな人？,免疫力が低い人,健康な若者,運動選手,妊婦,免疫力が低い人",
      "結核はどの年齢層でも感染しますか？,すべての年齢層,子どもだけ,高齢者だけ,成人だけ,すべての年齢層",
      "結核の感染リスクが高い場所は？,人が多く集まる場所,屋外,水辺,山の中,人が多く集まる場所",
      "結核は動物から人に感染しますか？,まれにある,よくある,全くない,必ずある,まれにある",
      "結核の感染を防ぐために大切なのは？,換気,運動,日光浴,読書,換気"
    ]
  },
  if: {
    name: "結核になったら",
    prompts: [
      "結核と診断されたらまず何をすべき？,医師の指示に従う,運動を増やす,薬をやめる,外出を増やす,医師の指示に従う",
      "結核患者が守るべきことは？,薬をきちんと飲む,薬を飲まない,人に会い続ける,マスクをしない,薬をきちんと飲む",
      "結核治療中に外出は？,医師の指示に従う,自由に外出,必ず外出,外出禁止,医師の指示に従う",
      "結核の治療費は？,公費で助成される,全額自己負担,保険適用外,無料ではない,公費で助成される",
      "結核が治った後に大切なことは？,定期的な検診,薬をやめる,運動を控える,食事制限,定期的な検診"
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
