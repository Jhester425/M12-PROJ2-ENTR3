const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const lifeElement = document.getElementById('life');
const levelElement = document.getElementById('level');
const highscoreElement = document.getElementById('highscore');
const playPauseButton = document.getElementById('playPauseButton');
const pauseButton = document.getElementById('pauseButton');
const speedInput = document.getElementById('speed');
const instructionsButton = document.getElementById('instructions');

let gameInterval;
let snake = [{ x: 4, y: 4 }];
let direction = 'RIGHT';
let food = { x: 6, y: 6 };
let obstacles = []; // Obstacles on the board
let speed = 3;  // Slower speed (you can increase this for faster gameplay)
let score = 0;
let life = 100;
let level = 1;
let highScore = 0;
let isPaused = false;
let gridSize = 10;

// Initialize the game board
function createGameBoard(size) {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 30px)`;
    gameBoard.style.gridTemplateRows = `repeat(${size}, 30px)`;

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        gameBoard.appendChild(cell);
    }
}

// Draw snake, food, and obstacles
function drawGame() {
    const cells = gameBoard.children;
    Array.from(cells).forEach(cell => {
        // Clear all previous styles
        cell.classList.remove('snake', 'food', 'bush', 'tree', 'rock');
    });

    // Draw snake
    snake.forEach(segment => {
        const index = segment.y * gridSize + segment.x;
        cells[index].classList.add('snake');
    });

    // Draw food
    const foodIndex = food.y * gridSize + food.x;
    cells[foodIndex].classList.add('food');

    // Draw obstacles
    obstacles.forEach(obstacle => {
        const index = obstacle.y * gridSize + obstacle.x;
        cells[index].classList.add(obstacle.type);
    });
}

// Handle keypress for snake movement
function handleKeyPress(event) {
    if (event.key === 'ArrowUp' && direction !== 'DOWN') {
        direction = 'UP';
    } else if (event.key === 'ArrowDown' && direction !== 'UP') {
        direction = 'DOWN';
    } else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (event.key === 'ArrowRight' && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
}

// Move the snake, check for food and collisions
function gameLoop() {
    if (isPaused) return;

    const head = { ...snake[0] };

    // Move snake in the current direction
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;

    // Wrap around edges
    if (head.x < 0) head.x = gridSize - 1;
    if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    if (head.y >= gridSize) head.y = 0;

    // Check for collision with body
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Check for collision with obstacles
    const obstacleHit = obstacles.find(obstacle => obstacle.x === head.x && obstacle.y === head.y);
    if (obstacleHit) {
        life -= obstacleHit.damage;
        obstacles = obstacles.filter(obstacle => obstacle !== obstacleHit); // Remove obstacle after hit
        if (life <= 0) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        increaseHealth(0.2); // Increase health by 0.2 for every food eaten
        levelUp();
        generateFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }

    scoreElement.innerText = score;
    levelElement.innerText = level;
    lifeElement.innerText = Math.floor(life); // Update life display
    highscoreElement.innerText = highScore;

    drawGame();
}

// Generate new food
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

// Generate obstacles based on level
function generateObstacles() {
    obstacles = [];
    const numObstacles = level; // Increase number of obstacles with level

    for (let i = 0; i < numObstacles; i++) {
        const obstacleType = Math.random() < 0.6 ? 'bush' : Math.random() < 0.9 ? 'tree' : 'rock';
        obstacles.push({
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
            type: obstacleType,
            damage: obstacleType === 'bush' ? 5 : obstacleType === 'tree' ? 10 : 20
        });
    }
}

// Level up and adjust grid size
function levelUp() {
    if (score % 50 === 0) {
        level++;
        gridSize = level + 9;  // 10x10, 11x11, 12x12...
        createGameBoard(gridSize);
        generateObstacles();
    }
}

// Increase health when food is eaten (up to a max of 100)
function increaseHealth(amount) {
    life = Math.min(life + amount, 100); // Max health is 100
    lifeElement.innerText = Math.floor(life); // Update life display
}

// Pause the game
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        pauseButton.innerText = 'Resume';
    } else {
        gameInterval = setInterval(gameLoop, 1000 / speed);
        pauseButton.innerText = 'Pause';
    }
}

// End the game
function endGame() {
    alert(`Game Over! Final Score: ${score}`);
    if (score > highScore) {
        highScore = score;
        highscoreElement.innerText = highScore;
    }
    resetGame();
}

// Reset the game
function resetGame() {
    snake = [{ x: 4, y: 4 }];
    score = 0;
    level = 1;
    life = 100;
    direction = 'RIGHT';
    gridSize = 10;
    createGameBoard(gridSize);
    generateFood();
    generateObstacles();
    drawGame();
}

// Event Listeners
document.addEventListener('keydown', handleKeyPress);
speedInput.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    if (!isPaused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / speed);
    }
});

playPauseButton.addEventListener('click', () => {
    resetGame();
    gameInterval = setInterval(gameLoop, 1000 / speed);
    playPauseButton.style.display = 'none';
    pauseButton.style.display = 'block';
});

pauseButton.addEventListener('click', togglePause);

// Initialize game
createGameBoard(gridSize);
generateObstacles();
drawGame();
