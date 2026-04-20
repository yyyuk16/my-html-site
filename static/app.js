const API_KEY = "AIzaSyBOOFGOSGoTS2thB5EQBUJhVjSKNVJ4t3Y"; // あなたのAPIキーを入力してください

async function sendMessage() {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    }
  );

  const data = await response.json();
  const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "返答が得られませんでした。";
  appendMessage("AI", aiMessage);
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.textContent = `${sender}: ${message}`;
  chatBox.appendChild(messageElement);
}
