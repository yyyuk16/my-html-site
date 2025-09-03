const axios = require('axios');

// Gemini APIを呼び出す関数
exports.chatWithGemini = async (req, res) => {
  const message = req.body.message;

  try {
    // Gemini APIにリクエストを送信
    const response = await axios.post(
      'AIzaSyARtIeRIZy2nt0NK0t0dJOoBrUheO440Qw',  // 仮のAPIエンドポイント
      {
        model: "gemini-model", // 使用するGeminiのモデル
        prompt: message,
        max_tokens: 100,  // 返答の長さを設定
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_GOOGLE_API_KEY`,  // ここにAPIキーを挿入
        },
      }
    );

    const aiResponse = response.data.reply;
    res.send({ reply: aiResponse });

  } catch (error) {
    console.error('Error interacting with Gemini:', error);
    res.status(500).send('Error communicating with Gemini');
  }
};
