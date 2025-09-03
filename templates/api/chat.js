// templates/api/chat.js  （Node/Serverless・CORS付き・非ストリーミング）
module.exports = async (req, res) => {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // 必要なら自分のドメインに限定
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
    // --- 入力 ---
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    const userMessage = body?.message ?? '';
    const systemPrompt =
      body?.system ??
      'You are a helpful assistant. Reply in Japanese if the user writes Japanese.';

    // --- 環境変数 ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: 'OPENAI_API_KEY is missing' });

    // --- OpenAI Chat Completions ---
    const payload = {
      model: 'gpt-4o-mini',               // コスパ良。必要なら 'gpt-4o' に
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return res.status(r.status).json({ ok: false, error: 'OpenAI API error', detail });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ ok: true, model: payload.model, reply });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
};
