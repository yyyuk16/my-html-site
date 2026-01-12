const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

// Firestore 初期化（複数回呼ばれてもOKにする）
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// OpenAI クライアント
const configuration = new Configuration({
  apiKey: functions.config().openai.key, // ← firebase functions:config:set で保存した値を参照
});
const openai = new OpenAIApi(configuration);

/**
 * クイズを生成する Cloud Function
 * フロントから呼び出すと OpenAI に投げてクイズを生成
 */
exports.generateQuiz = functions.https.onCall(async (data, context) => {
  try {
    const topic = data.topic || "結核の患者教育";
    const count = data.count || 5;

    // OpenAI にリクエスト
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "あなたは医療教育用のクイズ作成AIです。" },
        {
          role: "user",
          content: `「${topic}」について、日本語の4択クイズを${count}問作ってください。
必ず次の形式でJSON配列にしてください:
[
  {
    "question": "質問文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "answer": "正解",
    "explanation": "解説文"
  }
]`
        }
      ],
    });

    const resultText = response.data.choices[0].message.content;

    let questions = [];
    try {
      questions = JSON.parse(resultText);
    } catch (e) {
      console.error("JSON パース失敗:", resultText);
      throw new functions.https.HttpsError("data-loss", "生成結果がJSONではありません");
    }

    return { questions };
  } catch (err) {
    console.error("OpenAI API error:", err);
    throw new functions.https.HttpsError("internal", "OpenAI API 呼び出しエラー");
  }
});

/**
 * スコアを保存する Cloud Function
 * フロントでクイズ終了後に呼び出す
 */
exports.saveScore = functions.https.onCall(async (data, context) => {
  try {
    const { score, total } = data;

    const docRef = await db.collection("ai_quiz_scores").add({
      score,
      total,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: context.auth ? context.auth.uid : null, // 認証していればUIDも保存
    });

    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Firestore 保存失敗:", err);
    throw new functions.https.HttpsError("internal", "スコア保存エラー");
  }
});
