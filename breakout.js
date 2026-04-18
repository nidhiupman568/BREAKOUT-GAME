const GameState = {
    MENU: 'menu',
    LEVEL_SELECT: 'level_select',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
};

let currentGameState = GameState.MENU;
let currentLevel = 1;
const maxLevels = 10;

let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 50;
let ballBaseSpeed = 5;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX,
    originalWidth: playerWidth,
    widthTimer: 0
};

let ballWidth = 10;
let ballHeight = 10;

let balls = [];

let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 60;

let walls = [];
let innerWalls = [];
let wallThickness = 10;

let powerUps = [];
let powerUpWidth = 20;
let powerUpHeight = 20;
let powerUpSpeed = 2;

const PowerUpType = {
    EXTEND: 'extend',
    PIERCE: 'pierce',
    MULTI: 'multi'
};

let powerUpNotification = {
    text: '',
    timer: 0,
    maxTimer: 60
};

let score = 0;

let mainMenu, levelSelect, startGameBtn, selectLevelBtn;
let backToMenuBtn, speedSlider, speedValue, ballSpeedSlider, ballSpeedValue;

window.onload = function() {
    mainMenu = document.getElementById('mainMenu');
    levelSelect = document.getElementById('levelSelect');
    startGameBtn = document.getElementById('startGameBtn');
    selectLevelBtn = document.getElementById('selectLevelBtn');
    backToMenuBtn = document.getElementById('backToMenuBtn');
    speedSlider = document.getElementById('speedSlider');
    speedValue = document.getElementById('speedValue');
    ballSpeedSlider = document.getElementById('ballSpeedSlider');
    ballSpeedValue = document.getElementById('ballSpeedValue');
    
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');
    
    startGameBtn.addEventListener('click', startGame);
    selectLevelBtn.addEventListener('click', showLevelSelect);
    backToMenuBtn.addEventListener('click', showMainMenu);
    
    for (let i = 1; i <= 10; i++) {
        const btn = document.getElementById('level' + i + 'Btn');
        if (btn) {
            btn.addEventListener('click', () => startLevel(i));
        }
    }
    
    speedSlider.addEventListener('input', function() {
        playerVelocityX = parseInt(this.value);
        speedValue.textContent = this.value;
        player.velocityX = playerVelocityX;
    });
    
    ballSpeedSlider.addEventListener('input', function() {
        ballBaseSpeed = parseInt(this.value);
        ballSpeedValue.textContent = this.value;
    });
    
    document.addEventListener('keydown', handleKeyDown);
    
    requestAnimationFrame(gameLoop);
};

function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    if (currentGameState === GameState.PLAYING) {
        update();
        render();
    }
}

function showMainMenu() {
    currentGameState = GameState.MENU;
    mainMenu.style.display = 'block';
    levelSelect.style.display = 'none';
    board.style.display = 'none';
}

function showLevelSelect() {
    currentGameState = GameState.LEVEL_SELECT;
    mainMenu.style.display = 'none';
    levelSelect.style.display = 'block';
    board.style.display = 'none';
}

function startGame() {
    currentLevel = 1;
    startLevel(currentLevel);
}

function startLevel(level) {
    currentLevel = level;
    currentGameState = GameState.PLAYING;
    
    mainMenu.style.display = 'none';
    levelSelect.style.display = 'none';
    board.style.display = 'inline';
    
    resetGame();
    loadLevel(level);
}

function loadLevel(level) {
    blockArray = [];
    walls = [];
    innerWalls = [];
    powerUps = [];
    
    balls = [{
        x: boardWidth / 2 - ballWidth / 2,
        y: boardHeight - 80,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballBaseSpeed * (Math.random() > 0.5 ? 1 : -1),
        velocityY: -ballBaseSpeed * 0.7,
        piercing: false,
        pierceTimer: 0
    }];
    
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX,
        originalWidth: playerWidth,
        widthTimer: 0
    };
    
    switch(level) {
        case 1: createLevel1(); break;
        case 2: createLevel2(); break;
        case 3: createLevel3(); break;
        case 4: createLevel4(); break;
        case 5: createLevel5(); break;
        case 6: createLevel6(); break;
        case 7: createLevel7(); break;
        case 8: createLevel8(); break;
        case 9: createLevel9(); break;
        case 10: createLevel10(); break;
    }
}

function createOuterWalls() {
    walls.push({ x: 0, y: 0, width: wallThickness, height: boardHeight, color: '#666' });
    walls.push({ x: boardWidth - wallThickness, y: 0, width: wallThickness, height: boardHeight, color: '#666' });
    walls.push({ x: 0, y: 0, width: boardWidth, height: wallThickness, color: '#666' });
}

// Level 1: 入门 - 无墙，简单网格
function createLevel1() {
    blockArray = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            addBlock(
                blockX + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'skyblue'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 2: 外围墙 + 中间一道横障碍墙
function createLevel2() {
    createOuterWalls();
    
    innerWalls.push({
        x: 60,
        y: 200,
        width: boardWidth - 120,
        height: wallThickness,
        color: '#888'
    });
    
    blockArray = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
            addBlock(
                wallThickness + 25 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'orange'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 3: 外围墙 + 中间竖墙（分左右两区）
function createLevel3() {
    createOuterWalls();
    
    innerWalls.push({
        x: boardWidth / 2 - wallThickness / 2,
        y: 60,
        width: wallThickness,
        height: 140,
        color: '#888'
    });
    
    blockArray = [];
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 3; c++) {
            addBlock(
                wallThickness + 20 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'lime'
            );
            addBlock(
                boardWidth / 2 + 20 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'pink'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 4: 外围墙 + L形障碍墙
function createLevel4() {
    createOuterWalls();
    
    innerWalls.push({
        x: 100,
        y: 150,
        width: 150,
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: 100,
        y: 150,
        width: wallThickness,
        height: 80,
        color: '#888'
    });
    
    blockArray = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
            addBlock(
                wallThickness + 25 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'cyan'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 5: 外围墙 + 左右竖墙（3通道）
function createLevel5() {
    createOuterWalls();
    
    innerWalls.push({
        x: 150,
        y: 80,
        width: wallThickness,
        height: 150,
        color: '#888'
    });
    innerWalls.push({
        x: 340,
        y: 80,
        width: wallThickness,
        height: 150,
        color: '#888'
    });
    
    blockArray = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
            addBlock(
                wallThickness + 20 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'yellow'
            );
            addBlock(
                180 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'orange'
            );
            addBlock(
                370 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'skyblue'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 6: 外围墙 + 迷宫式障碍（交替短墙）
function createLevel6() {
    createOuterWalls();
    
    innerWalls.push({ x: 60, y: 120, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 340, y: 120, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 150, y: 170, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 250, y: 170, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 100, y: 220, width: 80, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 320, y: 220, width: 80, height: wallThickness, color: '#888' });
    
    blockArray = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
            if (!((r === 1 && (c === 2 || c === 5)) || (r === 2 && (c === 3 || c === 4)))) {
                addBlock(
                    wallThickness + 25 + c * blockWidth + c * 10,
                    blockY + r * blockHeight + r * 10,
                    ['skyblue', 'orange', 'lime', 'pink', 'yellow'][r % 5]
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 7: 无外围墙 + 内部浮动障碍墙
function createLevel7() {
    innerWalls.push({ x: 80, y: 130, width: 80, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 340, y: 130, width: 80, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 200, y: 180, width: 100, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 150, y: 230, width: 60, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 290, y: 230, width: 60, height: wallThickness, color: '#aaa' });
    
    blockArray = [];
    for (let r = 0; r < 5; r++) {
        let cols = r % 2 === 0 ? 8 : 7;
        let offset = r % 2 === 0 ? 0 : 30;
        for (let c = 0; c < cols; c++) {
            addBlock(
                blockX + offset + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                ['lime', 'skyblue'][r % 2]
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 8: 外围墙 + 双横墙（三区域）
function createLevel8() {
    createOuterWalls();
    
    innerWalls.push({ x: 60, y: 140, width: boardWidth - 120, height: wallThickness, color: '#888' });
    innerWalls.push({ x: 60, y: 240, width: boardWidth - 120, height: wallThickness, color: '#888' });
    
    innerWalls.push({ x: 150, y: 140, width: wallThickness, height: 110, color: '#888' });
    innerWalls.push({ x: 340, y: 140, width: wallThickness, height: 110, color: '#888' });
    
    blockArray = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
            addBlock(
                wallThickness + 25 + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'red'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 9: 外围墙 + 中心十字障碍
function createLevel9() {
    createOuterWalls();
    
    innerWalls.push({
        x: boardWidth / 2 - wallThickness / 2,
        y: 80,
        width: wallThickness,
        height: 180,
        color: '#888'
    });
    innerWalls.push({
        x: 80,
        y: 170,
        width: boardWidth - 160,
        height: wallThickness,
        color: '#888'
    });
    
    blockArray = [];
    let colors = ['skyblue', 'orange', 'lime', 'pink'];
    let positions = [
        { x: wallThickness + 20, y: blockY, cols: 3, rows: 3 },
        { x: boardWidth / 2 + 20, y: blockY, cols: 3, rows: 3 },
        { x: wallThickness + 20, y: 200, cols: 3, rows: 2 },
        { x: boardWidth / 2 + 20, y: 200, cols: 3, rows: 2 }
    ];
    
    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i];
        for (let r = 0; r < pos.rows; r++) {
            for (let c = 0; c < pos.cols; c++) {
                addBlock(
                    pos.x + c * blockWidth + c * 10,
                    pos.y + r * blockHeight + r * 10,
                    colors[i]
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 10: 终极迷宫挑战
function createLevel10() {
    createOuterWalls();
    
    innerWalls.push({ x: 60, y: 120, width: 120, height: wallThickness, color: '#777' });
    innerWalls.push({ x: 320, y: 120, width: 120, height: wallThickness, color: '#777' });
    innerWalls.push({ x: 180, y: 120, width: wallThickness, height: 60, color: '#777' });
    innerWalls.push({ x: 310, y: 120, width: wallThickness, height: 60, color: '#777' });
    innerWalls.push({ x: 100, y: 180, width: 80, height: wallThickness, color: '#777' });
    innerWalls.push({ x: 320, y: 180, width: 80, height: wallThickness, color: '#777' });
    innerWalls.push({ x: 200, y: 200, width: wallThickness, height: 80, color: '#777' });
    innerWalls.push({ x: 290, y: 200, width: wallThickness, height: 80, color: '#777' });
    innerWalls.push({ x: 60, y: 260, width: 100, height: wallThickness, color: '#777' });
    innerWalls.push({ x: 340, y: 260, width: 100, height: wallThickness, color: '#777' });
    
    blockArray = [];
    let rainbow = ['red', 'orange', 'yellow', 'lime', 'cyan', 'skyblue', 'pink'];
    
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
            if (!((r === 2 && (c === 1 || c === 6)) || (r === 3 && (c === 3 || c === 4)))) {
                addBlock(
                    wallThickness + 25 + c * blockWidth + c * 10,
                    blockY + r * blockHeight + r * 10,
                    rainbow[r]
                );
            }
        }
    }
    blockCount = blockArray.length;
}

function addBlock(x, y, color) {
    blockArray.push({
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight,
        break: false,
        color: color
    });
}

function update() {
    context.clearRect(0, 0, board.width, board.height);
    
    if (player.widthTimer > 0) {
        player.widthTimer--;
        if (player.widthTimer <= 0) {
            let widthDiff = player.width - player.originalWidth;
            player.x += widthDiff / 2;
            player.width = player.originalWidth;
        }
    }
    
    if (powerUpNotification.timer > 0) {
        powerUpNotification.timer--;
    }
    
    context.fillStyle = '#666';
    for (let wall of walls) {
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    context.fillStyle = '#888';
    for (let wall of innerWalls) {
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    context.fillStyle = 'lightgreen';
    context.fillRect(player.x, player.y, player.width, player.height);
    
    for (let i = balls.length - 1; i >= 0; i--) {
        let ball = balls[i];
        
        if (ball.piercing) {
            ball.pierceTimer--;
            if (ball.pierceTimer <= 0) {
                ball.piercing = false;
            }
        }
        
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        context.fillStyle = ball.piercing ? 'red' : 'white';
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
        
        let wallHit = false;
        let allWalls = walls.concat(innerWalls);
        
        for (let wall of allWalls) {
            if (detectCollision(ball, wall)) {
                let overlapLeft = (ball.x + ball.width) - wall.x;
                let overlapRight = (wall.x + wall.width) - ball.x;
                let overlapTop = (ball.y + ball.height) - wall.y;
                let overlapBottom = (wall.y + wall.height) - ball.y;
                
                let minOverlapX = Math.min(overlapLeft, overlapRight);
                let minOverlapY = Math.min(overlapTop, overlapBottom);
                
                if (minOverlapX < minOverlapY) {
                    ball.velocityX *= -1;
                    ball.x = overlapLeft < overlapRight ? wall.x - ball.width : wall.x + wall.width;
                } else {
                    ball.velocityY *= -1;
                    ball.y = overlapTop < overlapBottom ? wall.y - ball.height : wall.y + wall.height;
                }
                wallHit = true;
                break;
            }
        }
        
        if (!wallHit && walls.length === 0) {
            if (ball.y <= 0) {
                ball.velocityY *= -1;
            }
            else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
                ball.velocityX *= -1;
            }
        }
        
        if (ball.y + ball.height >= boardHeight) {
            balls.splice(i, 1);
            continue;
        }
        
        if (detectCollision(ball, player)) {
            if (ball.y + ball.height - player.y < 8) {
                ball.velocityY = -Math.abs(ball.velocityY);
                let hitPos = (ball.x + ball.width / 2) - player.x;
                let paddleCenter = player.width / 2;
                let angle = (hitPos - paddleCenter) / paddleCenter;
                ball.velocityX = angle * (ballBaseSpeed * 0.8);
                let speed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
                let factor = ballBaseSpeed / speed;
                ball.velocityX *= factor;
                ball.velocityY *= factor;
            }
            else if (player.y + player.height - ball.y < 5) {
                ball.velocityY = Math.abs(ball.velocityY);
            }
            else {
                ball.velocityX *= -1;
            }
        }
        
        for (let j = 0; j < blockArray.length; j++) {
            let block = blockArray[j];
            if (!block.break && detectCollision(ball, block)) {
                block.break = true;
                score += 100;
                blockCount -= 1;
                
                if (Math.random() < 0.25) {
                    spawnPowerUp(block.x + block.width / 2, block.y + block.height / 2);
                }
                
                if (!ball.piercing) {
                    let overlapLeft = (ball.x + ball.width) - block.x;
                    let overlapRight = (block.x + block.width) - ball.x;
                    let overlapTop = (ball.y + ball.height) - block.y;
                    let overlapBottom = (block.y + block.height) - ball.y;
                    
                    let minOverlapX = Math.min(overlapLeft, overlapRight);
                    let minOverlapY = Math.min(overlapTop, overlapBottom);
                    
                    if (minOverlapX < minOverlapY) {
                        ball.velocityX *= -1;
                    } else {
                        ball.velocityY *= -1;
                    }
                }
            }
        }
    }
    
    if (balls.length === 0) {
        context.font = '20px sans-serif';
        context.fillText('Game Over: Press Space to Restart', 80, 400);
        context.fillText('Press ESC for Menu', 80, 430);
        currentGameState = GameState.GAME_OVER;
        return;
    }
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.y += powerUpSpeed;
        
        context.fillStyle = powerUp.color;
        let pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
        let pw = powerUpWidth * pulse;
        let ph = powerUpHeight * pulse;
        let px = powerUp.x - pw / 2;
        let py = powerUp.y - ph / 2;
        
        context.beginPath();
        context.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
        context.fill();
        
        context.fillStyle = 'white';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let symbol = '';
        switch (powerUp.type) {
            case PowerUpType.EXTEND: symbol = '+'; break;
            case PowerUpType.PIERCE: symbol = '!'; break;
            case PowerUpType.MULTI: symbol = '*'; break;
        }
        context.fillText(symbol, powerUp.x, powerUp.y);
        
        if (powerUp.y > boardHeight) {
            powerUps.splice(i, 1);
            continue;
        }
        
        if (detectCollision(powerUp, player)) {
            applyPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
    }
    
    for (let block of blockArray) {
        if (!block.break) {
            context.fillStyle = block.color;
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    
    if (blockCount == 0) {
        score += 500;
        if (currentLevel < maxLevels) {
            context.font = '24px sans-serif';
            context.fillText('Level Complete!', boardWidth / 2 - 70, boardHeight / 2);
            context.fillText('Press Space for Next Level', boardWidth / 2 - 110, boardHeight / 2 + 30);
            currentGameState = GameState.LEVEL_COMPLETE;
        } else {
            context.font = '24px sans-serif';
            context.fillText('Congratulations!', boardWidth / 2 - 60, boardHeight / 2 - 30);
            context.fillText('You Beat All Levels!', boardWidth / 2 - 85, boardHeight / 2);
            context.fillText('Press Space to Restart', boardWidth / 2 - 95, boardHeight / 2 + 30);
            context.fillText('Press ESC for Menu', boardWidth / 2 - 70, boardHeight / 2 + 60);
            currentGameState = GameState.GAME_OVER;
        }
    }
    
    context.font = '18px sans-serif';
    context.fillStyle = 'white';
    
    let textY = boardHeight - 20;
    context.fillText('Score: ' + score, 20, textY);
    context.fillText('Level: ' + currentLevel, boardWidth - 100, textY);
    
    if (powerUpNotification.timer > 0) {
        if (Math.floor(powerUpNotification.timer / 5) % 2 === 0) {
            context.font = '16px sans-serif';
            context.fillStyle = 'yellow';
            let centerX = boardWidth / 2;
            let textWidth = context.measureText(powerUpNotification.text).width;
            context.fillText(powerUpNotification.text, centerX - textWidth / 2, textY);
        }
    }
}

function render() {
}

function spawnPowerUp(x, y) {
    let types = [PowerUpType.EXTEND, PowerUpType.PIERCE, PowerUpType.MULTI];
    let type = types[Math.floor(Math.random() * types.length)];
    
    let color;
    switch (type) {
        case PowerUpType.EXTEND: color = 'lime'; break;
        case PowerUpType.PIERCE: color = 'red'; break;
        case PowerUpType.MULTI: color = 'blue'; break;
    }
    
    powerUps.push({
        x: x,
        y: y,
        width: powerUpWidth,
        height: powerUpHeight,
        type: type,
        color: color
    });
}

function applyPowerUp(powerUp) {
    switch (powerUp.type) {
        case PowerUpType.EXTEND:
            let extension = 40;
            player.width += extension;
            player.x -= extension / 2;
            player.widthTimer = 360;
            showPowerUpNotification('Paddle Extended!');
            break;
            
        case PowerUpType.PIERCE:
            for (let ball of balls) {
                ball.piercing = true;
                ball.pierceTimer = 360;
            }
            showPowerUpNotification('Piercing Ball!');
            break;
            
        case PowerUpType.MULTI:
            if (balls.length > 0) {
                let originalBall = balls[0];
                balls.push({
                    x: originalBall.x,
                    y: originalBall.y,
                    width: ballWidth,
                    height: ballHeight,
                    velocityX: -originalBall.velocityX,
                    velocityY: originalBall.velocityY,
                    piercing: false,
                    pierceTimer: 0
                });
            }
            showPowerUpNotification('Multi Ball!');
            break;
    }
}

function showPowerUpNotification(text) {
    powerUpNotification.text = text;
    powerUpNotification.timer = powerUpNotification.maxTimer;
}

function handleKeyDown(e) {
    if (currentGameState === GameState.GAME_OVER || currentGameState === GameState.LEVEL_COMPLETE) {
        if (e.code === 'Space') {
            if (currentGameState === GameState.LEVEL_COMPLETE) {
                currentLevel++;
                if (currentLevel > maxLevels) {
                    currentLevel = 1;
                }
            }
            resetGame();
            loadLevel(currentLevel);
            currentGameState = GameState.PLAYING;
        }
        if (e.code === 'Escape') {
            showMainMenu();
        }
        return;
    }
    
    if (currentGameState === GameState.PLAYING) {
        if (e.code === 'ArrowLeft') {
            let nextPlayerX = player.x - player.velocityX;
            if (!outOfBounds(nextPlayerX)) {
                player.x = nextPlayerX;
            } else {
                if (walls.length > 0) {
                    player.x = wallThickness;
                } else {
                    player.x = 0;
                }
            }
        }
        else if (e.code === 'ArrowRight') {
            let nextPlayerX = player.x + player.velocityX;
            if (!outOfBounds(nextPlayerX)) {
                player.x = nextPlayerX;
            } else {
                if (walls.length > 0) {
                    player.x = boardWidth - wallThickness - player.width;
                } else {
                    player.x = boardWidth - player.width;
                }
            }
        }
        else if (e.code === 'Escape') {
            showMainMenu();
        }
    }
}

function outOfBounds(xPosition) {
    if (walls.length > 0) {
        return (xPosition < wallThickness || xPosition + player.width > boardWidth - wallThickness);
    }
    return (xPosition < 0 || xPosition + player.width > boardWidth);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetGame() {
    score = 0;
    balls = [];
    powerUps = [];
    currentGameState = GameState.PLAYING;
}
