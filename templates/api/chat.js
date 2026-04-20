// /api/chat.js (Vercel) - OpenAI API使用

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
      const hasKey = !!process.env.OPENAI_API_KEY;
      return res.status(200).json({
        ok: true,
        diag: {
          hasOpenAIKey: hasKey,
          runtime: process.version,
        },
      });
    }
    return res.status(200).json({ ok: true, message: "OpenAI endpoint ready" });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    const userMessage = body?.message ?? '';

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({ ok: false, error: "message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: 'OPENAI_API_KEY is missing on server. Set it in Vercel (Production) and Redeploy.'
      });
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a kind medical assistant. LANGUAGE DETECTION IS CRITICAL.\n\nMANDATORY LANGUAGE RULES:\n1. Detect the language of the user\'s message\n2. Respond in the EXACT same language\n3. If user writes "Hello" → Respond in English\n4. If user writes "こんにちは" → Respond in Japanese\n5. If user writes "你好" → Respond in Chinese\n6. If user writes "안녕하세요" → Respond in Korean\n\nNEVER translate or change languages. Match exactly.\nKeep responses under 100 characters.\n\nMedical restrictions:\n- No diagnosis\n- No medication advice\n- No treatment advice\n- Only general health information' 
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      if (r.status === 401) {
        return res.status(401).json({
          ok: false,
          error: 'OpenAI auth failed (401). Check OPENAI_API_KEY and Redeploy.',
          detail
        });
      }
      if (r.status === 429) {
        return res.status(429).json({
          ok: false,
          error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
          detail: 'Rate limit exceeded. Please wait a moment before trying again.'
        });
      }
      let errorMsg = 'OpenAI API error';
      try {
        const errorData = JSON.parse(detail);
        if (errorData.error && errorData.error.message) {
          errorMsg = errorData.error.message;
        }
      } catch {}
      return res.status(r.status).json({ ok: false, error: errorMsg, detail });
    }

    const data = await r.json();
    const reply = (data.choices && data.choices[0]?.message?.content) || '';
    return res.status(200).json({ ok: true, reply: reply || "うまく応答できませんでした。別の聞き方で試してね。" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error", detail: String(e?.message || e) });
  }
};
