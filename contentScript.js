const API_KEY = "AIzaSyArRCIUYByTFx3ReLudC0IXbuy0-xetqDU";

// Create chatbot toggle button
const chatbotToggle = document.createElement("button");
chatbotToggle.id = "chatbot-toggle";
chatbotToggle.textContent = "💬"; // Small bubble button
document.body.appendChild(chatbotToggle);

// Create chatbot container (hidden by default)
const chatbotContainer = document.createElement("div");
chatbotContainer.id = "chatbot-container";
chatbotContainer.style.display = "none"; // Initially hidden

// Chat window
chatbotContainer.innerHTML = `
  <div id="chatbot-header">
    💬 AI Chatbot 
    <span id="chatbot-close" style="cursor:pointer; float:right;">✖</span>
  </div>
  <div id="chatbot-messages"></div>
  <div id="chatbot-input-area">
    <input type="text" id="chatbot-input" placeholder="Type your question..." />
    <button id="chatbot-send">Send</button>
  </div>
`;

document.body.appendChild(chatbotContainer);

// Elements
const messagesDiv = document.getElementById("chatbot-messages");
const inputField = document.getElementById("chatbot-input");
const sendButton = document.getElementById("chatbot-send");
const closeButton = document.getElementById("chatbot-close");

// Toggle open chatbot
chatbotToggle.addEventListener("click", () => {
  chatbotContainer.style.display = "flex";
  chatbotToggle.style.display = "none";
});

// Close chatbot -> back to button
closeButton.addEventListener("click", () => {
  chatbotContainer.style.display = "none";
  chatbotToggle.style.display = "block";
});

// Function to add messages
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `chatbot-message ${sender}`;
  msg.textContent = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to grab code from LeetCode editor
function getCodeFromEditor() {
  const codeDiv = document.querySelector('div.view-lines.monaco-mouse-cursor-text');
  if (codeDiv) {
    return codeDiv.innerText; // full code as plain text
  }
  return null;
}

// Function to grab problem statement from meta description
function getProblemStatement() {
  const metaTag = document.querySelector('meta[name="description"]');
  if (metaTag) {
    return metaTag.getAttribute("content");
  }
  return null;
}

// AI API call (Gemini)
async function getAIResponse(userMessage) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Response from Gemini API:", data);

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Sorry, I couldn’t generate a response.";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Error connecting to AI.";
  }
}

// Handle send
sendButton.addEventListener("click", async () => {
  const userText = inputField.value.trim();
  const problemStatement = getProblemStatement();
  const codeFromEditor = getCodeFromEditor();

  // Build full prompt
  let fullPrompt = "";

  if (problemStatement) {
    fullPrompt += "Problem Statement:\n" + problemStatement + "\n\n";
  }

  if (codeFromEditor) {
    fullPrompt += "Code:\n" + codeFromEditor + "\n\n";
  }

  if (userText) {
    fullPrompt += " User Question:\n" + userText;
  }

  if (!fullPrompt) {
    addMessage("Nothing to send. Please enter text or ensure code/problem statement exists.", "bot");
    return;
  }
   fullPrompt += "coding language used is java and first give the hint to solve the code ";
  
  inputField.value = "";

  // Show loading text
  addMessage("Thinking...", "bot");

  const response = await getAIResponse(fullPrompt);

  
  messagesDiv.lastChild.remove();

  addMessage(response, "bot");
});

// Enter key support
inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});
