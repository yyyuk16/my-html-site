const functions = require('firebase-functions');
const { chatWithGemini } = require('./geminiChat');  // geminiChat.jsのインポート

// エクスポートして、Firebase Functionsとして利用できるようにする
exports.chatWithGemini = functions.https.onRequest(chatWithGemini);
