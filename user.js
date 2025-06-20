// Firebaseの設定（あなたのプロジェクト情報に差し替えてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
  // 以下はオプション（必要に応じて）
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  measurementId: "YOUR_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

let socket;
let reconnectInterval = 2000;
let reconnecting = false;
let currentLang = "en"; // デフォルトの翻訳先言語
let userDisplayName = null;

// Firebase 認証状態を監視
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userDisplayName = user.displayName || "匿名ユーザー";
    console.log("✅ ログイン成功:", userDisplayName);
    connectWebSocket(); // ログイン後に WebSocket 接続
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((error) => {
      console.error("❌ ログイン失敗:", error);
    });
  }
});

// WebSocket接続
function connectWebSocket() {
  socket = new WebSocket("ws://localhost:3000/ws");

  socket.addEventListener("open", () => {
    console.log("✅ WebSocket接続完了");
    reconnecting = false;
    if (userDisplayName) {
      socket.send(JSON.stringify({ type: "join", name: userDisplayName }));
    }
  });

  socket.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data);
      const translated = await translateText(data.message, currentLang);
      appendMessage(`${data.name}：${data.message}\n🗣 ${translated}`);
    } catch (e) {
      console.error("❌ メッセージ処理エラー:", e);
    }
  });

  socket.addEventListener("close", () => {
    console.warn("❌ WebSocket切断。再接続を試みます...");
    if (!reconnecting) {
      reconnecting = true;
      setTimeout(() => {
        connectWebSocket();
      }, reconnectInterval);
    }
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket エラー:", error);
  });
}

// メッセージ送信
window.sendMessage = function () {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) return;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "message", name: userDisplayName, message }));
    appendMessage(`🧑‍💬 あなた：${message}`);
    input.value = "";
  } else {
    console.warn("❌ WebSocket未接続。再接続中です...");
    if (!reconnecting) {
      reconnecting = true;
      connectWebSocket();
    }
  }
};

// メッセージ表示
function appendMessage(msg) {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.marginBottom = "10px";
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 翻訳関数（Cloud Translation API）
async function translateText(text, targetLang) {
  const apiKey = "AIzaSyDqfQyKeBtl9f0v8rOzLEocyMFRdxPzJmA"; // Translation APIキー
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: "text",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (json.error) {
      console.error("翻訳APIエラー:", json.error.message);
      return "(翻訳エラー)";
    }

    return json.data?.translations?.[0]?.translatedText || "(翻訳失敗)";
  } catch (err) {
    console.error("翻訳リクエスト失敗:", err);
    return "(翻訳通信エラー)";
  }
}

