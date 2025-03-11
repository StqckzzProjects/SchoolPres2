const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('mode');

const player1Key = localStorage.getItem('player1Key') || ' ';
const player2Key = localStorage.getItem('player2Key') || 'ArrowUp';
const player3Key = localStorage.getItem('player3Key') || 'w';
const player4Key = localStorage.getItem('player4Key') || 'ArrowDown';
const player1Name = localStorage.getItem('player1Name') || 'Player 1';
const player2Name = localStorage.getItem('player2Name') || 'Player 2';
const player3Name = localStorage.getItem('player3Name') || 'Player 3';
const player4Name = localStorage.getItem('player4Name') || 'Player 4';

const gravity = 0.4;
const jumpPower = -8;
let gameRunning = true;
let score = 0;
let obstacles = [];
let frameCount = 0;

const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');
const backToMenuButton = document.getElementById('back-to-menu-button');
const pauseMenu = document.getElementById('pause-menu');

// Load skins for up to 4 players
const playerSkins = [
  new Image(), // Player 1 skin
  new Image(), // Player 2 skin
  new Image(), // Player 3 skin
  new Image()  // Player 4 skin
];

playerSkins[0].src = 'pixel-bird.png';      // Default skin for Player 1
playerSkins[1].src = 'pixel-bird-2.png';    // Skin for Player 2
playerSkins[2].src = 'pixel-bird-3.png';    // Skin for Player 3 (optional)
playerSkins[3].src = 'pixel-bird-4.png';    // Skin for Player 4 (optional)

const pipeSprite = new Image();
pipeSprite.src = 'pixel-pipe.png';

// Create player array based on game mode
const players = gameMode === 'multi' || gameMode === 'race'
  ? [
      { x: 150, y: 300, width: 30, height: 30, velocity: 0, name: player1Name, key: player1Key, isDead: false, skin: playerSkins[0] },
      { x: 200, y: 300, width: 30, height: 30, velocity: 0, name: player2Name, key: player2Key, isDead: false, skin: playerSkins[1] },
      { x: 250, y: 300, width: 30, height: 30, velocity: 0, name: player3Name, key: player3Key, isDead: false, skin: playerSkins[2] },
      { x: 300, y: 300, width: 30, height: 30, velocity: 0, name: player4Name, key: player4Key, isDead: false, skin: playerSkins[3] }
    ]
  : [{ x: 150, y: 300, width: 30, height: 30, velocity: 0, name: player1Name, key: player1Key, isDead: false, skin: playerSkins[0] }];

// Main game update loop
function update() {
  if (!gameRunning) return;

  players.forEach(player => {
    if (!player.isDead) {
      player.velocity += gravity;
      player.y += player.velocity;
      if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    }
  });

  if (frameCount % 100 === 0) {
    const gapHeight = 140;
    const gapY = Math.random() * (canvas.height - gapHeight);
    obstacles.push({ x: canvas.width, y: 0, width: 50, height: gapY });
    obstacles.push({ x: canvas.width, y: gapY + gapHeight, width: 50, height: canvas.height - gapY - gapHeight });
  }

  obstacles.forEach(obs => obs.x -= 5);
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  checkCollision();
  frameCount++;
  score++;
  draw();
  requestAnimationFrame(update);
}

// Draw all game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  players.forEach(player => {
    if (!player.isDead) {
      ctx.drawImage(player.skin, player.x, player.y, player.width, player.height); // Use player-specific skin
    }
  });

  obstacles.forEach(obs => {
    ctx.drawImage(pipeSprite, obs.x, obs.y, obs.width, obs.height);
  });

  ctx.fillStyle = 'black';
  ctx.font = '24px PixelFont';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Check for collision between players and obstacles
function checkCollision() {
  players.forEach(player => {
    if (player.isDead) return;

    obstacles.forEach(obs => {
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        player.isDead = true;
        announceDeath(player.name);
      }
    });

    if (player.y + player.height >= canvas.height || player.y <= 0) {
      player.isDead = true;
      announceDeath(player.name);
    }
  });

  // If all players are dead, end the game
  if (gameMode === 'race' && players.every(player => player.isDead)) {
    endGame("All players died!");
  }
}

// Announce player death in race mode
function announceDeath(playerName) {
  const alivePlayers = players.filter(player => !player.isDead);

  if (alivePlayers.length > 0) {
    if (gameMode === 'race') {
      gameOverMessage.textContent = `${playerName} has been eliminated!`;
      gameOverScreen.style.display = 'block';
      restartButton.style.display = 'none';
      backToMenuButton.style.display = 'none';

      setTimeout(() => {
        gameOverScreen.style.display = 'none';
      }, 2500);
    }
  } else {
    endGame("Race Over!");
  }
}

// End the game with a message
function endGame(message) {
  gameRunning = false;
  gameOverMessage.textContent = message;
  gameOverScreen.style.display = 'block';

  restartButton.style.display = 'block';
  backToMenuButton.style.display = 'block';

  canvas.style.display = 'none';
}

// Restart the game
function restartGame() {
  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';

  players.forEach(player => {
    player.y = 300;
    player.velocity = 0;
    player.isDead = false;
  });

  obstacles = [];
  score = 0;
  frameCount = 0;
  gameRunning = true;
  update();
}

// Go back to the main menu
function goToMenu() {
  window.location.href = 'index.html';
}

// Pause the game
function togglePause() {
  if (gameRunning) {
    gameRunning = false;
    pauseMenu.style.display = 'block';
  } else {
    gameRunning = true;
    pauseMenu.style.display = 'none';
    update();
  }
}

document.getElementById('restart-button').addEventListener('click', restartGame);
document.getElementById('back-to-menu-button').addEventListener('click', goToMenu);

document.addEventListener('DOMContentLoaded', () => {
  gameRunning = true;
  update();
});

window.addEventListener('keydown', (e) => {
  players.forEach(player => {
    if (e.key === player.key && !player.isDead) {
      player.velocity = jumpPower;
    }
  });
});
