// api/chat.js  --- Vercel Serverless Function (Node.js)
// 目的: フロントから {message} を受け取り、OpenAI に中継して { reply } を返す。

module.exports = async (req, res) => {
  // --- CORS （GitHub Pages からも叩けるように） ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    // VercelのNodeランタイムでは req.body が自動でJSON化されます
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid body: { message: string } required' });
    }

    const systemPrompt =
      'あなたは医療情報アシスタントです。診断は行わず、日本語でやさしく、結論から、' +
      '最大100字で要点を伝えます。危険時は医療機関受診を勧めます。';

    // OpenAI Chat Completions
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      // OpenAI のエラーをそのままフロントに返す
      return res.status(r.status).json({ error: data.error || data });
    }

    const reply = data?.choices?.[0]?.message?.content ?? 'うまく応答できませんでした。';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
