// /api/chat.js (Vercel)

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  // --- 診断: /api/chat?diag=1 ---
  if (req.method === "GET") {
    const url = require("url");
    const q = url.parse(req.url, true).query || {};
    if (q.diag === "1") {
      const hasKey = !!process.env.GEMINI_API_KEY;
      return res.status(200).json({
        ok: true,
        diag: {
          hasGeminiKey: hasKey,
          runtime: process.version,
        },
      });
    }
    return res.status(200).json({ ok: true, message: "Gemini endpoint ready" });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { message } = req.body || {};
    const msg = String(message || "").trim();
    if (!msg) return res.status(400).json({ error: "message is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const system = [
      "あなたは学校の保健室の先生のように、やさしく丁寧に話すAIです。",
      "医療診断はせず、安心につながる一般的な情報と受診の目安を伝えます。",
      "日本語で100〜200字くらいを目安に簡潔に答えます。"
    ].join("\n");

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=" +
      encodeURIComponent(apiKey);

    const payload = {
      contents: [
        { role: "user", parts: [{ text: system + "\n\nユーザー: " + msg }] }
      ],
      generationConfig: { temperature: 0.6, maxOutputTokens: 256 }
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await r.text();

    // ★ここが重要：Geminiが返したエラー本文をそのまま返す
    if (!r.ok) {
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch {}

      const err = parsed?.error || {};
      return res.status(r.status).json({
        ok: false,
        status: r.status,
        error: {
          message: err.message || raw,
          type: err.status,
          code: err.code
        }
      });
    }

    const data = JSON.parse(raw);
    const out = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("")?.trim() || "";

    return res.status(200).json({ ok: true, reply: out || "うまく生成できませんでした。別の聞き方で試してね。" });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message || e) });
  }
};
