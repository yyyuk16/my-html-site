// Vercel Serverless Function: /api/translate
// POST { text: string, targetLang: string }

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
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

    // 言語コードを正規化
    const inputLang = (targetLang || 'ja').toString().trim().toLowerCase();
    const langMap = { jp: 'ja', japanese: 'ja', 日本語: 'ja', ja: 'ja', en: 'en', english: 'en', 英語: 'en', ko: 'ko', korean: 'ko', 韓国語: 'ko', zh: 'zh', chinese: 'zh', 中国語: 'zh' };
    const lang = langMap[inputLang] || inputLang || 'ja';
    // 日本語指定時は日本語で厳密に指示
    const systemPrompt = (lang === 'ja')
      ? 'あなたは高品質な翻訳エンジンです。ユーザーの文章を自然で読みやすい日本語に翻訳してください。出力は翻訳文のみ（引用符・注釈・原文の再掲なし）。'
      : `You are a high‑quality translation engine. Translate the user's message into ${lang} using concise, natural wording. Output only the translated text (no quotes, no notes).`;

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
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error('OpenAI translate error:', data);
      return res.status(openaiRes.status).json(data);
    }

    let translated = (data?.choices?.[0]?.message?.content || '').trim();
    // 余計な囲み（例: "..." や ```）を除去
    translated = translated.replace(/^"|"$/g, '').replace(/^`{3}[\s\S]*?\n|`{3}$/g, '').trim();
    if (!translated) translated = text; // フォールバック
    return res.status(200).json({ translated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
}


