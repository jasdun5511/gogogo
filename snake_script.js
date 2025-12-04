// --- 游戏配置 ---
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const GRID_SIZE = 20; // 蛇和食物的大小（像素）
const TILE_COUNT = CANVAS.width / GRID_SIZE; // 棋盘上的格子数量 (20x20)
const SCORE_DISPLAY = document.getElementById('score');
const HIGH_SCORE_DISPLAY = document.getElementById('high-score');
const MESSAGE_DISPLAY = document.getElementById('game-message');

// --- 游戏状态变量 ---
let snake = [];
let food = {};
let dx = 0; // x轴方向速度 (1:右, -1:左, 0:不动)
let dy = 0; // y轴方向速度 (1:下, -1:上, 0:不动)
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameSpeed = 150; // 游戏速度（毫秒）
let isGameRunning = false;
let changingDirection = false;

// 初始化最高分显示
HIGH_SCORE_DISPLAY.textContent = highScore;

// --- 核心函数：初始化游戏 ---
function initializeGame() {
    // 初始化蛇身：位于棋盘中央，长度为3
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    dx = 1; // 初始向右移动
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
        // 随机生成食物坐标
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        
        // 检查食物是否与蛇身重叠
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);

    food = newFood;
}

// --- 核心函数：绘制游戏 ---
function drawGame() {
    // 1. 清空画布
    CTX.fillStyle = '#1abc9c'; // 匹配 CSS 中的画布背景色
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // 2. 绘制食物 (红色圆形)
    drawFood();

    // 3. 绘制蛇身 (绿色方块)
    snake.forEach((segment, index) => {
        drawSnakeSegment(segment, index === 0);
    });
}

/** 绘制蛇的单个部分 */
function drawSnakeSegment(segment, isHead) {
    if (isHead) {
        CTX.fillStyle = '#3498db'; // 蛇头颜色 (蓝色)
    } else {
        CTX.fillStyle = '#2ecc71'; // 蛇身颜色 (绿色)
    }
    CTX.strokeStyle = '#2c3e50'; // 边框颜色

    // 绘制方块
    CTX.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 绘制边框
    CTX.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

/** 绘制食物 */
function drawFood() {
    CTX.fillStyle = '#e74c3c'; // 食物颜色 (红色)
    CTX.strokeStyle = '#c0392b';

    // 绘制圆形食物
    const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2;

    CTX.beginPath();
    CTX.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI); // 稍微小一点，留出间隙
    CTX.fill();
    CTX.stroke();
}


// --- 核心函数：移动逻辑 ---
function moveSnake() {
    // 创建新的蛇头位置
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // 将新蛇头添加到蛇身数组的开头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 吃到食物：不移除尾部，得分增加，放置新食物
        updateScore();
        increaseSpeed();
        placeFood();
    } else {
        // 没吃到食物：移除尾部，保持长度不变
        snake.pop();
    }
}

// --- 核心函数：碰撞检测 ---
function checkCollision() {
    const head = snake[0];
    
    // 1. 撞墙检测
    const hitWall = head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT;

    // 2. 撞自身检测 (从第二段开始检查)
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

    // 重置方向锁
    changingDirection = false; 

    if (checkCollision()) return;

    moveSnake();
    drawGame();

    // 根据当前速度设置下一次循环
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
    // 每次得分都稍微加快速度，但设置最小值
    if (gameSpeed > 50) {
        gameSpeed -= 2; 
    }
}

function startGame() {
    if (isGameRunning) {
        clearTimeout(gameLoop); // 如果游戏正在运行，先停止
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

    // 保存最高分
    if (score > localStorage.getItem('snakeHighScore')) {
        localStorage.setItem('snakeHighScore', score);
    }
}

// --- 事件监听：控制方向 ---
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (!isGameRunning || changingDirection) return;

    // 定义方向键和 WASD 键码
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;
