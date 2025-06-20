const socket = new WebSocket("ws://localhost:3001"); // サーバーのWebSocket URL

// メッセージが送信されるたびに呼ばれる
socket.onmessage = function(event) {
  const chatLog = document.getElementById("chatLog");
  const msg = document.createElement("div");
  msg.textContent = event.data;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
};

// メッセージ送信
function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  
  // メッセージが空でない場合のみ送信
  if (message) {
    // 文字列として送信（Blobや他のオブジェクトではなく、文字列を送信）
    socket.send(message); // 文字列をそのまま送信
    input.value = ""; // 送信後、入力フィールドをクリア
  }
}

// 戻るボタンの動作
function goBack() {
  window.location.href = "index.html";
}
