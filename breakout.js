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
const maxLevels = 3;

// Board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// Player (paddle)
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 20; // 移速加快一倍

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

// Walls (for level 2 and 3)
let walls = [];
let wallThickness = 10;

// Power-ups
let powerUps = [];
let powerUpWidth = 20;
let powerUpHeight = 20;
let powerUpSpeed = 2;

// Power-up types
const PowerUpType = {
    EXTEND: 'extend',    // 绿色 - 挡板变长
    PIERCE: 'pierce',    // 红色 - 穿透
    MULTI: 'multi'       // 蓝色 - 多球
};

// Power-up notification
let powerUpNotification = {
    text: '',
    timer: 0,
    maxTimer: 60 // 1 second at 60fps
};

let score = 0;

// DOM elements
let mainMenu, levelSelect, startGameBtn, selectLevelBtn;
let level1Btn, level2Btn, level3Btn, backToMenuBtn;

window.onload = function() {
    // Get DOM elements
    mainMenu = document.getElementById('mainMenu');
    levelSelect = document.getElementById('levelSelect');
    startGameBtn = document.getElementById('startGameBtn');
    selectLevelBtn = document.getElementById('selectLevelBtn');
    level1Btn = document.getElementById('level1Btn');
    level2Btn = document.getElementById('level2Btn');
    level3Btn = document.getElementById('level3Btn');
    backToMenuBtn = document.getElementById('backToMenuBtn');
    
    // Setup canvas
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');
    
    // Add event listeners for menu buttons
    startGameBtn.addEventListener('click', startGame);
    selectLevelBtn.addEventListener('click', showLevelSelect);
    level1Btn.addEventListener('click', () => startLevel(1));
    level2Btn.addEventListener('click', () => startLevel(2));
    level3Btn.addEventListener('click', () => startLevel(3));
    backToMenuBtn.addEventListener('click', showMainMenu);
    
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
    
    // Different level layouts
    switch(level) {
        case 1:
            // Level 1: Simple grid, no walls
            createBlockGrid(8, 3, 'skyblue');
            break;
            
        case 2:
            // Level 2: Grid with walls, different pattern
            createWalls();
            createBlockGrid(7, 4, 'orange');
            // Add some gaps for variety
            for (let i = 0; i < 3; i++) {
                let randomIndex = Math.floor(Math.random() * blockArray.length);
                blockArray[randomIndex].break = true;
                blockCount--;
            }
            break;
            
        case 3:
            // Level 3: Complex pattern with walls
            createWalls();
            // Create a pyramid-like pattern
            createPyramidBlocks();
            break;
    }
}

function createWalls() {
    // Left wall
    walls.push({
        x: 0,
        y: 0,
        width: wallThickness,
        height: boardHeight
    });
    
    // Right wall
    walls.push({
        x: boardWidth - wallThickness,
        y: 0,
        width: wallThickness,
        height: boardHeight
    });
    
    // Top wall
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
    
    // Adjust starting position based on walls
    let startX = currentLevel >= 2 ? blockX + wallThickness : blockX;
    let availableWidth = currentLevel >= 2 ? boardWidth - 2 * wallThickness : boardWidth;
    let totalBlockWidth = columns * blockWidth + (columns - 1) * 10;
    let centerOffset = (availableWidth - totalBlockWidth) / 2;
    
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            let block = {
                x: startX + centerOffset + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false,
                color: color
            };
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function createPyramidBlocks() {
    blockArray = [];
    let startX = currentLevel >= 2 ? blockX + wallThickness : blockX;
    let availableWidth = currentLevel >= 2 ? boardWidth - 2 * wallThickness : boardWidth;
    
    // Create a pyramid pattern
    let rows = 5;
    for (let r = 0; r < rows; r++) {
        let cols = rows - r;
        let totalWidth = cols * blockWidth + (cols - 1) * 10;
        let centerOffset = (availableWidth - totalWidth) / 2;
        
        for (let c = 0; c < cols; c++) {
            let block = {
                x: startX + centerOffset + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false,
                color: getRandomColor()
            };
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
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
            // Shrink back to original width
            let widthDiff = player.width - player.originalWidth;
            player.x += widthDiff / 2;
            player.width = player.originalWidth;
        }
    }
    
    // Update power-up notifications
    if (powerUpNotification.timer > 0) {
        powerUpNotification.timer--;
    }
    
    // Update and draw walls
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
        
        // Update pierce timer
        if (ball.piercing) {
            ball.pierceTimer--;
            if (ball.pierceTimer <= 0) {
                ball.piercing = false;
            }
        }
        
        // Move ball
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // Draw ball
        context.fillStyle = ball.piercing ? 'red' : 'white';
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
        
        // Wall collisions (for levels with walls)
        let wallHit = false;
        for (let wall of walls) {
            if (detectCollision(ball, wall)) {
                // Determine which side was hit
                let overlapLeft = (ball.x + ball.width) - wall.x;
                let overlapRight = (wall.x + wall.width) - ball.x;
                let overlapTop = (ball.y + ball.height) - wall.y;
                let overlapBottom = (wall.y + wall.height) - ball.y;
                
                let minOverlapX = Math.min(overlapLeft, overlapRight);
                let minOverlapY = Math.min(overlapTop, overlapBottom);
                
                if (minOverlapX < minOverlapY) {
                    ball.velocityX *= -1;
                    // Push ball out of wall
                    if (overlapLeft < overlapRight) {
                        ball.x = wall.x - ball.width;
                    } else {
                        ball.x = wall.x + wall.width;
                    }
                } else {
                    ball.velocityY *= -1;
                    // Push ball out of wall
                    if (overlapTop < overlapBottom) {
                        ball.y = wall.y - ball.height;
                    } else {
                        ball.y = wall.y + wall.height;
                    }
                }
                wallHit = true;
                break;
            }
        }
        
        // If no walls, use original boundary checks
        if (!wallHit && walls.length === 0) {
            if (ball.y <= 0) {
                ball.velocityY *= -1;
            }
            else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
                ball.velocityX *= -1;
            }
        }
        
        // Ball fell below
        if (ball.y + ball.height >= boardHeight) {
            balls.splice(i, 1);
            continue;
        }
        
        // Paddle collision
        if (detectCollision(ball, player)) {
            // Hit top of paddle
            if (ball.y + ball.height - player.y < 5) {
                ball.velocityY = -Math.abs(ball.velocityY);
                // Adjust angle based on where it hits the paddle
                let hitPos = (ball.x + ball.width / 2) - player.x;
                let paddleCenter = player.width / 2;
                let angle = (hitPos - paddleCenter) / paddleCenter;
                ball.velocityX = angle * 5;
            }
            // Hit bottom of paddle (rare)
            else if (player.y + player.height - ball.y < 5) {
                ball.velocityY = Math.abs(ball.velocityY);
            }
            // Hit sides
            else {
                ball.velocityX *= -1;
            }
        }
        
        // Block collisions
        for (let j = 0; j < blockArray.length; j++) {
            let block = blockArray[j];
            if (!block.break && detectCollision(ball, block)) {
                block.break = true;
                score += 100;
                blockCount -= 1;
                
                // Random power-up drop (20% chance)
                if (Math.random() < 0.2) {
                    spawnPowerUp(block.x + block.width / 2, block.y + block.height / 2);
                }
                
                // Only bounce if not piercing
                if (!ball.piercing) {
                    // Determine collision side
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
    
    // Check if all balls are gone
    if (balls.length === 0) {
        context.font = '20px sans-serif';
        context.fillText('Game Over: Press Space to Restart', 80, 400);
        context.fillText('Press ESC for Menu', 80, 430);
        currentGameState = GameState.GAME_OVER;
        return;
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.y += powerUpSpeed;
        
        // Draw power-up with animation
        context.fillStyle = powerUp.color;
        
        // Pulsing animation
        let pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
        let pw = powerUpWidth * pulse;
        let ph = powerUpHeight * pulse;
        let px = powerUp.x - pw / 2;
        let py = powerUp.y - ph / 2;
        
        // Draw rounded rectangle-like shape
        context.beginPath();
        context.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
        context.fill();
        
        // Draw symbol
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
        
        // Remove if out of bounds
        if (powerUp.y > boardHeight) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (detectCollision(powerUp, player)) {
            applyPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
    }
    
    // Draw blocks
    for (let block of blockArray) {
        if (!block.break) {
            context.fillStyle = block.color;
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    
    // Next level
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
    
    // Score
    context.font = '20px sans-serif';
    context.fillStyle = 'white';
    context.fillText('Score: ' + score, 10, 25);
    
    // Level indicator
    context.fillText('Level: ' + currentLevel, boardWidth - 90, 25);
    
    // Power-up notification
    if (powerUpNotification.timer > 0) {
        // Flash effect
        if (Math.floor(powerUpNotification.timer / 5) % 2 === 0) {
            context.font = '16px sans-serif';
            context.fillStyle = 'yellow';
            context.fillText(powerUpNotification.text, 100, 25);
        }
    }
}

function render() {
    // Render is handled in update for now
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
            // Extend paddle
            let extension = 40;
            player.width += extension;
            player.x -= extension / 2;
            player.widthTimer = 300; // 5 seconds
            showPowerUpNotification('Paddle Extended!');
            break;
            
        case PowerUpType.PIERCE:
            // Make all balls piercing
            for (let ball of balls) {
                ball.piercing = true;
                ball.pierceTimer = 300; // 5 seconds
            }
            showPowerUpNotification('Piercing Ball!');
            break;
            
        case PowerUpType.MULTI:
            // Add a new ball
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
                // If against wall, stop at wall
                if (currentLevel >= 2) {
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
                // If against wall, stop at wall
                if (currentLevel >= 2) {
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
    if (currentLevel >= 2) {
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
