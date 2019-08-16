class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var canvas = document.getElementById('canvas'),
    brush = canvas.getContext('2d'),
    text_isPaused = document.getElementById('paused'),
    text_score = document.getElementById('score'),
    text_highScore = document.getElementById('highScore'),
    pressedArrow = [],
    score = 0,
    highScore = 0,
    isPaused = false,
    speed_0 = 12,
    speed_1 = 24,
    currentSpeed = speed_0,
    intervalID,
    gridSize = new Vector2(50, 50),
    gridCellSize = new Vector2(canvas.width / gridSize.x, canvas.width / gridSize.y);

function snakeCell() {
    this.position = new Vector2(Math.round(gridSize.x / 2) * gridCellSize.x, Math.round(gridSize.y / 2) * gridCellSize.y);
    this.color = "white";

    this.setPosition = function (x, y) {
        this.position.x = x;
        this.position.y = y;
    }
    this.move = function (x, y) {
        this.position.x += x;
        this.position.y += y;
    }
    this.setColor = function (string) {
        this.color = string;
    }
    this.draw = function () {
        brush.fillStyle = this.color;
        brush.fillRect(this.position.x, this.position.y, gridCellSize.x, gridCellSize.y);
    }
}

var snake = [new snakeCell()];
var food = new snakeCell();
food.setColor("red");

function generateNewFoodPosition() {
    food.setPosition(gridCellSize.x * (Math.floor(Math.random() * gridSize.x)), gridCellSize.y * (Math.floor(Math.random() * gridSize.y)));
}
generateNewFoodPosition();

var snakeVelocity = new Vector2(0, 0);

function kill() {
    snake.splice(1);
    snake[0].setPosition(Math.round(gridSize.x / 2) * gridCellSize.x, Math.round(gridSize.y / 2) * gridCellSize.y);
    snakeVelocity.x = 0;
    snakeVelocity.y = 0;
    alert("Game over!");
}

window.onkeydown = function (event) {
    switch (event.keyCode) {
        case 16://shift
            if (currentSpeed == speed_0) {
                clearInterval(intervalID);
                intervalID = setInterval(update, 1000 / speed_1);
                currentSpeed = speed_1;
            }
            break;
        case 37://left
            pressedArrow.push("left");
            break;
        case 39://right
            pressedArrow.push("right");
            break;
        case 38://up
            pressedArrow.push("up");
            break;
        case 40://down
            pressedArrow.push("down");
            break;
        case 32://space
            isPaused = !isPaused;
            text_isPaused.innerHTML = isPaused ? "PAUSED" : "";
            break;
    }
}
window.onkeyup = function (event) {
    switch (event.keyCode) {
        case 16://shift
            clearInterval(intervalID);
            intervalID = setInterval(update, 1000 / speed_0);
            currentSpeed = speed_0;
            break;
    }
}

function update() {
    if (pressedArrow.length) {
        if (pressedArrow[0] == "left") {
            snakeVelocity.x = (snakeVelocity.x === 0) ? -gridCellSize.x : snakeVelocity.x;
            snakeVelocity.y = 0;
        }
        else if (pressedArrow[0] == "right") {
            snakeVelocity.x = (snakeVelocity.x === 0) ? gridCellSize.x : snakeVelocity.x;
            snakeVelocity.y = 0;
        }
        else if (pressedArrow[0] == "up") {
            snakeVelocity.y = (snakeVelocity.y === 0) ? -gridCellSize.y : snakeVelocity.y;
            snakeVelocity.x = 0;
        }
        else if (pressedArrow[0] == "down") {
            snakeVelocity.y = (snakeVelocity.y === 0) ? gridCellSize.y : snakeVelocity.y;
            snakeVelocity.x = 0;
        }
        pressedArrow.splice(0, 1);
    }

    if (!isPaused) {
        if (Math.round(snake[0].position.x) == food.position.x && Math.round(snake[0].position.y) == food.position.y) {
            for (var c = 0; c < 2; c++) {
                snake.push(new snakeCell());
                snake[snake.length - 1].setPosition(-50, -50);
            }
            generateNewFoodPosition();
        }

        for (var c = snake.length - 1; c >= 0; c--) {
            if (c == 0)
                snake[c].move(snakeVelocity.x, snakeVelocity.y);
            else {
                if (Math.round(snake[0].position.x) == snake[c].position.x && Math.round(snake[0].position.y) == snake[c].position.y) {
                    kill();
                    c = 0;
                }
                else
                    snake[c].setPosition(snake[c - 1].position.x, snake[c - 1].position.y);
            }
        }
        if (snake[0].position.x < 0 || snake[0].position.y < 0 || snake[0].position.x >= canvas.width || snake[0].position.y >= canvas.width)
            kill();

        score = snake.length;
        if (score > highScore)
            highScore = score;
        text_score.innerHTML = "Score: " + score.toString();
        text_highScore.innerHTML = "High-score: " + highScore.toString();

        brush.clearRect(0, 0, canvas.width, canvas.height);
        food.draw();
        for (var c = 0; c < snake.length; c++)
            snake[c].draw();
    }
    else {
        text_isPaused.style.left = ((window.innerWidth - text_isPaused.getBoundingClientRect().width) / 2).toString() + 'px';
    }

    text_score.style.left = (canvas.getBoundingClientRect().left - (text_score.getBoundingClientRect().width - 70)).toString() + "px";
    text_highScore.style.left = (canvas.getBoundingClientRect().left - (text_highScore.getBoundingClientRect().width - 70)).toString() + "px";
} intervalID = setInterval(update, 1000 / speed_0);