// DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Function to add a message to the chat display
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble');
    if (sender === 'user') {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('ai-message');
    }
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
}

// Function to show a temporary loading indicator
function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.classList.add('loading-indicator');
    loadingDiv.textContent = 'Typing...';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to remove the loading indicator
function removeLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Function to send message to Gemini API
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return; // Don't send empty messages

    addMessage(message, 'user'); // Display user's message
    userInput.value = ''; // Clear input field
    sendButton.disabled = true; // Disable send button
    showLoadingIndicator(); // Show loading indicator

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyDNlA57npz-QyVlIEUNb48_77MTfWOB62Y"; //API KEY
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.error.message || 'Unknown error'}`);
        }

        const result = await response.json();
        removeLoadingIndicator(); // Remove loading indicator

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiText = result.candidates[0].content.parts[0].text;
            addMessage(aiText, 'ai'); // Display AI's response
        } else {
            addMessage("Sorry, I couldn't get a response from Gemini. Please try again.", 'ai');
            console.warn("Gemini API response structure unexpected:", result);
        }
    } catch (error) {
        removeLoadingIndicator(); // Remove loading indicator on error
        console.error("Error communicating with Gemini API:", error);
        addMessage("Oops! Something went wrong. Please check your connection or try again later.", 'ai');
    } finally {
        sendButton.disabled = false; // Re-enable send button
        userInput.focus(); // Focus back on input field
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Focus on input when page loads
window.onload = () => {
    userInput.focus();
};
