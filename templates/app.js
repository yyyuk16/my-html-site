<<<<<<< HEAD
const API_KEY = "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"; // OpenAI APIキー

async function sendMessage() {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 500,
        temperature: 0.7
      })
    }
  );

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content || "返答が得られませんでした。";
  appendMessage("AI", aiMessage);
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.textContent = `${sender}: ${message}`;
  chatBox.appendChild(messageElement);
}
=======

async function sendMessage() {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("あなた", userMessage);
  input.value = "";

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 500,
        temperature: 0.7
      })
    }
  );

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content || "返答が得られませんでした。";
  appendMessage("AI", aiMessage);
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.textContent = `${sender}: ${message}`;
  chatBox.appendChild(messageElement);
}
>>>>>>> 21d985d (first commit)
