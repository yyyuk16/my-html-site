// templates/api/evaluate-chat.js
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

    const { prompt, temperature = 0.0 } = body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: parseFloat(temperature) || 0.0,
      response_format: { type: "json_object" }
    });

    const result = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      result: result
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({
      error: "evaluation_failed",
      message: error.message || "unknown",
    });
  }
};
