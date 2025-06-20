const API_KEY = "AIzaSyB4H5H00b7sMJ4pwpnE133Lxlg-mJCoAN8"; // あなたのAPIキーを入力してください

window.realSendMessage = async function () {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";

  const prompt = `
以下のメッセージに対して、ともだちのような優しくて親しみやすい口調で、タメ口で返事をしてください。
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
  const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "うーん、うまく答えられなかったよ〜。";
  appendMessage("ともだち", aiMessage);
};

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");

  const icon = sender === "ともだち" ? "👦" : "🧑";
  messageElement.textContent = `${icon} ${sender}: ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
