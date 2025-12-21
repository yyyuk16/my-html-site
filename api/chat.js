// templates/api/chat.js
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // クエリ取得ヘルパ
  const getQuery = () => {
    try {
      const url = require('url');
      return url.parse(req.url, true).query || {};
    } catch {
      return {};
    }
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

  // sleep
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // OpenAI呼び出し（429/5xxのときだけリトライ）
  async function callOpenAIWithRetry(payload, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';

    // 2回まで（合計最大3回）試す：0回目→失敗なら待つ→1回目→失敗なら待つ→2回目
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // 成功なら即返す
      if (r.ok) return r;

      // 429（レート制限）と 5xx（相手都合）のときだけリトライ
      const shouldRetry = (r.status === 429) || (r.status >= 500 && r.status <= 599);

      // 最後の試行ならそのまま返す
      if (!shouldRetry || attempt === maxAttempts - 1) return r;

      // 指数バックオフ（0.8s, 1.6s）
      const waitMs = 800 * Math.pow(2, attempt);
      await sleep(waitMs);
    }

    // ここには通常来ない
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const userMessage = (body?.message ?? '').toString();

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
          content:
            "You are a kind medical assistant. LANGUAGE DETECTION IS CRITICAL.\n\n" +
            "MANDATORY LANGUAGE RULES:\n" +
            "1. Detect the language of the user's message\n" +
            "2. Respond in the EXACT same language\n" +
            "3. If user writes \"Hello\" → Respond in English\n" +
            "4. If user writes \"こんにちは\" → Respond in Japanese\n" +
            "5. If user writes \"你好\" → Respond in Chinese\n" +
            "6. If user writes \"안녕하세요\" → Respond in Korean\n\n" +
            "NEVER translate or change languages. Match exactly.\n" +
            "Keep responses under 100 characters.\n\n" +
            "Medical restrictions:\n" +
            "- No diagnosis\n" +
            "- No medication advice\n" +
            "- No treatment advice\n" +
            "- Only general health information"
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 120 // ★短文なので小さめに（負荷＆コスト＆429対策）
    };

    const r = await callOpenAIWithRetry(payload, apiKey);

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      let parsed = null;
      try { parsed = JSON.parse(text); } catch {}

      const err = parsed?.error || {};
      return res.status(r.status).json({
        ok: false,
        status: r.status,
        error: {
          message: err.message || text,
          type: err.type,
          code: err.code
        }
      });
    }

    const data = await r.json();
    const reply = (data.choices && data.choices[0]?.message?.content) || '';
    return res.status(200).json({ ok: true, reply });

  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
};
