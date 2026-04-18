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

let levelValidationResults = [];
let showValidation = false;

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
    levelValidationResults = [];
    
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
    
    blockCount = blockArray.length;
    
    validateLevel();
    
    if (levelValidationResults.length > 0) {
        console.log("=== Level " + level + " Validation Results ===");
        for (let i = 0; i < levelValidationResults.length; i++) {
            let result = levelValidationResults[i];
            console.log("Block " + i + ": visible=" + result.isVisible + 
                       ", hasPath=" + result.hasPath + 
                       ", exposedPercent=" + result.exposedPercent.toFixed(1) + "%");
        }
    }
}

function getAllWalls() {
    return walls.concat(innerWalls);
}

function isBlockExposed(block) {
    let exposedSides = {
        top: true,
        bottom: true,
        left: true,
        right: true
    };
    
    let allWalls = getAllWalls();
    
    for (let wall of allWalls) {
        let overlapX = (block.x < wall.x + wall.width) && (block.x + blockWidth > wall.x);
        let overlapY = (block.y < wall.y + wall.height) && (block.y + blockHeight > wall.y);
        
        if (overlapX && overlapY) {
            if (block.y + blockHeight <= wall.y && 
                block.x + blockWidth > wall.x && block.x < wall.x + wall.width) {
                let overlap = Math.min(block.x + blockWidth, wall.x + wall.width) - 
                             Math.max(block.x, wall.x);
                if (overlap >= blockWidth * 0.5) {
                    exposedSides.bottom = false;
                }
            }
            if (block.y >= wall.y + wall.height && 
                block.x + blockWidth > wall.x && block.x < wall.x + wall.width) {
                let overlap = Math.min(block.x + blockWidth, wall.x + wall.width) - 
                             Math.max(block.x, wall.x);
                if (overlap >= blockWidth * 0.5) {
                    exposedSides.top = false;
                }
            }
            if (block.x + blockWidth <= wall.x && 
                block.y + blockHeight > wall.y && block.y < wall.y + wall.height) {
                let overlap = Math.min(block.y + blockHeight, wall.y + wall.height) - 
                             Math.max(block.y, wall.y);
                if (overlap >= blockHeight * 0.5) {
                    exposedSides.right = false;
                }
            }
            if (block.x >= wall.x + wall.width && 
                block.y + blockHeight > wall.y && block.y < wall.y + wall.height) {
                let overlap = Math.min(block.y + blockHeight, wall.y + wall.height) - 
                             Math.max(block.y, wall.y);
                if (overlap >= blockHeight * 0.5) {
                    exposedSides.left = false;
                }
            }
        }
    }
    
    let hasAnySideExposed = exposedSides.top || exposedSides.bottom || 
                           exposedSides.left || exposedSides.right;
    
    let totalSides = 4;
    let exposedCount = 0;
    if (exposedSides.top) exposedCount++;
    if (exposedSides.bottom) exposedCount++;
    if (exposedSides.left) exposedCount++;
    if (exposedSides.right) exposedCount++;
    
    let exposedPercent = (exposedCount / totalSides) * 100;
    
    return {
        isVisible: hasAnySideExposed,
        exposedPercent: exposedPercent,
        exposedSides: exposedSides
    };
}

function simulatePathToBlock(block, startX, startY, dirX, dirY, maxSteps) {
    let x = startX;
    let y = startY;
    let dx = dirX;
    let dy = dirY;
    let stepSize = 2;
    let allWalls = getAllWalls();
    
    for (let step = 0; step < maxSteps; step++) {
        x += dx * stepSize;
        y += dy * stepSize;
        
        let ballRect = { x: x, y: y, width: ballWidth, height: ballHeight };
        
        if (detectCollision(ballRect, block)) {
            return true;
        }
        
        if (y > boardHeight + 50 || y < -50) {
            return false;
        }
        
        if (x < 0) {
            x = 0;
            dx = -dx;
        }
        if (x > boardWidth - ballWidth) {
            x = boardWidth - ballWidth;
            dx = -dx;
        }
        
        for (let wall of allWalls) {
            if (detectCollision(ballRect, wall)) {
                let overlapLeft = (ballRect.x + ballRect.width) - wall.x;
                let overlapRight = (wall.x + wall.width) - ballRect.x;
                let overlapTop = (ballRect.y + ballRect.height) - wall.y;
                let overlapBottom = (wall.y + wall.height) - ballRect.y;
                
                let minOverlapX = Math.min(overlapLeft, overlapRight);
                let minOverlapY = Math.min(overlapTop, overlapBottom);
                
                if (minOverlapX < minOverlapY) {
                    dx = -dx;
                    x = overlapLeft < overlapRight ? wall.x - ballRect.width : wall.x + wall.width;
                } else {
                    dy = -dy;
                    y = overlapTop < overlapBottom ? wall.y - ballRect.height : wall.y + wall.height;
                }
            }
        }
    }
    
    return false;
}

function hasValidHitPath(block) {
    let paddleY = player.y;
    let testAngles = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
    
    for (let angle of testAngles) {
        let rad = angle * Math.PI / 180;
        let dirX = Math.sin(rad);
        let dirY = -Math.abs(Math.cos(rad));
        
        for (let offset = 0; offset <= playerWidth; offset += playerWidth / 4) {
            let startX = player.x + offset;
            let startY = paddleY;
            
            if (simulatePathToBlock(block, startX, startY, dirX, dirY, 500)) {
                return true;
            }
        }
    }
    
    return false;
}

function validateLevel() {
    levelValidationResults = [];
    
    for (let block of blockArray) {
        let visibility = isBlockExposed(block);
        let hasPath = hasValidHitPath(block);
        
        levelValidationResults.push({
            block: block,
            isVisible: visibility.isVisible,
            exposedPercent: visibility.exposedPercent,
            exposedSides: visibility.exposedSides,
            hasPath: hasPath
        });
    }
}

function createOuterWalls() {
    walls.push({ x: 0, y: 0, width: wallThickness, height: boardHeight, color: '#666' });
    walls.push({ x: boardWidth - wallThickness, y: 0, width: wallThickness, height: boardHeight, color: '#666' });
    walls.push({ x: 0, y: 0, width: boardWidth, height: wallThickness, color: '#666' });
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

function createCenteredGrid(startY, rows, cols, color) {
    let startX = getPlayAreaLeft();
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = startX + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            addBlock(
                offsetX + c * blockWidth + c * spacing,
                startY + r * blockHeight + r * spacing,
                color
            );
        }
    }
}

// Level 1: 初级 - 简单网格，无墙
function createLevel1() {
    createCenteredGrid(40, 3, 8, 'skyblue');
}

// Level 2: 初级 - 稍大网格，无墙
function createLevel2() {
    createCenteredGrid(35, 4, 8, 'lime');
}

// Level 3: 初级 - 更大网格，无墙，彩色
function createLevel3() {
    let startY = 30;
    let rows = 5;
    let cols = 8;
    let colors = ['skyblue', 'lime', 'orange', 'cyan', 'pink'];
    
    let startX = getPlayAreaLeft();
    let spacing = 10;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = startX + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            addBlock(
                offsetX + c * blockWidth + c * spacing,
                startY + r * blockHeight + r * spacing,
                colors[r % colors.length]
            );
        }
    }
}

// Level 4: 中级 - 外围墙 + 横墙带缺口
function createLevel4() {
    createOuterWalls();
    
    let wallY = 200;
    let gapStart = boardWidth / 2 - 50;
    let gapEnd = boardWidth / 2 + 50;
    
    innerWalls.push({
        x: getPlayAreaLeft(),
        y: wallY,
        width: gapStart - getPlayAreaLeft(),
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: gapEnd,
        y: wallY,
        width: getPlayAreaRight() - gapEnd,
        height: wallThickness,
        color: '#888'
    });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 6;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
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
}

// Level 5: 中级 - 外围墙 + 中间竖墙带缺口
function createLevel5() {
    createOuterWalls();
    
    let wallX = boardWidth / 2 - wallThickness / 2;
    let gapY = 150;
    let gapHeight = 30;
    
    innerWalls.push({
        x: wallX,
        y: getPlayAreaTop(),
        width: wallThickness,
        height: gapY - getPlayAreaTop(),
        color: '#888'
    });
    innerWalls.push({
        x: wallX,
        y: gapY + gapHeight,
        width: wallThickness,
        height: 100,
        color: '#888'
    });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 3;
    
    let leftAreaWidth = wallX - getPlayAreaLeft();
    let leftTotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let leftOffset = getPlayAreaLeft() + (leftAreaWidth - leftTotalWidth) / 2;
    
    let rightAreaWidth = getPlayAreaRight() - (wallX + wallThickness);
    let rightTotalWidth = cols * blockWidth + (cols - 1) * spacing;
    let rightOffset = wallX + wallThickness + (rightAreaWidth - rightTotalWidth) / 2;
    
    for (let r = 0; r < 5; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY < 200) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    leftOffset + c * blockWidth + c * spacing,
                    blockY,
                    'lime'
                );
                addBlock(
                    rightOffset + c * blockWidth + c * spacing,
                    blockY,
                    'pink'
                );
            }
        }
    }
}

// Level 6: 中级 - 无外围墙 + 两个独立障碍墙
function createLevel6() {
    innerWalls.push({ x: 50, y: 140, width: 80, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 370, y: 140, width: 80, height: wallThickness, color: '#aaa' });
    innerWalls.push({ x: 200, y: 180, width: 100, height: wallThickness, color: '#aaa' });
    
    let startY = 35;
    let spacing = 10;
    let cols = 8;
    let rows = 4;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < rows; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < 135) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    ['skyblue', 'orange'][r % 2]
                );
            }
        }
    }
}

// Level 7: 中级 - 外围墙 + L形墙（带缺口）
function createLevel7() {
    createOuterWalls();
    
    let cornerX = getPlayAreaLeft() + 60;
    let cornerY = 160;
    let gapSize2 = 40;
    
    innerWalls.push({
        x: cornerX,
        y: cornerY,
        width: 100,
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: cornerX + 100 + gapSize2,
        y: cornerY,
        width: 50,
        height: wallThickness,
        color: '#888'
    });
    
    innerWalls.push({
        x: cornerX,
        y: cornerY,
        width: wallThickness,
        height: 50,
        color: '#888'
    });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 7;
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
}

// Level 8: 高级 - 三横墙带缺口
function createLevel8() {
    createOuterWalls();
    
    let wallY1 = 120;
    let wallY2 = 180;
    let gapCenter = boardWidth / 2;
    let gapWidth = 60;
    
    innerWalls.push({
        x: getPlayAreaLeft(),
        y: wallY1,
        width: gapCenter - gapWidth / 2 - getPlayAreaLeft(),
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: gapCenter + gapWidth / 2,
        y: wallY1,
        width: getPlayAreaRight() - (gapCenter + gapWidth / 2),
        height: wallThickness,
        color: '#888'
    });
    
    innerWalls.push({
        x: getPlayAreaLeft(),
        y: wallY2,
        width: gapCenter - gapWidth / 2 - getPlayAreaLeft(),
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: gapCenter + gapWidth / 2,
        y: wallY2,
        width: getPlayAreaRight() - (gapCenter + gapWidth / 2),
        height: wallThickness,
        color: '#888'
    });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 6;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    
    for (let r = 0; r < 3; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < wallY1) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    'red'
                );
            }
        }
    }
}

// Level 9: 高级 - 十字墙带缺口
function createLevel9() {
    createOuterWalls();
    
    let centerX = boardWidth / 2;
    let centerY = 150;
    let gapSize2 = 50;
    
    innerWalls.push({
        x: getPlayAreaLeft(),
        y: centerY,
        width: centerX - gapSize2 / 2 - getPlayAreaLeft(),
        height: wallThickness,
        color: '#888'
    });
    innerWalls.push({
        x: centerX + gapSize2 / 2,
        y: centerY,
        width: getPlayAreaRight() - (centerX + gapSize2 / 2),
        height: wallThickness,
        color: '#888'
    });
    
    innerWalls.push({
        x: centerX - wallThickness / 2,
        y: getPlayAreaTop(),
        width: wallThickness,
        height: centerY - gapSize2 / 2 - getPlayAreaTop(),
        color: '#888'
    });
    innerWalls.push({
        x: centerX - wallThickness / 2,
        y: centerY + gapSize2 / 2,
        width: wallThickness,
        height: 80,
        color: '#888'
    });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 3;
    
    let positions = [
        { x: getPlayAreaLeft(), y: startY, maxY: centerY - 20, color: 'skyblue' },
        { x: centerX + gapSize2, y: startY, maxY: centerY - 20, color: 'orange' },
        { x: getPlayAreaLeft(), y: centerY + 30, maxY: 250, color: 'lime' },
        { x: centerX + gapSize2, y: centerY + 30, maxY: 250, color: 'pink' }
    ];
    
    for (let pos of positions) {
        let totalWidth = cols * blockWidth + (cols - 1) * spacing;
        let zoneWidth = (pos.x < centerX) ? 
            (centerX - wallThickness/2 - pos.x) : 
            (getPlayAreaRight() - pos.x);
        let offsetX = pos.x + (zoneWidth - totalWidth) / 2;
        
        let r = 0;
        while (true) {
            let blockY = pos.y + r * blockHeight + r * spacing;
            if (blockY + blockHeight + gapSize > pos.maxY) break;
            
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    pos.color
                );
            }
            r++;
        }
    }
}

// Level 10: 高级 - 复杂迷宫（多缺口）
function createLevel10() {
    createOuterWalls();
    
    let gapSize2 = 50;
    let centerX = boardWidth / 2;
    
    innerWalls.push({ x: getPlayAreaLeft(), y: 110, width: centerX - gapSize2/2 - getPlayAreaLeft(), height: wallThickness, color: '#777' });
    innerWalls.push({ x: centerX + gapSize2/2, y: 110, width: getPlayAreaRight() - (centerX + gapSize2/2), height: wallThickness, color: '#777' });
    
    innerWalls.push({ x: getPlayAreaLeft(), y: 160, width: centerX - gapSize2 - getPlayAreaLeft(), height: wallThickness, color: '#777' });
    innerWalls.push({ x: centerX + gapSize2, y: 160, width: getPlayAreaRight() - (centerX + gapSize2), height: wallThickness, color: '#777' });
    innerWalls.push({ x: centerX - gapSize2/2, y: 160, width: gapSize2, height: wallThickness, color: '#777' });
    
    innerWalls.push({ x: centerX - wallThickness/2, y: 110 + gapSize2, width: wallThickness, height: 100, color: '#777' });
    
    innerWalls.push({ x: centerX - 80, y: 250, width: 160, height: wallThickness, color: '#777' });
    
    let startY = getPlayAreaTop() + 20;
    let spacing = 10;
    let cols = 8;
    let totalWidth = cols * blockWidth + (cols - 1) * spacing;
    let offsetX = getPlayAreaLeft() + (getPlayAreaWidth() - totalWidth) / 2;
    let colors = ['red', 'orange', 'yellow', 'lime', 'cyan'];
    
    for (let r = 0; r < 3; r++) {
        let blockY = startY + r * blockHeight + r * spacing;
        if (blockY + blockHeight + gapSize < 105) {
            for (let c = 0; c < cols; c++) {
                addBlock(
                    offsetX + c * blockWidth + c * spacing,
                    blockY,
                    colors[r % colors.length]
                );
            }
        }
    }
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
        let allWalls = getAllWalls();
        
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
    
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            context.fillStyle = block.color;
            context.fillRect(block.x, block.y, block.width, block.height);
            
            if (showValidation && i < levelValidationResults.length) {
                let result = levelValidationResults[i];
                if (!result.isVisible || !result.hasPath) {
                    context.strokeStyle = 'red';
                    context.lineWidth = 2;
                    context.strokeRect(block.x - 2, block.y - 2, block.width + 4, block.height + 4);
                }
            }
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
    let textX = walls.length > 0 ? (wallThickness + gapSize + 10) : 30;
    context.fillText('Score: ' + score, textX, textY);
    
    let levelText = 'Level: ' + currentLevel;
    let levelTextWidth = context.measureText(levelText).width;
    let levelX = walls.length > 0 ? 
        (boardWidth - wallThickness - gapSize - levelTextWidth - 10) : 
        (boardWidth - levelTextWidth - 30);
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
    if (e.code === 'KeyV') {
        showValidation = !showValidation;
    }
    
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
