class QLearner {
    constructor(p_width, p_height) {
        this.learningRate = 1;
        this.discountFactor = 0.92;
        this.explorationRate = 0.0003;

        this.decisionGrid = new Array(p_width);

        for (let x = 0; x < p_width; x++) {
            this.decisionGrid[x] = new Array(p_height);
            for (let y = 0; y < p_height; y++) {
                this.decisionGrid[x][y] = new Array(4);
                for (let z = 0; z < 4; z++) {
                    this.decisionGrid[x][y][z] = Math.random();
                }
            }
        }

        this.actionsSinceFeedback = [];
    }

    //-----------------------------------------------------------------------------------------

    giveFeedback(feedback) {
        // This all means that the quality of latest action influences the quality of action before that.
        // This eventually builds a decision tree that maximizes eventual reward.
        if (this.actionsSinceFeedback.length > 2) {
            for (let a = this.actionsSinceFeedback.length - 2; a > 0; a--) {
                
                let q_0 = this.actionsSinceFeedback[a][this.actionsSinceFeedback[a].lastAction];
                let q_1 = this.actionsSinceFeedback[a + 1][this.actionsSinceFeedback[a + 1].lastAction];
                this.actionsSinceFeedback[a][this.actionsSinceFeedback[a].lastAction] += this.learningRate * (feedback + this.discountFactor * q_1 - q_0);
            }
        }
        if (this.actionsSinceFeedback.length > 1) {
            let q_0 = this.actionsSinceFeedback[0][this.actionsSinceFeedback[0].lastAction];
            let q_1 = this.actionsSinceFeedback[1][this.actionsSinceFeedback[1].lastAction];
            this.actionsSinceFeedback[0][this.actionsSinceFeedback[0].lastAction] += this.learningRate * (this.actionsSinceFeedback[0].lastFeedback + this.discountFactor * q_1 - q_0);
            this.actionsSinceFeedback.splice(0, this.actionsSinceFeedback.length - 1);
        }
        this.actionsSinceFeedback[this.actionsSinceFeedback.length - 1].lastFeedback = feedback;
    }

    getNextAction(p_x, p_y) {
        let bestActionIndex = 0;
        if (Math.random() < this.explorationRate) {
            bestActionIndex = Math.floor(Math.random() * 4);
        }
        else {
            for (let a = 1; a < 4; a++) {
                if (this.decisionGrid[p_x][p_y][a] > this.decisionGrid[p_x][p_y][bestActionIndex]) {
                    bestActionIndex = a;
                }
            }
        }
        this.decisionGrid[p_x][p_y].lastAction = bestActionIndex;
        this.actionsSinceFeedback.push(this.decisionGrid[p_x][p_y]);
        return bestActionIndex;
    }
};

//-----------------------------------------------------------------------------------------

class Game {
    constructor() {
        // Parameters

        this.width = 7;
        this.playerPosition = new Vector();
        this.startPosition = new Vector();
        this.goalPosition = new Vector(this.width - 1, this.width - 1);
        this.obstacleStates = [];

        //-----------------------------------------------------------------------------------------
        // Canvas

        this.canvas = document.getElementById("canvas");

        //-----------------------------------------------------------------------------------------
        // UI elements

        document.getElementById("button_restart").onclick = () => this.restart();
        document.getElementById("button_clear").onclick = () => {
            for (let x = 0; x < this.obstacleStates.length; x++) {
                for (let y = 0; y < this.obstacleStates.length; y++) {
                    this.obstacleStates[x][y] = false;
                }
            }
        };
        this.input_width = document.getElementById("input_width");
        this.input_width.value = this.width;

        //-----------------------------------------------------------------------------------------
        // Events

        this.isStartDragged = false;
        this.isGoalDragged = false;

        this.canvas.onmousemove = (event) => {
            let x = Math.floor(event.offsetX * this.canvas.width / this.canvas.getBoundingClientRect().width);
            let y = Math.floor(event.offsetY * this.canvas.height / this.canvas.getBoundingClientRect().height);

            if ((x == this.startPosition.x && y == this.startPosition.y) ||
                (x == this.goalPosition.x && y == this.goalPosition.y)) {
                document.body.style.cursor = "move";
            }
            else {
                document.body.style.cursor = "default";
            }

            if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height || this.obstacleStates[x][y]) return;

            if (this.isStartDragged && !(x == this.goalPosition.x && y == this.goalPosition.y)) {
                this.startPosition.set(x, y);
            }
            else if (this.isGoalDragged && !(x == this.startPosition.x && y == this.startPosition.y)) {
                this.goalPosition.set(x, y);
            }
        };

        this.canvas.onpointerdown = (event) => {
            this.canvas.onmousemove(event);

            let x = Math.floor(event.offsetX * this.canvas.width / this.canvas.getBoundingClientRect().width);
            let y = Math.floor(event.offsetY * this.canvas.width / this.canvas.getBoundingClientRect().width);

            if (x == this.goalPosition.x && y == this.goalPosition.y) {
                this.isGoalDragged = true;
            }
            else if (x == this.startPosition.x && y == this.startPosition.y) {
                this.isStartDragged = true;
            }
            else {
                this.obstacleStates[x][y] = !this.obstacleStates[x][y];
            }
        };
        this.canvas.onpointerup = (event) => {
            this.isGoalDragged = false;
            this.isStartDragged = false;
        };

        //-----------------------------------------------------------------------------------------

        this.restart();
    }

    //-----------------------------------------------------------------------------------------

    restart() {
        let parsedWidthInput = parseInt(this.input_width.value);
        if (!isNaN(parsedWidthInput) && parsedWidthInput >= this.input_width.min && parsedWidthInput <= this.input_width.max) {
            this.width = parsedWidthInput;
        }

        this.learner = new QLearner(this.width, this.width);

        this.canvas.width = this.width;
        this.canvas.height = this.width;
        this.brush = this.canvas.getContext("2d");

        if (this.startPosition.x >= this.width) {
            this.startPosition.x = this.width - 1;
        }
        if (this.startPosition.y >= this.width) {
            this.startPosition.y = this.width - 1;
        }
        this.playerPosition.set(this.startPosition);

        if (this.goalPosition.x >= this.width) {
            this.goalPosition.x = this.width - 1;
        }
        if (this.goalPosition.y >= this.width) {
            this.goalPosition.y = this.width - 1;
        }

        //-----------------------------------------------------------------------------------------

        let oldObstacleStates = this.obstacleStates;
        this.obstacleStates = [];
        for (let x = 0; x < this.width; x++) {
            this.obstacleStates.push([]);
            for (let y = 0; y < this.width; y++) {
                if (x < oldObstacleStates.length && y < oldObstacleStates.length) {
                    this.obstacleStates[this.obstacleStates.length - 1].push(oldObstacleStates[x][y]);
                }
                else {
                    this.obstacleStates[this.obstacleStates.length - 1].push(false);
                }
            }
        }
    }

    //-----------------------------------------------------------------------------------------

    update() {
        let action = this.learner.getNextAction(this.playerPosition.x, this.playerPosition.y);
        switch (action) {
            case 0: // Left
                if (this.playerPosition.x > 0 && !this.obstacleStates[this.playerPosition.x - 1][this.playerPosition.y]) {
                    this.playerPosition.x -= 1;
                }
                break;

            case 1: // Right
                if (this.playerPosition.x < this.canvas.width - 1 && !this.obstacleStates[this.playerPosition.x + 1][this.playerPosition.y]) {
                    this.playerPosition.x += 1;
                }
                break;

            case 2: // Up
                if (this.playerPosition.y > 0 && !this.obstacleStates[this.playerPosition.x][this.playerPosition.y - 1]) {
                    this.playerPosition.y -= 1;
                }
                break;

            case 3: // Down
                if (this.playerPosition.y < this.canvas.height - 1 && !this.obstacleStates[this.playerPosition.x][this.playerPosition.y + 1]) {
                    this.playerPosition.y += 1;
                }
                break;
        }

        if (this.playerPosition.x == this.goalPosition.x && this.playerPosition.y == this.goalPosition.y) {
            this.learner.giveFeedback(1);
            this.playerPosition.set(this.startPosition);
        }
        else {
            this.learner.giveFeedback(-0.05);
        }

        //-----------------------------------------------------------------------------------------
        // Draw

        this.brush.clearRect(0, 0, this.canvas.width, this.canvas.width);

        //-----------------------------------------------------------------------------------------

        for (let x = 0; x < this.learner.decisionGrid.length; x++) {
            for (let y = 0; y < this.learner.decisionGrid[x].length; y++) {
                let goodness = (this.learner.decisionGrid[x][y][0] + this.learner.decisionGrid[x][y][1]
                             + this.learner.decisionGrid[x][y][2] + this.learner.decisionGrid[x][y][3])*0.25;
                goodness *= 255;
                this.brush.fillStyle = "rgb(" + Math.max(0, 255 - goodness).toString() + ", 255, " + Math.max(0, 255 - goodness).toString() + ")";
                this.brush.fillRect(x, y, 1, 1);
            }
        }

        //-----------------------------------------------------------------------------------------

        this.brush.fillStyle = "#00f";
        this.brush.fillRect(this.startPosition.x, this.startPosition.y, 1, 1);

        this.brush.fillStyle = "#0f0";
        this.brush.fillRect(this.goalPosition.x, this.goalPosition.y, 1, 1);

        this.brush.fillStyle = "#da2";
        this.brush.fillRect(this.playerPosition.x, this.playerPosition.y, 1, 1);

        this.brush.fillStyle = "#444";
        for (let x = 0; x < this.obstacleStates.length; x++) {
            for (let y = 0; y < this.obstacleStates.length; y++) {
                if (this.obstacleStates[x][y]) {
                    this.brush.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}; var game = new Game();

//-----------------------------------------------------------------------------------------
// Frame update

function update() {
    game.update();
    requestAnimationFrame(update);
}; update();