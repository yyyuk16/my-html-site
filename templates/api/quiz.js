// templates/api/quiz.js
const OpenAI = require("openai");

// CORSヘッダーを設定
const setCORSHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

module.exports = async (req, res) => {
  setCORSHeaders(res);
  
  // OPTIONSリクエストの処理
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 環境変数のチェック
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({
      error: "quiz_generation_failed",
      message: "OpenAI API key is not configured",
    });
  }

  // OpenAIクライアントの初期化
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // リクエスト情報をログに記録
    console.log("Quiz API request received:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      bodyType: typeof req.body,
      bodyLength: req.body ? (typeof req.body === 'string' ? req.body.length : JSON.stringify(req.body).length) : 0
    });

    // JSON body を安全にパース
    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      console.log("Parsed body:", { topic: body.topic?.substring(0, 50), count: body.count, difficulty: body.difficulty, language: body.language });
    } catch (parseError) {
      console.error("Body parse error:", parseError);
      body = {};
    }

    const {
      topic = "結核の患者向け基礎知識",
      count = 5,
      difficulty = "easy",
      language = "ja",
    } = body;

    const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);

    const system = `
あなたは医療教育のクイズ作成AIです。
安全・正確・患者理解を最優先にし、ヘルスリテラシーに配慮して出題します。
出力は指定の JSON 配列のみ。説明文や前後文は出力しないでください。
    `.trim();

    const user = `
トピック: ${topic}
難易度: ${difficulty}
言語: ${language}
問題数: ${n}

以下の **厳密な JSON 配列** だけを出力してください（コードブロック禁止、余計な文禁止）。

[
  {
    "question": "質問文（${language==="ja" ? "35〜80文字で患者向けに簡潔に" : "concise 1 sentence"}）",
    "choices": ["選択肢A","選択肢B","選択肢C","選択肢D"],
    "answer": "正解の選択肢（choicesの中の文字列をそのまま）",
    "explanation": "解説（${language==="ja" ? "80文字以内" : "within 120 chars"}）"
  }
]
    `.trim();

    // OpenAI API呼び出し
    let completion;
    try {
      console.log("Calling OpenAI API with:", {
        model: "gpt-4o-mini",
        topic: topic.substring(0, 50),
        count: n,
        difficulty,
        language
      });
      
      // タイムアウト設定（Vercelの最大実行時間を考慮）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout: OpenAI API呼び出しがタイムアウトしました")), 25000);
      });
      
      completion = await Promise.race([
        client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.6,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        timeoutPromise
      ]);
      
      console.log("OpenAI API response received");
    } catch (openaiError) {
      console.error("OpenAI API error details:", {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type,
        stack: openaiError.stack
      });
      
      // 特定のエラータイプに応じた処理
      if (openaiError.status === 401) {
        return res.status(401).json({
          error: "quiz_generation_failed",
          message: "OpenAI認証エラー: APIキーが無効です",
        });
      }
      
      if (openaiError.status === 429) {
        return res.status(429).json({
          error: "quiz_generation_failed",
          message: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
        });
      }
      
      if (openaiError.status === 500 || openaiError.status === 502 || openaiError.status === 503) {
        return res.status(503).json({
          error: "quiz_generation_failed",
          message: "OpenAIサービスが一時的に利用できません。しばらく待ってから再度お試しください。",
        });
      }
      
      throw new Error(`OpenAI API呼び出しエラー: ${openaiError.message || "Unknown error"} (Status: ${openaiError.status || "N/A"})`);
    }

    let content = completion.choices?.[0]?.message?.content || "";
    
    console.log("OpenAI response content length:", content.length);
    console.log("OpenAI response preview:", content.substring(0, 200));
    
    if (!content || content.trim().length === 0) {
      console.error("Empty response from OpenAI");
      throw new Error("OpenAI API returned empty response");
    }

    // JSON配列を抽出
    const s = content.indexOf("[");
    const e = content.lastIndexOf("]");
    if (s === -1 || e === -1 || s >= e) {
      console.error("Invalid JSON format in response. Full content:", content);
      throw new Error(`OpenAI API returned invalid JSON format. Response preview: ${content.substring(0, 300)}`);
    }
    content = content.slice(s, e + 1);
    console.log("Extracted JSON length:", content.length);

    let questions = [];
    try {
      questions = JSON.parse(content);
    } catch (err) {
      console.error("JSON parse error:", err);
      console.error("Content:", content);
      throw new Error(`JSON解析エラー: ${err.message}. レスポンス: ${content.substring(0, 200)}`);
    }

    console.log("Parsed questions count:", questions.length);
    
    const normalized = (Array.isArray(questions) ? questions : [])
      .slice(0, n)
      .map((q, index) => {
        const choices = Array.isArray(q.choices) ? q.choices.slice(0, 4) : [];
        const normalizedQ = {
          question: String(q.question || "").trim(),
          choices:
            choices.length === 4
              ? choices.map((c) => String(c).trim())
              : ["はい", "いいえ", "わからない", "その他"],
          answer: String(q.answer || choices[0] || "はい").trim(),
          explanation: String(q.explanation || "").trim(),
        };
        
        // バリデーション
        if (!normalizedQ.question) {
          console.warn(`Question ${index} has no question text`);
        }
        if (!normalizedQ.answer) {
          console.warn(`Question ${index} has no answer`);
        }
        
        return normalizedQ;
      })
      .filter(q => q.question && q.answer); // 無効な質問を除外

    console.log("Normalized questions count:", normalized.length);

    if (!normalized.length) {
      console.error("No valid questions after normalization");
      throw new Error("有効なクイズが生成されませんでした。もう一度お試しください。");
    }

    console.log("Successfully generated", normalized.length, "questions");
    return res.status(200).json({ questions: normalized });
  } catch (e) {
    console.error("quiz API error:", e);
    const errorMessage = e.message || "Unknown error occurred";
    const errorStack = e.stack || "";
    const errorName = e.name || "Error";
    
    // エラーの詳細をログに記録
    console.error("Error details:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      type: typeof e,
      keys: Object.keys(e),
    });

    // より詳細なエラー情報を返す
    const errorResponse = {
      error: "quiz_generation_failed",
      message: errorMessage,
      status: 500,
    };

    // 開発環境または詳細情報が必要な場合
    if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development") {
      errorResponse.stack = errorStack;
      errorResponse.name = errorName;
    }

    return res.status(500).json(errorResponse);
  }
};
