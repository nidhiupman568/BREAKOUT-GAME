// Game states
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

// Board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// Player (paddle)
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 50; // 默认速度

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX,
    originalWidth: playerWidth,
    widthTimer: 0
};

// Balls
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let balls = [];

// Blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

// Walls
let walls = [];
let wallThickness = 10;

// Power-ups
let powerUps = [];
let powerUpWidth = 20;
let powerUpHeight = 20;
let powerUpSpeed = 2;

// Power-up types
const PowerUpType = {
    EXTEND: 'extend',
    PIERCE: 'pierce',
    MULTI: 'multi'
};

// Power-up notification
let powerUpNotification = {
    text: '',
    timer: 0,
    maxTimer: 60
};

let score = 0;

// DOM elements
let mainMenu, levelSelect, startGameBtn, selectLevelBtn;
let backToMenuBtn, speedSlider, speedValue;

window.onload = function() {
    // Get DOM elements
    mainMenu = document.getElementById('mainMenu');
    levelSelect = document.getElementById('levelSelect');
    startGameBtn = document.getElementById('startGameBtn');
    selectLevelBtn = document.getElementById('selectLevelBtn');
    backToMenuBtn = document.getElementById('backToMenuBtn');
    speedSlider = document.getElementById('speedSlider');
    speedValue = document.getElementById('speedValue');
    
    // Setup canvas
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');
    
    // Add event listeners for menu buttons
    startGameBtn.addEventListener('click', startGame);
    selectLevelBtn.addEventListener('click', showLevelSelect);
    backToMenuBtn.addEventListener('click', showMainMenu);
    
    // Add level button listeners
    for (let i = 1; i <= 10; i++) {
        const btn = document.getElementById('level' + i + 'Btn');
        if (btn) {
            btn.addEventListener('click', () => startLevel(i));
        }
    }
    
    // Speed slider listener
    speedSlider.addEventListener('input', function() {
        playerVelocityX = parseInt(this.value);
        speedValue.textContent = this.value;
        player.velocityX = playerVelocityX;
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Start the game loop
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
    powerUps = [];
    
    // Clear all balls except the first one
    balls = [{
        x: boardWidth / 2 - ballWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX * (Math.random() > 0.5 ? 1 : -1),
        velocityY: -ballVelocityY,
        piercing: false,
        pierceTimer: 0
    }];
    
    // Reset player
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX,
        originalWidth: playerWidth,
        widthTimer: 0
    };
    
    // Load specific level layout
    switch(level) {
        case 1:
            createLevel1();
            break;
        case 2:
            createLevel2();
            break;
        case 3:
            createLevel3();
            break;
        case 4:
            createLevel4();
            break;
        case 5:
            createLevel5();
            break;
        case 6:
            createLevel6();
            break;
        case 7:
            createLevel7();
            break;
        case 8:
            createLevel8();
            break;
        case 9:
            createLevel9();
            break;
        case 10:
            createLevel10();
            break;
    }
}

// Level 1: Basic grid, no walls
function createLevel1() {
    createBlockGrid(8, 3, 'skyblue');
}

// Level 2: Grid with walls, some gaps
function createLevel2() {
    createWalls();
    createBlockGrid(7, 4, 'orange');
    // Add some random gaps
    for (let i = 0; i < 4; i++) {
        let randomIndex = Math.floor(Math.random() * blockArray.length);
        if (blockArray[randomIndex] && !blockArray[randomIndex].break) {
            blockArray[randomIndex].break = true;
            blockCount--;
        }
    }
}

// Level 3: Inverted pyramid with walls
function createLevel3() {
    createWalls();
    createPyramidBlocks();
}

// Level 4: Staircase pattern (no walls)
function createLevel4() {
    blockArray = [];
    let rows = 5;
    for (let r = 0; r < rows; r++) {
        let cols = r + 2;
        for (let c = 0; c < cols; c++) {
            addBlock(
                blockX + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                'lime'
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 5: Heart-shaped empty center with walls
function createLevel5() {
    createWalls();
    blockArray = [];
    
    // Create a grid with heart-shaped hole
    let centerX = boardWidth / 2;
    let centerY = blockY + blockHeight * 2;
    
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
            let bx = blockX + c * blockWidth + c * 10;
            let by = blockY + r * blockHeight + r * 10;
            let blockCenterX = bx + blockWidth / 2;
            let blockCenterY = by + blockHeight / 2;
            
            // Heart formula (simplified)
            let dx = (blockCenterX - centerX) / 80;
            let dy = -(blockCenterY - centerY) / 60;
            
            // Skip blocks in heart shape
            let inHeart = Math.pow(dx * dx + dy * dy - 1, 3) - dx * dx * dy * dy * dy < 0;
            if (!inHeart && r > 0) {
                addBlock(bx, by, 'pink');
            } else if (r === 0) {
                addBlock(bx, by, 'pink');
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 6: Double nested frame with walls
function createLevel6() {
    createWalls();
    blockArray = [];
    
    // Outer frame
    for (let c = 0; c < 8; c++) {
        addBlock(blockX + c * blockWidth + c * 10, blockY, 'cyan');
        addBlock(blockX + c * blockWidth + c * 10, blockY + 4 * blockHeight + 4 * 10, 'cyan');
    }
    for (let r = 0; r < 5; r++) {
        addBlock(blockX, blockY + r * blockHeight + r * 10, 'cyan');
        addBlock(blockX + 7 * blockWidth + 7 * 10, blockY + r * blockHeight + r * 10, 'cyan');
    }
    
    // Inner frame
    let innerX = blockX + blockWidth + 20;
    let innerY = blockY + blockHeight + 20;
    for (let c = 0; c < 6; c++) {
        addBlock(innerX + c * blockWidth + c * 10, innerY, 'yellow');
        addBlock(innerX + c * blockWidth + c * 10, innerY + 2 * blockHeight + 2 * 10, 'yellow');
    }
    for (let r = 0; r < 3; r++) {
        addBlock(innerX, innerY + r * blockHeight + r * 10, 'yellow');
        addBlock(innerX + 5 * blockWidth + 5 * 10, innerY + r * blockHeight + r * 10, 'yellow');
    }
    
    blockCount = blockArray.length;
}

// Level 7: Zigzag pattern (no walls)
function createLevel7() {
    blockArray = [];
    let rows = 6;
    
    for (let r = 0; r < rows; r++) {
        let startCol = r % 2 === 0 ? 0 : 1;
        for (let c = startCol; c < 8; c += 2) {
            let color = r % 2 === 0 ? 'orange' : 'skyblue';
            addBlock(
                blockX + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                color
            );
        }
    }
    blockCount = blockArray.length;
}

// Level 8: Circular ring pattern with walls
function createLevel8() {
    createWalls();
    blockArray = [];
    
    let centerX = boardWidth / 2;
    let centerY = blockY + blockHeight * 3;
    
    // Create concentric circles
    for (let ring = 0; ring < 3; ring++) {
        let radius = 60 + ring * 40;
        let numBlocks = 8 + ring * 4;
        
        for (let i = 0; i < numBlocks; i++) {
            let angle = (i / numBlocks) * Math.PI * 2;
            let bx = centerX + Math.cos(angle) * radius - blockWidth / 2;
            let by = centerY + Math.sin(angle) * radius * 0.6 - blockHeight / 2;
            
            // Only add if within reasonable area
            if (by > blockY && by < blockY + blockHeight * 7) {
                let colors = ['skyblue', 'orange', 'lime', 'pink', 'cyan'];
                addBlock(bx, by, colors[ring]);
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 9: Chaotic random pattern (no walls)
function createLevel9() {
    blockArray = [];
    
    // Create a base grid
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 8; c++) {
            // 70% chance to place a block
            if (Math.random() < 0.7) {
                let colors = ['skyblue', 'orange', 'lime', 'pink', 'yellow', 'cyan'];
                addBlock(
                    blockX + c * blockWidth + c * 10,
                    blockY + r * blockHeight + r * 10,
                    colors[Math.floor(Math.random() * colors.length)]
                );
            }
        }
    }
    blockCount = blockArray.length;
}

// Level 10: Ultimate challenge - dense with walls and strategic gaps
function createLevel10() {
    createWalls();
    blockArray = [];
    
    // Full dense grid first
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            let colors = ['red', 'orange', 'yellow', 'lime', 'cyan', 'skyblue', 'pink'];
            addBlock(
                blockX + wallThickness + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                colors[r]
            );
        }
    }
    
    // Add some strategic gaps for difficulty
    let gaps = [
        {r: 3, c: 3},
        {r: 2, c: 1},
        {r: 4, c: 5},
        {r: 1, c: 5},
        {r: 5, c: 2}
    ];
    
    for (let gap of gaps) {
        // Find and remove that block
        for (let i = blockArray.length - 1; i >= 0; i--) {
            let block = blockArray[i];
            let expectedX = blockX + wallThickness + gap.c * blockWidth + gap.c * 10;
            let expectedY = blockY + gap.r * blockHeight + gap.r * 10;
            
            if (Math.abs(block.x - expectedX) < 5 && Math.abs(block.y - expectedY) < 5) {
                blockArray.splice(i, 1);
                blockCount--;
                break;
            }
        }
    }
}

// Helper functions
function createWalls() {
    walls.push({
        x: 0,
        y: 0,
        width: wallThickness,
        height: boardHeight
    });
    
    walls.push({
        x: boardWidth - wallThickness,
        y: 0,
        width: wallThickness,
        height: boardHeight
    });
    
    walls.push({
        x: 0,
        y: 0,
        width: boardWidth,
        height: wallThickness
    });
}

function createBlockGrid(columns, rows, color) {
    blockColumns = columns;
    blockRows = rows;
    blockArray = [];
    
    let startX = walls.length > 0 ? blockX + wallThickness : blockX;
    let availableWidth = walls.length > 0 ? boardWidth - 2 * wallThickness : boardWidth;
    let totalBlockWidth = columns * blockWidth + (columns - 1) * 10;
    let centerOffset = (availableWidth - totalBlockWidth) / 2;
    
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            addBlock(
                startX + centerOffset + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                color
            );
        }
    }
    blockCount = blockArray.length;
}

function createPyramidBlocks() {
    blockArray = [];
    let startX = walls.length > 0 ? blockX + wallThickness : blockX;
    let availableWidth = walls.length > 0 ? boardWidth - 2 * wallThickness : boardWidth;
    
    let rows = 5;
    for (let r = 0; r < rows; r++) {
        let cols = rows - r;
        let totalWidth = cols * blockWidth + (cols - 1) * 10;
        let centerOffset = (availableWidth - totalWidth) / 2;
        
        for (let c = 0; c < cols; c++) {
            addBlock(
                startX + centerOffset + c * blockWidth + c * 10,
                blockY + r * blockHeight + r * 10,
                getRandomColor()
            );
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

function getRandomColor() {
    const colors = ['skyblue', 'orange', 'lime', 'pink', 'yellow', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function update() {
    context.clearRect(0, 0, board.width, board.height);
    
    // Update player power-up timers
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
    
    // Draw walls
    context.fillStyle = 'gray';
    for (let wall of walls) {
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Player
    context.fillStyle = 'lightgreen';
    context.fillRect(player.x, player.y, player.width, player.height);
    
    // Update balls
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
        for (let wall of walls) {
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
            if (ball.y + ball.height - player.y < 5) {
                ball.velocityY = -Math.abs(ball.velocityY);
                let hitPos = (ball.x + ball.width / 2) - player.x;
                let paddleCenter = player.width / 2;
                let angle = (hitPos - paddleCenter) / paddleCenter;
                ball.velocityX = angle * 5;
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
                
                if (Math.random() < 0.2) {
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
    
    // Update power-ups - 掉出屏幕只是消失，不影响游戏
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
        
        // 道具掉出屏幕 - 只是移除，不影响游戏
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
        score += 100 * blockRows * blockColumns;
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
    
    // 调整分数显示位置 - 移到更下面避免被遮挡
    context.font = '20px sans-serif';
    context.fillStyle = 'white';
    context.fillText('Score: ' + score, 10, 45);
    
    context.fillText('Level: ' + currentLevel, boardWidth - 90, 45);
    
    // 道具提示也调整位置
    if (powerUpNotification.timer > 0) {
        if (Math.floor(powerUpNotification.timer / 5) % 2 === 0) {
            context.font = '16px sans-serif';
            context.fillStyle = 'yellow';
            context.fillText(powerUpNotification.text, 100, 45);
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
            player.widthTimer = 300;
            showPowerUpNotification('Paddle Extended!');
            break;
            
        case PowerUpType.PIERCE:
            for (let ball of balls) {
                ball.piercing = true;
                ball.pierceTimer = 300;
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
