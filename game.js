const backgroundMusic = document.getElementById('backgroundMusic');
let musicPlayed = false;

document.addEventListener('click', function playOnFirstInteraction() {
    if (!musicPlayed) {
        backgroundMusic.play().catch(error => {
            console.error("Error playing music:", error);
        });
        musicPlayed = true;
        document.removeEventListener('click', playOnFirstInteraction);
        document.removeEventListener('keydown', playOnFirstInteraction);
    }
});

document.addEventListener('keydown', function playOnFirstInteraction() {
    if (!musicPlayed) {
        backgroundMusic.play().catch(error => {
            console.error("Error playing music:", error);
        });
        musicPlayed = true;
        document.removeEventListener('click', playOnFirstInteraction);
        document.removeEventListener('keydown', playOnFirstInteraction);
    }
});

const playerElement = document.getElementById('player');
playerElement.style.display = 'block'; // Ensure the player is visible
let playerX = 100;
let playerY = 100;
const moveSpeed = 25;
let isMoving = false;

const targetSpider = document.getElementById('Spider');
let SpiderX = 520;
let SpiderY = 200;

const proximityThreshold = 40;
let testingConvoPause = false;
let inCloseup = false; // State variable for close-up

const closeupSprite = document.getElementById('closeup-sprite');
const backgroundElement = document.getElementById('background'); // Get the background element

const MODEL_NAME = 'gemini-2.0-flash';

GEMINI_API_KEY = ''; // Replace with your actual API key

async function callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    const headers = {
        'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
        contents: [{
            role: 'user',
            parts: [{ text: prompt }],
        }],
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });
        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            console.error('Gemini API Error:', data.error);
            return `Error from Gemini API: ${data.error.message}`;
        } else {
            return 'No valid response from Gemini API.';
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return `Error calling Gemini API: ${error.message}`;
    }
}

playerElement.style.position = 'absolute';
targetSpider.style.position = 'absolute';
playerElement.style.left = playerX + 'px';
playerElement.style.top = playerY + 'px';
targetSpider.style.left = SpiderX + 'px';
targetSpider.style.top = SpiderY + 'px';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.overflow = 'hidden';

let verticalMoveCounter = 0;
let horizontalMoveCounter = 0;
let lastDirection = null;
const animationCycle = 50;

function updatePlayerAppearance() {
    let backgroundImage = "";
    let transform = "";

    if (lastDirection === 'vertical') {
        if (verticalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-vertical-1.png')";
        } else {
            backgroundImage = "url('monty-vertical-2.png')";
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
            transform = "scaleY(-1)";
        }
    } else if (lastDirection === 'horizontal') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
            transform = "scaleX(-1)";
        }
    } else if (lastDirection === 'up-left') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleX(-1)";
    } else if (lastDirection === 'up-right') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = ""; // No flip needed for basic 'right' facing
    } else if (lastDirection === 'down-left') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleX(-1) scaleY(-1)";
    } else if (lastDirection === 'down-right') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleY(-1)"; // Assuming the base horizontal faces left, flipping Y makes it down-left, so we need to NOT flip X here. Adjust if your base horizontal faces right.
    } else {
        backgroundImage = "url('monty-default.png')";
    }

    playerElement.style.backgroundImage = backgroundImage;
    playerElement.style.transform = transform;
    playerElement.style.backgroundSize = 'contain';
    playerElement.style.backgroundRepeat = 'no-repeat';
}
function updatePlayerPosition() {
    if (!testingConvoPause && !inCloseup && isMoving) { // Check !inCloseup here
        playerElement.style.left = playerX + 'px';
        playerElement.style.top = playerY + 'px';
        updatePlayerAppearance();
        checkProximity();
    } else if (!isMoving) {
        lastDirection = null;
        updatePlayerAppearance();
    }
}

function renderSpiderPosition() {
    targetSpider.style.left = SpiderX + 'px';
    targetSpider.style.top = SpiderY + 'px';
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function enterCloseup() {
    playerElement.style.display = 'none';
    const spriteWidth = 128;
    const spriteHeight = 90;
    targetSpider.style.display = 'none';

    const centerX = window.innerWidth / 2 - spriteWidth / 2;
    const centerY = window.innerHeight / 2 - spriteHeight / 2;
    closeupSprite.style.width = `${spriteWidth * 5}px`; // Scale the sprite for close-up
    closeupSprite.style.height = `${spriteHeight * 5}px`; // Scale the sprite for close-up
    closeupSprite.style.left = centerX + 'px';
    closeupSprite.style.top = (centerY - 250) + 'px';
    closeupSprite.style.display = 'block';
    showChatbox(); // Assuming showChatbox is defined in chatbot.js and loaded
    backgroundElement.classList.add('fade-in-background'); // Add the animation class
}


function exitCloseup() {
    inCloseup = false;
    closeupSprite.style.display = 'none';
    playerElement.style.display = 'block';
    targetSpider.style.display = 'block';
    hideChatbox();
    testingConvoPause = false;
    backgroundElement.classList.remove('fade-in-background'); // Remove the animation class
    console.log("Chatbox closed via exit button.");
}

async function handleProximityReached() {
    if (!testingConvoPause && !inCloseup) { // Check !inCloseup
        testingConvoPause = true;
        inCloseup = true;
        console.log("PROXIMITY TRUE! Initiating close-up scene...");
        enterCloseup();
    }
}

function checkProximity() {
    const playerCenter = getElementCenter(playerElement);
    const SpiderCenter = getElementCenter(targetSpider);
    const distanceX = Math.abs(playerCenter.x - SpiderCenter.x);
    const distanceY = Math.abs(playerCenter.y - SpiderCenter.y);

    if (distanceX < proximityThreshold && distanceY < proximityThreshold) {
        handleProximityReached();
    } else if (testingConvoPause && !inCloseup) {
        testingConvoPause = false;
        window.hideChatbox(); // Assuming hideChatbox is global
        console.log("PROXIMITY FALSE! Movement resumed.");
    }
}

async function callGeminiAPIAsMissJava(userPrompt) {
    const characterName = "Miss Java";
    const characterDescription = "An aloof but witty lady who's goal is to withold information about the bug in the Woods from the user while testing their composure";
    const fullPrompt = `The user says: "${userPrompt}". There is a bug in the woods and the user is trying to learn more about it. Little do they know that the bug is a part of them.
        Your primary goal is to test the user's composure as ${characterName}, ${characterDescription}.
        CRUCIAL: Converse with the user about basic programming concepts in Python. Be concise, like an undertale character. Use short sentences and avoid long explanations.
        You want only give in and answer the user's questions if they can solve one question. Guide them towards the answer.
        If the user answers just ONE riddle correctly and respectfully, acknowledge their intelligence and offer a small compliment. Then, reveal the piece of insider information about the "bug",
        ending the conversation by revealing the similarities between the user and the bug.`;

    const geminiResponse = await callGeminiAPI(fullPrompt);
    if (geminiResponse) {
        window.addChatMessage(geminiResponse, 'bot'); // Assuming addChatMessage is global
        if (geminiResponse.toLowerCase().includes("silly bug")) {
            window.hideChatbox(); // Assuming hideChatbox is global
            testingConvoPause = false;
            inCloseup = false; // Reset close-up state on chat end
            playerElement.style.display = 'block'; // Ensure player reappears
            console.log("Miss Java said 'silly bug', ending chat.");
        }
    }
}

// Make callGeminiAPIAsMissJava accessible globally
window.sendMessageToGemini = callGeminiAPIAsMissJava;

const keysPressed = {};
document.addEventListener('keydown', (event) => {
    if (!testingConvoPause && !inCloseup) { // Check !inCloseup
        keysPressed[event.key] = true;
        isMoving = true;
    } else if (inCloseup && event.key === 'Escape') {
        exitCloseup();
    }
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    const movingKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
    isMoving = movingKeys.some(key => keysPressed[key]);
});

let moveAccumulatorX = 0;
let moveAccumulatorY = 0;
function gameLoop() {
    if (!testingConvoPause && !inCloseup) {
        let moved = false;
        let dx = 0;
        let dy = 0;

        if (keysPressed['ArrowUp'] || keysPressed['w']) {
            dy -= moveSpeed / 10;
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
            dy += moveSpeed / 10;
        }
        if (keysPressed['ArrowLeft'] || keysPressed['a']) {
            dx -= moveSpeed / 10;
        }
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
            dx += moveSpeed / 10;
        }

        if (dx !== 0 && dy !== 0) {
            const diagonalSpeedFactor = 1 / Math.sqrt(2);
            moveAccumulatorX += dx * diagonalSpeedFactor;
            moveAccumulatorY += dy * diagonalSpeedFactor;
        } else {
            moveAccumulatorX += dx;
            moveAccumulatorY += dy;
        }

        let actualMoveX = Math.floor(moveAccumulatorX);
        let actualMoveY = Math.floor(moveAccumulatorY);

        if (Math.abs(actualMoveX) >= 1) {
            playerX += actualMoveX;
            horizontalMoveCounter += Math.abs(actualMoveX);
            moveAccumulatorX -= actualMoveX;
            moved = true;
        }
        if (Math.abs(actualMoveY) >= 1) {
            playerY += actualMoveY;
            verticalMoveCounter += Math.abs(actualMoveY);
            moveAccumulatorY -= actualMoveY;
            moved = true;
        }

        if (keysPressed['ArrowUp'] || keysPressed['w']) {
            if (keysPressed['ArrowLeft'] || keysPressed['a']) lastDirection = 'up-left';
            else if (keysPressed['ArrowRight'] || keysPressed['d']) lastDirection = 'up-right';
            else lastDirection = 'vertical';
        } else if (keysPressed['ArrowDown'] || keysPressed['s']) {
            if (keysPressed['ArrowLeft'] || keysPressed['a']) lastDirection = 'down-left';
            else if (keysPressed['ArrowRight'] || keysPressed['d']) lastDirection = 'down-right';
            else lastDirection = 'vertical';
        } else if (keysPressed['ArrowLeft'] || keysPressed['a']) {
            lastDirection = 'horizontal';
        } else if (keysPressed['ArrowRight'] || keysPressed['d']) {
            lastDirection = 'horizontal';
        } else if (!isMoving) {
            lastDirection = null;
        }

        if (moved) {
            updatePlayerPosition();
        } else if (!isMoving) {
            updatePlayerAppearance();
        }
    }
    requestAnimationFrame(gameLoop);
}

// Initial calls
updatePlayerAppearance();
updatePlayerPosition();
renderSpiderPosition();

// Start the game loop
requestAnimationFrame(gameLoop);

// Exit button functionality (assuming it's in the same HTML)
const chatboxExitButton = document.getElementById('chatbox-exit-button');
if (chatboxExitButton) {
    chatboxExitButton.addEventListener('click', () => {
        hideChatbox(); // Assuming hideChatbox is global
        exitCloseup();
        testingConvoPause = false;
    });
}

// Ensure closeupSprite is initially hidden
const closeupSpriteElement = document.getElementById('closeup-sprite');
if (closeupSpriteElement) {
    closeupSpriteElement.style.display = 'none';
}