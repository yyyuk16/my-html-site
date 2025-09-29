// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// 静的ファイルを配信（teacher.html, teacher.js などを同ディレクトリに置いた場合）
app.use(express.static(__dirname));

// .env に OPENAI_API_KEY=sk-xxxx を保存
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.warn("OPENAI_API_KEY が設定されていません。`.env` を確認してください。");
}

// チャット用プロキシ（キーはサーバーだけが知っている）
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "invalid_message" });
    }

    // OpenAI Chat Completions API へのリクエスト
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "あなたは親しみやすい保健師。まず感情を受け止め、難解な用語を避け、" +
              "最大100字で安心感のある助言を返す。診断や治療の指示は避け、必要時は医療機関受診を勧める。"
          },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(openaiRes.status).json(data);
    }

    const reply = data?.choices?.[0]?.message?.content ?? "";
    res.json({ reply });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// 翻訳プロキシ
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "invalid_text" });
    }
    const lang = (targetLang || "ja").trim();
    const systemPrompt = `You are a translation engine. Translate the user's message into ${lang} using concise, natural wording. Return only the translated text.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        max_tokens: 200,
        temperature: 0.2
      })
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error("OpenAI translate error:", data);
      return res.status(openaiRes.status).json(data);
    }
    const translated = data?.choices?.[0]?.message?.content?.trim?.() ?? "";
    res.json({ translated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// ルートで teacher.html を返したい場合（ファイル名が teacher.html のとき）
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "teacher.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
