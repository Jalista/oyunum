const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun değişkenleri
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const AI_SPEED = 2.5; // Yapay zeka hızı
const AI_ERROR_MARGIN = 30; // AI hatası için aralık
const SPEED_INCREMENT = 0.15; // Hız artışı
const DEFAULT_SPEED = 1; // Varsayılan hız
const MAX_PLAYER_LIVES = 10; // Oyuncunun yeme hakkı

let isGameStarted = false;
let ballSpeedX = DEFAULT_SPEED;
let ballSpeedY = DEFAULT_SPEED;
let playerScore = 0;
let playerLives = MAX_PLAYER_LIVES;

// Paddle pozisyonları
let leftPaddle = { x: 0, y: canvas.height / 2 - PADDLE_HEIGHT / 2 };
let rightPaddle = { x: canvas.width - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2 };

// Top
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    color: 'white',
};

// Top 10 Skor Tablosu
let scoreboard = JSON.parse(localStorage.getItem('pongScoreboard')) || [];

// Çizim fonksiyonları
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(text, x, y, color, fontSize = '24px', align = 'center') {
    ctx.fillStyle = color;
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ballSpeedX = DEFAULT_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = DEFAULT_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.color = 'white';
}

function updatePaddles() {
    // Oyuncu kontrolü
    if (keys['w'] && leftPaddle.y > 0) {
        leftPaddle.y -= 5;
    }
    if (keys['s'] && leftPaddle.y < canvas.height - PADDLE_HEIGHT) {
        leftPaddle.y += 5;
    }

    // AI kontrolü
    if (ball.y > rightPaddle.y + PADDLE_HEIGHT / 2 + AI_ERROR_MARGIN) {
        rightPaddle.y += AI_SPEED;
    } else if (ball.y < rightPaddle.y + PADDLE_HEIGHT / 2 - AI_ERROR_MARGIN) {
        rightPaddle.y -= AI_SPEED;
    }
}

function updateBall() {
    ball.x += ballSpeedX;
    ball.y += ballSpeedY;

    // Yukarı ve aşağı çarpmaları kontrol et
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ballSpeedY *= -1;
    }

    // Sol paddle çarpması
    if (
        ball.x <= leftPaddle.x + PADDLE_WIDTH &&
        ball.y >= leftPaddle.y &&
        ball.y <= leftPaddle.y + PADDLE_HEIGHT
    ) {
        ballSpeedX *= -1;
        ballSpeedX += ballSpeedX > 0 ? SPEED_INCREMENT : -SPEED_INCREMENT;
        ballSpeedY += ballSpeedY > 0 ? SPEED_INCREMENT : -SPEED_INCREMENT;
        ball.color = 'blue';
        playerScore++; // Oyuncu skor artırır
    }

    // Sağ paddle çarpması
    if (
        ball.x + ball.size >= rightPaddle.x &&
        ball.y >= rightPaddle.y &&
        ball.y <= rightPaddle.y + PADDLE_HEIGHT
    ) {
        ballSpeedX *= -1;
        ballSpeedX += ballSpeedX > 0 ? SPEED_INCREMENT : -SPEED_INCREMENT;
        ballSpeedY += ballSpeedY > 0 ? SPEED_INCREMENT : -SPEED_INCREMENT;
        ball.color = 'red';
    }

    // Gol kontrolü (AI gol atarsa)
    if (ball.x < 0) {
        playerLives--; // Oyuncu bir hak kaybeder
        resetBall();
        checkGameOver();
    }

    // Gol kontrolü (Player gol atarsa)
    if (ball.x > canvas.width) {
        resetBall();
    }
}

function checkGameOver() {
    if (playerLives <= 0) {
        const playerName = prompt('Maalesef kaybettiniz! Skorunuz kaydediliyor. Adınızı giriniz:');
        if (playerName) {
            addScoreToScoreboard(playerName, playerScore);
        }
        alert(`Oyun Bitti! Skorunuz: ${playerScore}`);
        location.reload(); // Oyunu yeniden başlat
    }
}

function addScoreToScoreboard(playerName, score) {
    scoreboard.push({ name: playerName, score });
    scoreboard.sort((a, b) => b.score - a.score); // Skorlara göre sırala
    scoreboard = scoreboard.slice(0, 10); // İlk 10 skoru tut
    localStorage.setItem('pongScoreboard', JSON.stringify(scoreboard));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skor ve kalan haklar
    drawText(`Skor: ${playerScore}`, canvas.width / 2, 30, 'white', '24px');
    drawText(`Kalan Haklar: ${playerLives}`, canvas.width / 2, 60, 'white', '24px');

    drawRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawCircle(ball.x, ball.y, ball.size / 2, ball.color);
}

function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawText('Pong Oyunu', canvas.width / 2, canvas.height / 4, 'white', '36px');
    drawText('Top 10 Skor:', canvas.width / 2, canvas.height / 4 + 40, 'white', '20px');

    // Skor Tablosu
    scoreboard.forEach((entry, index) => {
        drawText(`${index + 1}. ${entry.name} - ${entry.score}`, canvas.width / 2, canvas.height / 4 + 70 + index * 20, 'white', '18px');
    });

    drawText('Başlamak için bir tuşa basın!', canvas.width / 2, canvas.height - 50, 'white', '24px');
}

function startGame() {
    isGameStarted = true;
    gameLoop();
}

function gameLoop() {
    if (!isGameStarted) return;
    updateBall();
    updatePaddles();
    draw();
    requestAnimationFrame(gameLoop);
}

// Tuş kontrol
let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

function render() {
    if (!isGameStarted) {
        drawMenu();
        window.addEventListener('keydown', startGame, { once: true });
    } else {
        gameLoop();
    }
}

render();
