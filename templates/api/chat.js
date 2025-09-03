// templates/api/chat.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // クエリ取得ヘルパ
  const getQuery = () => {
    try {
      const url = require('url');
      const q = url.parse(req.url, true).query || {};
      return q;
    } catch { return {}; }
  };

  // --- 診断モード: /api/chat?diag=1 で環境変数の有無だけ返す ---
  if (req.method === 'GET') {
    const q = getQuery();
    if (q.diag === '1') {
      const k = process.env.OPENAI_API_KEY || '';
      return res.status(200).json({
        ok: true,
        diag: { hasKey: !!k, length: k.length }
      });
    }
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
        error: 'OPENAI_API_KEY is missing on server. Set it in Vercel (Production) and Redeploy.'
      });
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'あなたは優しい先生です。日本語でわかりやすく答えてください。' },
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
      return res.status(r.status).json({ ok: false, error: 'OpenAI API error', detail });
    }

    const data = await r.json();
    const reply = (data.choices && data.choices[0]?.message?.content) || '';
    return res.status(200).json({ ok: true, reply });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
};
