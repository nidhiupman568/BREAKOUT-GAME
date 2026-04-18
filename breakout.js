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
let blockWidth = 45;
let blockHeight = 10;
let blockCount = 0;

let wallThickness = 10;
let gapSize = 15;

let walls = [];
let innerWalls = [];

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

function getPlayAreaLeft() {
    return walls.length > 0 ? wallThickness + gapSize : gapSize;
}

function getPlayAreaRight() {
    return walls.length > 0 ? boardWidth - wallThickness - gapSize : boardWidth - gapSize;
}

function getPlayAreaTop() {
    return walls.length > 0 ? wallThickness + gapSize : gapSize;
}

function getPlayAreaWidth() {
    return getPlayAreaRight() - getPlayAreaLeft();
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

function checkOverlapWithWalls(x, y, w, h) {
    let allWalls = walls.concat(innerWalls);
    for (let wall of allWalls) {
        if (x < wall.x + wall.width + gapSize &&
            x + w > wall.x - gapSize &&
            y < wall.y + wall.height + gapSize &&
            y + h > wall.y - gapSize) {
            return true;
        }
    }
    return false;
}

// Level 1: 入门 - 无墙，简单网格
function createLevel1() {
    blockArray = [];
    let startX = getPlayAreaLeft();
    let startY = 50;
    let cols = 8;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = startX + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < cols; c++) {
            addBlock(
                offsetX + c * blockWidth + c * spacing,
                startY + r * blockHeight + r * spacing,
                'skyblue'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 2: 外围墙 + 中间横障碍墙
function createLevel2() {
    createOuterWalls();
    
    let wallY = 200;
    innerWalls.push({
        x: getPlayAreaLeft(),
        y: wallY,
        width: getPlayAreaWidth(),
        height: wallThickness,
        color: '#888'
    });
    
    blockArray = [];
    let startX = getPlayAreaLeft();
    let startY = getPlayAreaTop() + 20;
    let cols = 7;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = startX + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 4; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < wallY) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    'orange'
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 3: 外围墙 + 中间竖墙（分左右两区）
function createLevel3() {
    createOuterWalls();
    
    let wallX = boardWidth / 2 - wallThickness / 2;
    innerWalls.push({
        x: wallX,
        y: getPlayAreaTop(),
        width: wallThickness,
        height: 160,
        color: '#888'
    });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 3;
    let spacing = 10;
    
    let leftAreaWidth = wallX - getPlayAreaLeft();
    let leftTotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let leftOffset = getPlayAreaLeft() + (leftAreaWidth - leftTotalWidth) / 2;
    
    let rightAreaWidth = getPlayAreaRight() - (wallX + wallThickness);
    let rightTotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let rightOffset = wallX + wallThickness + (rightAreaWidth - rightTotalWidth) / 2;
    
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < cols; c++) {
            addBlock(
                leftOffset + c * blockWidth + c * spacing,
                startY + r * blockHeight + r * spacing,
                'lime'
            );
            addBlock(
                rightOffset + c * blockWidth + c * spacing,
                startY + r * blockHeight + r * spacing,
                'pink'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 4: 外围墙 + L形障碍墙
function createLevel4() {
    createOuterWalls();
    
    let cornerX = getPlayAreaLeft() + 60;
    let cornerY = 160;
    
    innerWalls.push({
        x: cornerX,
        y: cornerY,
        width: 150,
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: cornerX,
        y: cornerY,
        width: wallThickness,
        height: 80,
        color: '#888'
    });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 7;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 4; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < cornerY) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    'cyan'
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 5: 外围墙 + 左右竖墙（三通道）
function createLevel5() {
    createOuterWalls();
    
    let wall1X = getPlayAreaLeft() + getPlayAreaWidth() * 0.33;
    let wall2X = getPlayAreaLeft() + getPlayAreaWidth() * 0.67;
    
    innerWalls.push({
        x: wall1X,
        y: getPlayAreaTop() + 20,
        width: wallThickness,
        height: 140,
        color: '#888'
    });
    innerWalls.push({
        x: wall2X,
        y: getPlayAreaTop() + 20,
        width: wallThickness,
        height: 140,
        color: '#888'
    });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 2;
    let spacing = 10;
    
    let zone1Width = wall1X - getPlayAreaLeft();
    let zone1TotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let zone1Offset = getPlayAreaLeft() + (zone1Width - zone1TotalWidth) / 2;
    
    let zone2Width = wall2X - (wall1X + wallThickness);
    let zone2TotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let zone2Offset = wall1X + wallThickness + (zone2Width - zone2TotalWidth) / 2;
    
    let zone3Width = getPlayAreaRight() - (wall2X + wallThickness);
    let zone3TotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let zone3Offset = wall2X + wallThickness + (zone3Width - zone3TotalWidth) / 2;
    
    for (let r = 0; r < 3; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        for (let c = 0; c < cols; c++) {
            addBlock(
                zone1Offset + c * blockWidth + c * spacing,
                blockY,
                'yellow'
            );
            addBlock(
                zone2Offset + c * blockWidth + c * spacing,
                blockY,
                'orange'
            );
            addBlock(
                zone3Offset + c * blockWidth + c * spacing,
                blockY,
                'skyblue'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 6: 外围墙 + 迷宫式交替短墙
function createLevel6() {
    createOuterWalls();
    
    innerWalls.push({ x: getPlayAreaLeft() + 40, y: 120, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: getPlayAreaRight() - 140, y: 120, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: getPlayAreaLeft() + 120, y: 170, width: 100, height: wallThickness, color: '#888' });
    innerWalls.push({ x: getPlayAreaRight() - 220, y: 170, width: 100, height: wallThickness, color: '#888' });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 7;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 4; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < 120) {
            for (let c = 0; c < cols; c++) {
                let colors = ['skyblue', 'orange', 'lime', 'pink'];
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    colors[r % 4]
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
    
    blockArray = [];
    let startX = getPlayAreaLeft();
    let startY = 50;
    
    for (let r = 0; r < 5; r++) {
        let cols = r % 2 === 0 ? 8 : 7;
        let offset = r % 2 === 0 ? 0 : 30;
        for (let c = 0; c < cols; c++) {
            let bx = startX + offset + c * blockWidth + c * 10;
            let by = startY + r * blockHeight + r * 10;
            
            if (!checkOverlapWithWalls(bx, by, blockWidth, blockHeight)) {
                addBlock(
                    bx,
                    by,
                    ['lime', 'skyblue'][r % 2]
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 8: 外围墙 + 双横墙（三区域）
function createLevel8() {
    createOuterWalls();
    
    innerWalls.push({ x: getPlayAreaLeft(), y: 140, width: getPlayAreaWidth(), height: wallThickness, color: '#888' });
    innerWalls.push({ x: getPlayAreaLeft(), y: 240, width: getPlayAreaWidth(), height: wallThickness, color: '#888' });
    
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.3, y: 140, width: wallThickness, height: 110, color: '#888' });
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.7, y: 140, width: wallThickness, height: 110, color: '#888' });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 7;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 3; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < 140) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    'red'
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 9: 外围墙 + 中心十字障碍
function createLevel9() {
    createOuterWalls();
    
    let centerX = boardWidth / 2;
    let centerY = 170;
    
    innerWalls.push({
        x: centerX - wallThickness / 2,
        y: getPlayAreaTop() + 20,
        width: wallThickness,
        height: 160,
        color: '#888'
    });
    innerWalls.push({
        x: getPlayAreaLeft() + 30,
        y: centerY,
        width: getPlayAreaWidth() - 60,
        height: wallThickness,
        color: '#888'
    });
    
    blockArray = [];
    let colors = ['skyblue', 'orange', 'lime', 'pink'];
    
    let positions = [
        { x: getPlayAreaLeft(), y: getPlayAreaTop() + 20, cols: 3, rows: 3, maxY: centerY },
        { x: centerX + gapSize, y: getPlayAreaTop() + 20, cols: 3, rows: 3, maxY: centerY }
    ];
    
    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i];
        let totalWidth = pos.cols * blockWidth + (pos.cols - 1) * 10;
        let zoneWidth = (i === 0) ? (centerX - wallThickness/2 - getPlayAreaLeft()) : (getPlayAreaRight() - centerX - wallThickness/2);
        let offsetX = pos.x + (zoneWidth - totalWidth) / 2;
        
        for (let r = 0; r < pos.rows; r++) {
            let blockY = pos.y + r * blockHeight + r * 10;
            if (blockY + blockHeight + gapSize < pos.maxY) {
                for (let c = 0; c < pos.cols; c++) {
                    addBlock(
                        offsetX + c * blockWidth + c * 10,
                        blockY,
                        colors[i]
                    );
                }
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 10: 终极迷宫挑战
function createLevel10() {
    createOuterWalls();
    
    innerWalls.push({ x: getPlayAreaLeft() + 30, y: 120, width: 120, height: wallThickness, color: '#777' });
    innerWalls.push({ x: getPlayAreaRight() - 150, y: 120, width: 120, height: wallThickness, color: '#777' });
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.35, y: 120, width: wallThickness, height: 60, color: '#777' });
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.65, y: 120, width: wallThickness, height: 60, color: '#777' });
    innerWalls.push({ x: getPlayAreaLeft() + 60, y: 180, width: 80, height: wallThickness, color: '#777' });
    innerWalls.push({ x: getPlayAreaRight() - 140, y: 180, width: 80, height: wallThickness, color: '#777' });
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.4, y: 200, width: wallThickness, height: 80, color: '#777' });
    innerWalls.push({ x: getPlayAreaLeft() + getPlayAreaWidth() * 0.6, y: 200, width: wallThickness, height: 80, color: '#777' });
    
    blockArray = [];
    let startY = getPlayAreaTop() + 20;
    let cols = 7;
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    let rainbow = ['red', 'orange', 'yellow', 'lime', 'cyan'];
    
    for (let r = 0; r < 4; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < 120) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    rainbow[r % 5]
                );
            }
        }
    }
    blockCount = blockArray.length;
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
    let textX = walls.length > 0 ? (wallThickness + gapSize + 5) : 25;
    context.fillText('Score: ' + score, textX, textY);
    
    let levelText = 'Level: ' + currentLevel;
    let levelTextWidth = context.measureText(levelText).width;
    let levelX = walls.length > 0 ? (boardWidth - wallThickness - gapSize - levelTextWidth - 5) : (boardWidth - levelTextWidth - 25);
    context.fillText(levelText, levelX, textY);
    
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
                    player.x = wallThickness + gapSize;
                } else {
                    player.x = gapSize;
                }
            }
        }
        else if (e.code === 'ArrowRight') {
            let nextPlayerX = player.x + player.velocityX;
            if (!outOfBounds(nextPlayerX)) {
                player.x = nextPlayerX;
            } else {
                if (walls.length > 0) {
                    player.x = boardWidth - wallThickness - gapSize - player.width;
                } else {
                    player.x = boardWidth - gapSize - player.width;
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
        return (xPosition < wallThickness + gapSize || 
                xPosition + player.width > boardWidth - wallThickness - gapSize);
    }
    return (xPosition < gapSize || xPosition + player.width > boardWidth - gapSize);
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
