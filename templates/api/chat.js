// templates/api/chat.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'OpenAI endpoint ready' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    const userMessage = body?.message ?? '';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: 'OPENAI_API_KEY is missing on server. Set it in Vercel → Settings → Environment Variables and Redeploy.'
      });
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'あなたは優しい先生です。日本語で分かりやすく答えてください。' },
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
      // 401 のときは分かりやすい文で返す
      if (r.status === 401) {
        return res.status(401).json({
          ok: false,
          error: 'OpenAI auth failed (401). Check OPENAI_API_KEY (value/whitespace) and Redeploy.',
          detail
        });
      }
      return res.status(r.status).json({ ok: false, error: 'OpenAI API error', detail });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ ok: true, reply });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
};
