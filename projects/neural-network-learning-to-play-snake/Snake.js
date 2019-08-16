class Food {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.generateNew();
    }
    generateNew() {
        this.position = {
            x: Math.floor(Math.random() * width.value),
            y: Math.floor(Math.random() * width.value)
        };
    }
    draw() {
        brush.fillStyle = "rgba(255, 0, 0, 1)";
        brush.fillRect(this.position.x, this.position.y, 1, 1);
    }
}

//------------------------------------------------------------------------------------------------------

class Snake {
    constructor() {
        canvas.width = width.value, canvas.height = width.value;
        obstacleSensorFieldWidth = obstacleSensorRange.value * 2 + 1;

        //------------------------------------------------------------------------------------------------------

        var numberOfNeuronsInHiddenLayers = [];
        if (numberOfNeuronsInHiddenLayer_0.value != 0) numberOfNeuronsInHiddenLayers.push(numberOfNeuronsInHiddenLayer_0.value);
        if (numberOfNeuronsInHiddenLayer_1.value != 0) numberOfNeuronsInHiddenLayers.push(numberOfNeuronsInHiddenLayer_1.value);

        this.neuralNetwork = new Neuralt.ReinforcementLearningNeuralNetwork(4 + obstacleSensorFieldWidth * obstacleSensorFieldWidth - 1, numberOfNeuronsInHiddenLayers, 3);

        //------------------------------------------------------------------------------------------------------

        this.food = new Food();
        this.cells = [];
        this.restart();

        //------------------------------------------------------------------------------------------------------

        this.recordLength = 1;
        this.averageLength = 1;
    }
    restart() {
        this.averageLength = this.averageLength * 0.93 + this.cells.length * 0.07;
        this.cells = [{ x: Math.floor(Math.random() * width.value), y: Math.floor(Math.random() * width.value) }];
        this.velocity = { x: 0, y: 0 };
        this.food.generateNew();
    }
    turnLeft() {
        if (this.velocity.x != 0) {
            this.velocity.y = -this.velocity.x, this.velocity.x = 0;
        }
        else if (this.velocity.y != 0) {
            this.velocity.x = this.velocity.y, this.velocity.y = 0;
        }
    }
    turnRight() {
        if (this.velocity.x != 0) {
            this.velocity.y = this.velocity.x, this.velocity.x = 0;
        }
        else if (this.velocity.y != 0) {
            this.velocity.x = -this.velocity.y, this.velocity.y = 0;
        }
    }
    updateVelocity() {
        if (this.velocity.x == 0 && this.velocity.y == 0) {
            this.velocity.y = -1;
        }

        var headPosition = this.cells[0];
        if (headPosition.x == this.food.position.x && headPosition.y == this.food.position.y) return;

        var inputValues = [
            // Food sensor front, back, left and right
            0, 0, 0, 0
            // Grid of pixels around the head of the snake, relative to its heading.
            // A pixel is 1 if there is an obstacle on that pixel and 0 otherwise.
        ];

        // Calculate sensor input values
        var foodDistance = Math.abs(headPosition.x - this.food.position.x) + Math.abs(headPosition.y - this.food.position.y),
            foodSensor_left = (headPosition.x - this.food.position.x) / foodDistance,
            foodSensor_top = (headPosition.y - this.food.position.y) / foodDistance;
        var obstacleSensors = [],
            obstacleSensorFieldPosition = { x: headPosition.x - obstacleSensorRange.value, y: headPosition.y - obstacleSensorRange.value };
        for (var a = 0; a < obstacleSensorFieldWidth * obstacleSensorFieldWidth; a++) {
            var position = {
                x: obstacleSensorFieldPosition.x + a % obstacleSensorFieldWidth,
                y: obstacleSensorFieldPosition.y + Math.floor(a / obstacleSensorFieldWidth)
            };
            if (position.x < 0 || position.x >= width.value || position.y < 0 || position.y >= width.value) {
                obstacleSensors.push(1);
            }
            else {
                obstacleSensors.push(0);
            }
        }
        for (var a = 0; a < this.cells.length; a++) {
            if (this.cells[a].x >= obstacleSensorFieldPosition.x && this.cells[a].x < obstacleSensorFieldPosition.x + obstacleSensorFieldWidth &&
                this.cells[a].y >= obstacleSensorFieldPosition.y && this.cells[a].y < obstacleSensorFieldPosition.y + obstacleSensorFieldWidth) {
                obstacleSensors[
                    this.cells[a].x - obstacleSensorFieldPosition.x + (this.cells[a].y - obstacleSensorFieldPosition.y) * obstacleSensorFieldWidth
                ] = 1;
            }
        }
        if (this.velocity.x == -1) {
            inputValues[0] = foodSensor_left;
            inputValues[1] = -foodSensor_left;
            inputValues[2] = -foodSensor_top;
            inputValues[3] = foodSensor_top;

            for (var a = 0; a < obstacleSensors.length; a++) {
                if (a != obstacleSensorFieldWidth * obstacleSensorRange.value + obstacleSensorRange.value) {
                    inputValues.push(obstacleSensors[
                        obstacleSensors.length - (a % obstacleSensorFieldWidth + 1) * obstacleSensorFieldWidth + Math.floor(a / obstacleSensorFieldWidth)
                    ]);
                }
            }
        }
        else if (this.velocity.x == 1) {
            inputValues[0] = -foodSensor_left;
            inputValues[1] = foodSensor_left;
            inputValues[2] = foodSensor_top;
            inputValues[3] = -foodSensor_top;

            for (var a = obstacleSensors.length - 1; a >= 0; a--) {
                if (a != obstacleSensorFieldWidth * obstacleSensorRange.value + obstacleSensorRange.value) {
                    inputValues.push(obstacleSensors[
                        obstacleSensors.length - (a % obstacleSensorFieldWidth + 1) * obstacleSensorFieldWidth + Math.floor(a / obstacleSensorFieldWidth)
                    ]);
                }
            }
        }
        else if (this.velocity.y == -1) {
            inputValues[0] = foodSensor_top;
            inputValues[1] = -foodSensor_top;
            inputValues[2] = foodSensor_left;
            inputValues[3] = -foodSensor_left;

            for (var a = 0; a < obstacleSensors.length; a++) {
                if (a != obstacleSensorFieldWidth * obstacleSensorRange.value + obstacleSensorRange.value) {
                    inputValues.push(obstacleSensors[a]);
                }
            }
        }
        else if (this.velocity.y == 1) {
            inputValues[0] = -foodSensor_top;
            inputValues[1] = foodSensor_top;
            inputValues[2] = -foodSensor_left;
            inputValues[3] = foodSensor_left;

            for (var a = obstacleSensors.length - 1; a >= 0; a--) {
                if (a != obstacleSensorFieldWidth * obstacleSensorRange.value + obstacleSensorRange.value) {
                    inputValues.push(obstacleSensors[a]);
                }
            }
        }

        for (var a = 0; a < 4; a++) {
            if (inputValues[a] < 0) inputValues[a] = 0;
        }

        // Action!!
        var action = this.neuralNetwork.getNextAction(inputValues);
        if (action == 0) {
            this.turnLeft();
        }
        else if (action == 1) {
            this.turnRight();
        }
    }
    update() {
        // Update velocity of snake.
        this.updateVelocity();

        //------------------------------------------------------------------------------------------------------
        // Check for deadness

        if (this.cells[0].x + this.velocity.x < 0 || this.cells[0].x + this.velocity.x >= width.value ||
            this.cells[0].y + this.velocity.y < 0 || this.cells[0].y + this.velocity.y >= width.value) {
            this.neuralNetwork.giveFeedback(-1);
            this.restart();
            return;
        }

        //------------------------------------------------------------------------------------------------------
        // Update position

        for (var a = this.cells.length - 1; a > 0; a--) {
            this.cells[a].x = this.cells[a - 1].x;
            this.cells[a].y = this.cells[a - 1].y;
            if (this.cells[0].x + this.velocity.x == this.cells[a].x && this.cells[0].y + this.velocity.y == this.cells[a].y && a > 1) {
                this.neuralNetwork.giveFeedback(-1);
                this.restart();
                return;
            }
        }
        this.cells[0].x += this.velocity.x;
        this.cells[0].y += this.velocity.y;

        //------------------------------------------------------------------------------------------------------
        // Append cell to snake and generate new food if it should eat.
        if (this.cells[0].x == this.food.position.x && this.cells[0].y == this.food.position.y) {
            this.neuralNetwork.giveFeedback(1);
            this.food.generateNew();
            this.cells.push({ x: this.cells.getLast().x, y: this.cells.getLast().y });
            if (this.cells.length > this.recordLength) {
                this.recordLength = this.cells.length;
            }
            return;
        }

        this.neuralNetwork.giveFeedback(-0.01);
    }
    draw() {
        this.food.draw();
        brush.fillStyle = "rgba(50, 50, 50, 1)";
        for (var a = 0; a < this.cells.length; a++) {
            brush.fillRect(this.cells[a].x, this.cells[a].y, 1, 1);
        }
    }
}