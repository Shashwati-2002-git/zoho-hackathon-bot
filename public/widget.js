(function () {
  const button = document.createElement("div");
  button.id = "zoho-chatbot-button";
  button.style = `
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 60px;
    height: 60px;
    background: #2196F3;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0px 5px 15px rgba(0,0,0,0.25);
    z-index: 999999;
  `;
  button.textContent = "💬";

  const chatbox = document.createElement("div");
  chatbox.id = "zoho-chatbot-box";
  chatbox.style = `
    position: fixed;
    bottom: 100px;
    right: 25px;
    width: 360px;
    height: 470px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.18);
    display: none;
    overflow: hidden;
    flex-direction: column;
    animation: slideUp 0.25s ease-in-out;
    z-index: 999999;
  `;

  chatbox.innerHTML = `
    <style>
      @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .zoho-bubble {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        margin-bottom: 10px;
        line-height: 1.4;
        font-size: 14px;
      }
      .user-msg {
        background: #2196F3;
        color: white;
        align-self: flex-end;
      }
      .bot-msg {
        background: #F5F5F5;
        border-left: 4px solid #FFC107;
        color: #1A1A1A;
      }
      #zoho-header {
        background: linear-gradient(90deg, #F44336, #FFC107, #4CAF50, #2196F3);
        color:white;
        text-align:center;
        padding:14px;
        font-weight:bold;
        font-size:16px;
        letter-spacing:.4px;
      }
    </style>

    <div id="zoho-header">Zobot - Zoho Web Assistant</div>

    <div id="zoho-messages" style="
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      background: white;
    "></div>

    <div style="display: flex; padding: 10px; border-top:1px solid #ddd;">
      <input id="zoho-input" placeholder="Type a message..." style="
        flex:1;padding:10px;border:1px solid #ccc;border-radius:8px;
      ">
      <button id="zoho-send" style="
        background:#2196F3;color:white;padding:10px 16px;margin-left:6px;
        border:none;border-radius:8px;cursor:pointer;
      ">➤</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(chatbox);

  const messages = document.getElementById("zoho-messages");
  const input = document.getElementById("zoho-input");
  const sendButton = document.getElementById("zoho-send");

  function addBubble(text, sender = "bot") {
    const bubble = document.createElement("div");
    bubble.className = `zoho-bubble ${sender === "user" ? "user-msg" : "bot-msg"}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  // ------- Updated Feature: Welcome message --------
  button.onclick = () => {
    const isClosed = chatbox.style.display === "none" || !chatbox.style.display;
    chatbox.style.display = isClosed ? "flex" : "none";

    if (isClosed && !sessionStorage.getItem("zoho_welcome_shown")) {
      setTimeout(() => {
        addBubble("👋 Hello! Welcome to this webpage.", "bot");
        addBubble("How can I assist you today?", "bot");
      }, 300);
      sessionStorage.setItem("zoho_welcome_shown", "true");
    }
  };

  async function sendChat() {
    const text = input.value.trim();
    if (!text) return;
    addBubble(text, "user");
    input.value = "";
    addBubble("Typing...", "bot");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, url: location.href }),
      });

      const data = await res.json();
      messages.removeChild(messages.lastChild);
      addBubble(data.reply, "bot");

    } catch (e) {
      addBubble("⚠️ Error contacting server.", "bot");
    }
  }

  sendButton.onclick = sendChat;
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendChat());
})();