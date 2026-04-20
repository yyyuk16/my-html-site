// templates/teacher.js

// 要素の取得
const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// メッセージを画面に追加する関数
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-message" : "ai-message";
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight; // 最新メッセージまでスクロール
}

// メッセージ送信処理
async function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;
  addMessage("user", "👤 あなた: " + text);
  inputField.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const detailText = await res.text().catch(() => "");
      addMessage("ai", `⚠️ エラー(${res.status}): ${detailText || "サーバーからエラー応答"}`);
      return;
    }

    const data = await res.json().catch(() => ({}));
    const reply = data?.reply ?? "";
    if (reply) {
      addMessage("ai", "👨‍🏫 AI先生: " + reply);
      return;
    }
    // 互換性: 一部バックエンドが {ok:true, reply:"..."} 以外の形でも落ちないように
    if (data?.ok && data?.reply) {
      addMessage("ai", "👨‍🏫 AI先生: " + data.reply);
      return;
    }
    addMessage("ai", "⚠️ エラー: " + (data?.error || data?.detail || "不明なエラー"));
  } catch (err) {
    addMessage("ai", "⚠️ 通信エラー: " + err.message);
  }
}

// ボタンとEnterキーに送信処理を紐づけ
sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
