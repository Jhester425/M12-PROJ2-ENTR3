const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const lifePercentage = document.getElementById('lifePercentage'); // Update for life percentage
const levelElement = document.getElementById('level');
const highscoreElement = document.getElementById('highscore');
const playPauseButton = document.getElementById('playPauseButton');
const pauseButton = document.getElementById('pauseButton');
const speedInput = document.getElementById('speed');
const lifeBarFill = document.getElementById('lifeBarFill'); // Update for life bar fill

let gameInterval;
let obstacleInterval;
let snake = [{ x: 4, y: 4 }];
let direction = 'RIGHT';
let food = { x: 6, y: 6 };
let obstacles = [];
let speed = 3;
let score = 0;
let life = 100;
let level = 1;
let highScore = 0;
let isPaused = false;
let gridSize = 10;
let currentFoodImage; // Stores the current food image URL

// Initialize the game board
function createGameBoard(size) {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 32px)`;
    gameBoard.style.gridTemplateRows = `repeat(${size}, 32px)`;

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell'); // Add the base cell class
        gameBoard.appendChild(cell);
    }
}

// Draw snake, food, and obstacles
function drawGame() {
    const cells = gameBoard.children;
    Array.from(cells).forEach(cell => {
        cell.style.backgroundImage = ''; // Clear all cell images
        cell.style.transform = ''; // Reset transformations
    });

    // Draw snake
    snake.forEach((segment, index) => {
        const cellIndex = segment.y * gridSize + segment.x;
        const imageUrl = index === 0 ? 'fotos/head.png' : 'fotos/body.png'; // Head or body
        cells[cellIndex].style.backgroundImage = `url(${imageUrl})`;

        // Rotate the head based on direction
        if (index === 0) {
            const rotation = {
                'UP': 'rotate(270deg)',
                'DOWN': 'rotate(90deg)',
                'LEFT': 'rotate(180deg)',
                'RIGHT': 'rotate(0deg)'
            }[direction];
            cells[cellIndex].style.transform = rotation;
        }
    });

    // Draw food
    const foodIndex = food.y * gridSize + food.x;
    cells[foodIndex].style.backgroundImage = `url(${currentFoodImage})`;

    // Draw obstacles
    obstacles.forEach(obstacle => {
        const cellIndex = obstacle.y * gridSize + obstacle.x;
        const obstacleImage = `fotos/${obstacle.type}.png`; // bush.png, tree.png, or rock.png
        cells[cellIndex].style.backgroundImage = `url(${obstacleImage})`;
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
    const obstacleHitIndex = obstacles.findIndex(obstacle => obstacle.x === head.x && obstacle.y === head.y);
    if (obstacleHitIndex !== -1) {
        life -= obstacles[obstacleHitIndex].damage;
        obstacles.splice(obstacleHitIndex, 1); // Remove the obstacle
        updateLifeBar(); // Update the life bar
        if (life <= 0) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        increaseHealth(0.2);
        levelUp();
        generateFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }

    scoreElement.innerText = score;
    levelElement.innerText = level;
    highscoreElement.innerText = highScore;

    drawGame();
}

// Generate new food
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
             obstacles.some(obstacle => obstacle.x === food.x && obstacle.y === food.y));

    // Pick a random food image
    const foodImages = [
        'fotos/food1.png',
        'fotos/food2.png',
        'fotos/food3.png',
        'fotos/food4.png',
        'fotos/food5.png'
    ];
    currentFoodImage = foodImages[Math.floor(Math.random() * foodImages.length)];
}

// Generate a new obstacle every 10 seconds
function generateNewObstacle() {
    const obstacleType = Math.random() < 0.75 ? 'bush' : Math.random() < 0.95 ? 'tree' : 'rock';
    let newObstacle;
    do {
        newObstacle = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
            type: obstacleType,
            damage: obstacleType === 'bush' ? 5 : obstacleType === 'tree' ? 10 : 20
        };
    } while (
        snake.some(segment => segment.x === newObstacle.x && segment.y === newObstacle.y) ||
        obstacles.some(obstacle => obstacle.x === newObstacle.x && obstacle.y === newObstacle.y) ||
        (food.x === newObstacle.x && food.y === newObstacle.y)
    );

    obstacles.push(newObstacle);
}

// Level up and adjust grid size (stops expanding after score 490, expands every 70 points)
function levelUp() {
    if (score % 70 === 0 && score <= 420) { // Expand every 70 points and stop after 490
        level++;
        gridSize = level + 9;
        createGameBoard(gridSize);
        drawGame();
    }
}

// Increase health when food is eaten (up to a max of 100)
function increaseHealth(amount) {
    life = Math.min(life + amount, 100);
    updateLifeBar(); // Update the life bar
}

// Update life bar based on the current life value
function updateLifeBar() {
    const percentage = Math.max(0, Math.min(100, life)); // Ensure value stays between 0-100
    lifeBarFill.style.width = `${percentage}%`;
    lifePercentage.textContent = `${Math.floor(percentage)}%`;
}

// Pause the game
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        pauseButton.innerText = 'Resume';
    } else {
        gameInterval = setInterval(gameLoop, 1000 / speed);
        obstacleInterval = setInterval(generateNewObstacle, 10000);
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
    obstacles = [];
    createGameBoard(gridSize);
    generateFood();
    drawGame();
    updateLifeBar(); // Reset the life bar
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
    obstacleInterval = setInterval(generateNewObstacle, 10000);
    playPauseButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
});

pauseButton.addEventListener('click', togglePause);

// Initialize game
createGameBoard(gridSize);
generateFood();
drawGame();
updateLifeBar();
