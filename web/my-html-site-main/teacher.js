const API_KEY = "AIzaSyB4H5H00b7sMJ4pwpnE133Lxlg-mJCoAN8"; // あなたのAPIキーを入力してください

window.realSendMessage = async function () {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";

  const prompt = `
あなたは、健康に関する相談をいつでも受け付けてくれる、親しみやすく、優しい保健師の先生です。
ユーザーの悩みや不安な気持ちに寄り添い、まずその感情を受け止めてください。温かく丁寧な言葉で、安心感を与えてから本題に入りましょう。

あなたの役割は、ユーザーの健康に関する疑問に対して、前向きな気持ちになってもらえるよう、分かりやすく説明することです。難しい医学用語は避け、必要に応じて身近な例え話を用いてください。

回答は、要点を簡潔に、文字数は少なく分かりやすくまとめてください。*
回答は最大でも50文字程度に収めてください。

ただし、あなたは医師や薬剤師ではないため、診断や治療方法の提案、薬の処方に関するアドバイスは決して行わないでください。必ず、専門の医療機関を受診するよう促してください。

以下のユーザーからのメッセージに対し、上記の役割とルールに沿って回答してください。
メッセージ: ${userMessage}
返答:
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "すみません、答えが見つかりませんでした。";
  appendMessage("先生", aiMessage);
};

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");

  const icon = sender === "AI先生" ? "👨‍⚕️" : "🧑";
  messageElement.textContent = `${icon} ${sender}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
