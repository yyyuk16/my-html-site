// server.js

// Firebase Admin SDK を使う（サーバー用）
const admin = require('firebase-admin');

// 自分のサービスアカウントキー（ダウンロードしたJSONファイル）
const serviceAccount = require('./serviceAccountKey.json'); // ←ファイル名は実際のJSONファイル名に合わせて

// Firebase 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://web01-2484d-default-rtdb.firebaseio.com' // あなたのFirebase URLに置き換える
});

const db = admin.database();

// チャットにメッセージを書き込む例
function sendMessage(text) {
  db.ref('messages').push({
    text: text,
    timestamp: Date.now()
  }).then(() => {
    console.log('メッセージを送信しました:', text);
  });
}

// 実行例
sendMessage("こんにちは、これはNode.jsから送信したメッセージです！");

// メッセージをリアルタイムで監視
db.ref('messages').on('child_added', (snapshot) => {
  const msg = snapshot.val();
  console.log(`[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.text}`);
});
