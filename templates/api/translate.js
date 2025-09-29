// Vercel Serverless Function: /api/translate
// POST { text: string, targetLang: string }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const { text, targetLang } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'invalid_text' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'missing_openai_key' });
    }

    const lang = (targetLang || 'ja').trim();
    const systemPrompt = `You are a translation engine. Translate the user's message into ${lang} using concise, natural wording. Return only the translated text.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error('OpenAI translate error:', data);
      return res.status(openaiRes.status).json(data);
    }

    const translated = (data?.choices?.[0]?.message?.content || '').trim();
    return res.status(200).json({ translated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
}


