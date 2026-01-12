// /api/translate.js (Vercel) - OpenAI API使用（翻訳用）

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON" });
      }
    }

    const { text, targetLang } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const lang = (targetLang || "ja").trim();
    
    // 言語コードのマッピング
    const langMap = {
      'ja': 'Japanese',
      'en': 'English',
      'zh': 'Chinese',
      'ko': 'Korean'
    };
    const targetLanguage = langMap[lang] || lang;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is missing on server. Set it in Vercel (Production) and Redeploy.'
      });
    }

    const systemPrompt = `You are a translation engine. Translate the user's message into ${targetLanguage} using concise, natural wording. Return only the translated text without any explanation or additional text.`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.2
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
          error: 'OpenAI auth failed (401). Check OPENAI_API_KEY and Redeploy.',
          detail
        });
      }
      if (r.status === 429) {
        return res.status(429).json({
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
      return res.status(r.status).json({ error: errorMsg, detail });
    }

    const data = await r.json();
    const translated = (data.choices && data.choices[0]?.message?.content?.trim()) || '';
    
    if (!translated) {
      return res.status(500).json({ error: "Translation failed" });
    }

    return res.status(200).json({ translated });
  } catch (e) {
    console.error('Translation API error:', e);
    return res.status(500).json({ 
      error: "Server error", 
      detail: String(e?.message || e) 
    });
  }
};
