// templates/api/quiz.js
const OpenAI = require("openai");

// Vercel 環境変数から読み込み
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // JSON body を安全にパース
    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      body = {};
    }

    const {
      topic = "結核の患者向け基礎知識",
      count = 5,
      difficulty = "easy",
      language = "ja",
    } = body;

    const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);

    const system = `
あなたは医療教育のクイズ作成AIです。
安全・正確・患者理解を最優先にし、ヘルスリテラシーに配慮して出題します。
出力は指定の JSON 配列のみ。説明文や前後文は出力しないでください。
    `.trim();

    const user = `
トピック: ${topic}
難易度: ${difficulty}
言語: ${language}
問題数: ${n}

以下の **厳密な JSON 配列** だけを出力してください（コードブロック禁止、余計な文禁止）。

[
  {
    "question": "質問文（${language==="ja" ? "35〜80文字で患者向けに簡潔に" : "concise 1 sentence"}）",
    "choices": ["選択肢A","選択肢B","選択肢C","選択肢D"],
    "answer": "正解の選択肢（choicesの中の文字列をそのまま）",
    "explanation": "解説（${language==="ja" ? "80文字以内" : "within 120 chars"}）"
  }
]
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 必要なら "gpt-4o-mini-2024-07-18"
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    let content = completion.choices?.[0]?.message?.content || "";
    const s = content.indexOf("[");
    const e = content.lastIndexOf("]");
    if (s !== -1 && e !== -1) content = content.slice(s, e + 1);

    let questions = [];
    try {
      questions = JSON.parse(content);
    } catch (err) {
      throw new Error("Model returned non-JSON output: " + content);
    }

    const normalized = (Array.isArray(questions) ? questions : [])
      .slice(0, n)
      .map((q) => {
        const choices = Array.isArray(q.choices) ? q.choices.slice(0, 4) : [];
        return {
          question: String(q.question || "").trim(),
          choices:
            choices.length === 4
              ? choices.map((c) => String(c).trim())
              : ["はい", "いいえ", "わからない", "その他"],
          answer: String(q.answer || choices[0] || "はい").trim(),
          explanation: String(q.explanation || "").trim(),
        };
      });

    if (!normalized.length) {
      throw new Error("No valid questions");
    }

    return res.status(200).json({ questions: normalized });
  } catch (e) {
    console.error("quiz API error:", e);
    return res.status(500).json({
      error: "quiz_generation_failed",
      message: e.message || "unknown",
    });
  }
};
