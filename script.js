const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun değişkenleri
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const WINNING_SCORE = 20;
const AI_SPEED = 3; // Yapay zeka hızı
const SPEED_INCREMENT = 0.15; // Her paddle temasında hız artışı
const DEFAULT_SPEED = 1; // Varsayılan hız

let isGameStarted = false;
let isPVE = false;
let ballSpeedX = DEFAULT_SPEED;
let ballSpeedY = DEFAULT_SPEED;

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

// Skorlar
let leftScore = 0;
let rightScore = 0;

// Ana Menüde Tıklanabilir Butonlar
const buttons = [
    {
        text: "Oyuna Başla (PVP)",
        x: canvas.width / 2 - 100,
        y: canvas.height / 2 - 60,
        width: 200,
        height: 50,
        action: () => startGame(false),
    },
    {
        text: "Yapay Zekaya Karşı Oyna (PVE)",
        x: canvas.width / 2 - 150,
        y: canvas.height / 2,
        width: 300,
        height: 50,
        action: () => startGame(true),
    },
];

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
    if (keys['w'] && leftPaddle.y > 0) {
        leftPaddle.y -= 5;
    }
    if (keys['s'] && leftPaddle.y < canvas.height - PADDLE_HEIGHT) {
        leftPaddle.y += 5;
    }
    if (isPVE) {
        // AI Paddle hareketi
        if (rightPaddle.y + PADDLE_HEIGHT / 2 < ball.y) {
            rightPaddle.y += AI_SPEED;
        } else {
            rightPaddle.y -= AI_SPEED;
        }
    } else {
        if (keys['ArrowUp'] && rightPaddle.y > 0) {
            rightPaddle.y -= 5;
        }
        if (keys['ArrowDown'] && rightPaddle.y < canvas.height - PADDLE_HEIGHT) {
            rightPaddle.y += 5;
        }
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

    // Gol kontrolü
    if (ball.x < 0) {
        rightScore++;
        resetBall();
        checkWinCondition();
    }

    if (ball.x > canvas.width) {
        leftScore++;
        resetBall();
        checkWinCondition();
    }
}

function checkWinCondition() {
    if (leftScore >= WINNING_SCORE || rightScore >= WINNING_SCORE) {
        const winner = leftScore > rightScore ? 'Sol Oyuncu' : isPVE ? 'Yapay Zeka' : 'Sağ Oyuncu';
        alert(`${winner} kazandı!`);
        location.reload();
    }
}

function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawText('Pong Oyunu', canvas.width / 2, canvas.height / 4, 'white', '36px');

    buttons.forEach((button) => {
        drawRect(button.x, button.y, button.width, button.height, 'white');
        drawText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 10, 'black', '20px');
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawText(`${leftScore} - ${rightScore}`, canvas.width / 2, 30, 'white', '24px');

    drawRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawCircle(ball.x, ball.y, ball.size / 2, ball.color);
}

function startGame(isAI) {
    isGameStarted = true;
    isPVE = isAI;
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

// Mouse ile tıklama kontrolü
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    buttons.forEach((button) => {
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            button.action();
        }
    });
});

function render() {
    if (!isGameStarted) {
        drawMenu();
    } else {
        gameLoop();
    }
}

render();
