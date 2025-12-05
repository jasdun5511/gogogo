// --- 游戏配置 ---
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const GRID_SIZE = 20; 
const TILE_COUNT = CANVAS.width / GRID_SIZE; 
const SCORE_DISPLAY = document.getElementById('score');
const HIGH_SCORE_DISPLAY = document.getElementById('high-score');
const MESSAGE_DISPLAY = document.getElementById('game-message');

// --- 游戏状态变量 ---
let snake = [];
let food = {};
let dx = 0; 
let dy = 0; 
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameSpeed = 150; 
let isGameRunning = false;
let changingDirection = false;

// 初始化最高分显示
HIGH_SCORE_DISPLAY.textContent = highScore;

// --- 核心函数：初始化游戏 ---
function initializeGame() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    dx = 1; 
    dy = 0;
    score = 0;
    gameSpeed = 150;
    SCORE_DISPLAY.textContent = score;
    MESSAGE_DISPLAY.classList.add('hidden');
    
    placeFood();
    drawGame();
}

// --- 核心函数：放置食物 ---
function placeFood() {
    let newFood;
    let isOnSnake;

    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);

    food = newFood;
}

// --- 核心函数：绘制游戏 ---
function drawGame() {
    // 1. 清空画布
    CTX.fillStyle = '#1abc9c'; 
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // 2. 绘制食物
    drawFood();

    // 3. 绘制蛇身
    snake.forEach((segment, index) => {
        drawSnakeSegment(segment, index === 0);
    });
}

/** 绘制蛇的单个部分 */
function drawSnakeSegment(segment, isHead) {
    if (isHead) {
        CTX.fillStyle = '#3498db'; // 蛇头 (蓝色)
    } else {
        CTX.fillStyle = '#2ecc71'; // 蛇身 (绿色)
    }
    CTX.strokeStyle = '#2c3e50'; 

    CTX.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    CTX.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

/** 绘制食物 */
function drawFood() {
    CTX.fillStyle = '#e74c3c'; // 食物 (红色)
    CTX.strokeStyle = '#c0392b';

    const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2;

    CTX.beginPath();
    CTX.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI); 
    CTX.fill();
    CTX.stroke();
}

// --- 核心函数：移动逻辑 ---
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        updateScore();
        increaseSpeed();
        placeFood();
    } else {
        snake.pop();
    }
}

// --- 核心函数：碰撞检测 ---
function checkCollision() {
    const head = snake[0];
    
    // 撞墙检测
    const hitWall = head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT;

    // 撞自身检测
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
        endGame();
        return true;
    }
    return false;
}

// --- 游戏主循环 ---
function mainLoop() {
    if (!isGameRunning) return;

    changingDirection = false; 

    if (checkCollision()) return;

    moveSnake();
    drawGame();

    gameLoop = setTimeout(mainLoop, gameSpeed);
}

// --- 辅助函数 ---

function updateScore() {
    score += 10;
    SCORE_DISPLAY.textContent = score;
    if (score > highScore) {
        highScore = score;
        HIGH_SCORE_DISPLAY.textContent = highScore;
    }
}

function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2; 
    }
}

function startGame() {
    if (isGameRunning) {
        clearTimeout(gameLoop); 
    }
    isGameRunning = true;
    initializeGame();
    mainLoop();
}

function endGame() {
    isGameRunning = false;
    clearTimeout(gameLoop);
    
    MESSAGE_DISPLAY.textContent = `游戏结束！最终得分: ${score}`;
    MESSAGE_DISPLAY.classList.remove('hidden');

    if (score > localStorage.getItem('snakeHighScore')) {
        localStorage.setItem('snakeHighScore', score);
    }
}

// --- 事件监听：控制方向 ---
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (!isGameRunning || changingDirection) return;

    const key = event.keyCode;
    
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    let new_dx = dx;
    let new_dy = dy;

    // W(87) / A(65) / S(83) / D(68) / Arrow Keys (37-40)
    if ((key === 37 || key === 65) && !goingRight) {
        new_dx = -1;
        new_dy = 0;
    } else if ((key === 38 || key === 87) && !goingDown) {
        new_dx = 0;
        new_dy = -1;
    } else if ((key === 39 || key === 68) && !goingLeft) {
        new_dx = 1;
        new_dy = 0;
    } else if ((key === 40 || key === 83) && !goingUp) {
        new_dx = 0;
        new_dy = 1;
    }
    
    if (new_dx !== dx || new_dy !== dy)