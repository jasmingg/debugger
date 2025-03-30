let testingConvoPause = false;
let inCloseup = false; // New state variable
const closeupScale = 2; // Example scale factor for close-up
let originalPlayerWidth;
let originalPlayerHeight;
let originalPlayerPosition = { x: 0, y: 0 };

function enterCloseup() {
  // Hide the regular player
  playerElement.style.display = 'none';

  // Position the close-up sprite in the center (adjust as needed)
  const spriteWidth = 128; // Adjust to your sprite's width
  const spriteHeight = 192; // Adjust to your sprite's height
  const centerX = window.innerWidth / 2 - spriteWidth / 2;
  const centerY = window.innerHeight / 2 - spriteHeight / 2;

  closeupSprite.style.left = centerX + 'px';
  closeupSprite.style.top = centerY + 'px';
  closeupSprite.style.display = 'block'; // Show the close-up sprite

  // Immediately show the chatbox
  showChatbox();
}

const chatboxExitButton = document.getElementById('chatbox-exit-button');

function exitCloseup() {
  inCloseup = false;
  closeupSprite.style.display = 'none'; // Hide the close-up sprite
  playerElement.style.display = 'block'; // Show the regular player
  hideChatbox(); // Hide the chatbox on exit
  testingConvoPause = false; // Allow movement again
  console.log("Chatbox closed via exit button.");
}

chatboxExitButton.addEventListener('click', () => {
    hideChatbox();
    exitCloseup(); // Revert to the regular player view
    testingConvoPause = false; // Allow movement again
    console.log("Chatbox closed via exit button.");
});
