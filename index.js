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