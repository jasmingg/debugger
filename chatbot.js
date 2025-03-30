const chatboxContainer = document.getElementById('chatbox-container');
const chatboxMessages = document.getElementById('chatbox-messages');
const chatboxInput = document.getElementById('chatbox-input');
const chatboxSendButton = document.getElementById('chatbox-send-button');
let canSendMessage = false;

function addChatMessage(message, sender) {
    const chatboxMessages = document.getElementById('chatbox-messages');
    chatboxMessages.innerHTML = ''; // Clear previous message

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.classList.add(sender);
    messageDiv.textContent = `${sender === 'user' ? 'You' : 'Miss Java'}: `; // Add sender prefix

    chatboxMessages.appendChild(messageDiv);

    let charIndex = 0;
    const typingSpeed = 30; // Adjust for faster/slower typing (milliseconds per character)
    const botMessageContent = message;
    const messageSpan = document.createElement('span'); // Span to hold the typing text
    messageDiv.appendChild(messageSpan);

    let typingSound;

    function playTypingSound() {
        if (!typingSound) {
            typingSound = new Audio('retro-spider.wav'); // Spiders talking sound effect
            typingSound.loop = true; // Loop the sound
            typingSound.volume = 0.5; // Adjust volume as needed
        }
        typingSound.play();
    }

    function stopTypingSound() {
        if (typingSound) {
            typingSound.pause();
            typingSound.currentTime = 0; // Reset to the beginning
        }
    }

    function typeWriter() {
        if (charIndex < botMessageContent.length) {
            messageSpan.textContent += botMessageContent.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Typing is complete
            stopTypingSound();
        }
    }

    if (sender === 'bot') {
        playTypingSound();
        typeWriter();
    } else {
        messageSpan.textContent = message; // For user messages, display immediately
    }

    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

chatboxInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && canSendMessage) {
        sendMessage(); // Call the sendMessage function
    }
});

chatboxSendButton.addEventListener('click', () => {
    sendMessage(); // Call the sendMessage function
});

function sendMessage() {
    if (canSendMessage && chatboxInput.value.trim() !== '') {
        const userMessage = chatboxInput.value;
        addChatMessage(userMessage, 'user');
        chatboxInput.value = ''; // Clear the input field
        chatboxInput.focus(); // Set focus back to the input field
        window.sendMessageToGemini(userMessage); // Call the global function in index.js
    }
    console.log("Send button clicked.");
        console.log("Input field has focus:", document.activeElement === chatboxInput);
}

function showChatbox() {
    chatboxContainer.style.display = 'block';
    chatboxInput.focus();
    canSendMessage = true;
}

function hideChatbox() {
    chatboxContainer.style.display = 'none';
    canSendMessage = false;
}