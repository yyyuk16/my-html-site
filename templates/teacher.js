<<<<<<< HEAD
// teacher.js
// フロントは Vercel の API を叩くだけ。OpenAI の鍵はサーバー側だけが保持します。

// ▼ここをあなたの Vercel ドメインに置き換える（例）https://my-ai-chat.vercel.app
const API_BASE = "https://my-html-site-hazel.vercel.app";

// ========== UIヘルパ ==========
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}

function appendMessage(sender, message) {
  const chatContainer = document.getElementById("chatContainer");
  const wrapper = document.createElement("div");
  wrapper.classList.add("flex");

  if (sender === "あなた") {
    wrapper.classList.add("justify-end");
    wrapper.innerHTML = `
      <div class="text-white p-3 rounded-[16px] max-w-[80%] shadow-md"
           style="background: linear-gradient(135deg, #A5D6A7 0%, #2E7D32 100%);">
        ${escapeHtml(message)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="bg-white p-3 rounded-[16px] max-w-[80%] shadow-sm border border-[#E8F5E9]">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-2xl">👨‍⚕️</span>
          <span class="font-semibold text-[#43A047]">${escapeHtml(sender)}</span>
        </div>
        <p class="text-[#1A1A1A] whitespace-pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;
  }
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendLoadingMessage() {
  const chatContainer = document.getElementById("chatContainer");
  const loadingId = "loading-" + Date.now();
  const el = document.createElement("div");
  el.id = loadingId;
  el.classList.add("flex");
  el.innerHTML = `
    <div class="bg-white p-3 rounded-[16px] max-w-[80%] shadow-sm border border-[#E8F5E9]">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-2xl">👨‍⚕️</span>
        <span class="font-semibold text-[#43A047]">AI先生</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#43A047]"></div>
        <span class="text-[#666]">考え中...</span>
      </div>
    </div>
  `;
  chatContainer.appendChild(el);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return loadingId;
}

function removeLoadingMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ========== 送信メイン ==========
window.realSendMessage = async function () {
  const input = document.getElementById("userInput");
  const userMessage = (input?.value || "").trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";
  const loadingId = appendLoadingMessage();

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    // 応答処理
    let data = null;
    try { data = await res.json(); } catch (e) { /* 応答がJSONでない場合に備える */ }

    removeLoadingMessage(loadingId);

    if (!res.ok) {
      const errMsg =
        (data && (data.error?.message || data.error)) ||
        `通信エラー (${res.status})`;
      appendMessage("AI先生", `申し訳ありません。${errMsg} が発生しました。`);
      return;
    }

    const reply = data?.reply || "うまく応答できませんでした。";
    appendMessage("AI先生", reply);

  } catch (err) {
    console.error("Chat error:", err);
    removeLoadingMessage(loadingId);
    appendMessage("AI先生", "通信に問題が発生しました。時間をおいて再度お試しください。");
  }
};

// ========== 初期セットアップ ==========
window.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chatContainer");
  if (chatContainer) {
    chatContainer.innerHTML = "";
    appendMessage(
      "AI先生",
      "こんにちは。気になることは何でも話してください。私は医師ではないため診断はできませんが、安心につながる情報を100字以内でお伝えします。"
    );
  }

  // Enter で送信（HTML側でも設定している場合は二重送信に注意）
  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") window.realSendMessage();
    });
  }
});
=======
// teacher.js
// フロントは Vercel の API を叩くだけ。OpenAI の鍵はサーバー側だけが保持します。

// ▼ここをあなたの Vercel ドメインに置き換える（例）https://my-ai-chat.vercel.app
const API_BASE = "https://my-html-site-hazel.vercel.app";

// ========== UIヘルパ ==========
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}

function appendMessage(sender, message) {
  const chatContainer = document.getElementById("chatContainer");
  const wrapper = document.createElement("div");
  wrapper.classList.add("flex");

  if (sender === "あなた") {
    wrapper.classList.add("justify-end");
    wrapper.innerHTML = `
      <div class="text-white p-3 rounded-[16px] max-w-[80%] shadow-md"
           style="background: linear-gradient(135deg, #A5D6A7 0%, #2E7D32 100%);">
        ${escapeHtml(message)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="bg-white p-3 rounded-[16px] max-w-[80%] shadow-sm border border-[#E8F5E9]">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-2xl">👨‍⚕️</span>
          <span class="font-semibold text-[#43A047]">${escapeHtml(sender)}</span>
        </div>
        <p class="text-[#1A1A1A] whitespace-pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;
  }
  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendLoadingMessage() {
  const chatContainer = document.getElementById("chatContainer");
  const loadingId = "loading-" + Date.now();
  const el = document.createElement("div");
  el.id = loadingId;
  el.classList.add("flex");
  el.innerHTML = `
    <div class="bg-white p-3 rounded-[16px] max-w-[80%] shadow-sm border border-[#E8F5E9]">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-2xl">👨‍⚕️</span>
        <span class="font-semibold text-[#43A047]">AI先生</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#43A047]"></div>
        <span class="text-[#666]">考え中...</span>
      </div>
    </div>
  `;
  chatContainer.appendChild(el);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return loadingId;
}

function removeLoadingMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ========== 送信メイン ==========
window.realSendMessage = async function () {
  const input = document.getElementById("userInput");
  const userMessage = (input?.value || "").trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";
  const loadingId = appendLoadingMessage();

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    // 応答処理
    let data = null;
    try { data = await res.json(); } catch (e) { /* 応答がJSONでない場合に備える */ }

    removeLoadingMessage(loadingId);

    if (!res.ok) {
      const errMsg =
        (data && (data.error?.message || data.error)) ||
        `通信エラー (${res.status})`;
      appendMessage("AI先生", `申し訳ありません。${errMsg} が発生しました。`);
      return;
    }

    const reply = data?.reply || "うまく応答できませんでした。";
    appendMessage("AI先生", reply);

  } catch (err) {
    console.error("Chat error:", err);
    removeLoadingMessage(loadingId);
    appendMessage("AI先生", "通信に問題が発生しました。時間をおいて再度お試しください。");
  }
};

// ========== 初期セットアップ ==========
window.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chatContainer");
  if (chatContainer) {
    chatContainer.innerHTML = "";
    appendMessage(
      "AI先生",
      "こんにちは。気になることは何でも話してください。私は医師ではないため診断はできませんが、安心につながる情報を100字以内でお伝えします。"
    );
  }

  // Enter で送信（HTML側でも設定している場合は二重送信に注意）
  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") window.realSendMessage();
    });
  }
});
>>>>>>> 21d985d (first commit)
