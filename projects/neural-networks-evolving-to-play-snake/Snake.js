class Neuron {
    constructor(inputNeurons) {
        this.inputNeurons = inputNeurons;
        this.output;
        this.parameters = [];
        for (var a = 0; a < inputNeurons.length + 1; a++) {
            this.parameters.push(Math.random() * 2 - 1);
        }
    }
    updateValue() {
        var sum = this.parameters.getLast();
        for (var a = 0; a < this.inputNeurons.length; a++) {
            sum += this.inputNeurons[a].output * this.parameters[a];
        }
        this.output = Math.max(sum * 0.01, sum);
    }
}

class InputNeuron {
    constructor() {
        this.output = 0;
    }
    updateValue() { }
}

class NeuralNetwork {
    constructor() {
        this.neurons = [[]];
        for (var a = 0; a < (4 + obstacleSensorFieldWidth * obstacleSensorFieldWidth - 1); a++) {
            this.neurons[0].push(new InputNeuron());
        }
        var numberOfNeurons;
        for (var a = 0; a < 3; a++) {
            switch (a) {
                case 0: numberOfNeurons = numberOfNeuronsInHiddenLayer_0.value; break;
                case 1: numberOfNeurons = numberOfNeuronsInHiddenLayer_1.value; break;
                case 2: numberOfNeurons = 2; break;
            }
            if (numberOfNeurons > 0) {
                this.neurons.push([]);
                for (var b = 0; b < numberOfNeurons; b++) {
                    this.neurons.getLast().push(new Neuron(this.neurons[this.neurons.length - 2]));
                }
            }
        }
    }
    getNewOutput(inputValues) {
        for (var a = 0; a < inputValues.length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }
        var outputValues = [];
        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateValue();
                if (a == this.neurons.length - 1) {
                    outputValues.push(this.neurons[a][b].output);
                }
            }
        }
        return outputValues;
    }
}

//------------------------------------------------------------------------------------------------------

function getNeuralNetworkFromParents(parent_a, parent_b) {
    // Create new neural network with random parameters
    var neuralNetwork = new NeuralNetwork();

    // Crossover parents neural network parameters
    var numberOfMutations = 0;
    if (parent_b !== undefined) {
        for (var a = 1; a < neuralNetwork.neurons.length; a++) {
            for (var b = 0; b < neuralNetwork.neurons[a].length; b++) {
                for (var c = 0; c < neuralNetwork.neurons[a][b].parameters.length; c++) {
                    if (Math.random() >= mutationRate.value) {
                        if (Math.random() < 0.5) {
                            neuralNetwork.neurons[a][b].parameters[c] = parent_a.neuralNetwork.neurons[a][b].parameters[c];
                        }
                        else {
                            neuralNetwork.neurons[a][b].parameters[c] = parent_b.neuralNetwork.neurons[a][b].parameters[c];
                        }
                    }
                }
            }
        }
    }
    return neuralNetwork;
}

//------------------------------------------------------------------------------------------------------

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
    draw(alpha) {
        brush.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
        brush.fillRect(this.position.x, this.position.y, 1, 1);
    }
}

//------------------------------------------------------------------------------------------------------

class Snake {
    constructor(parent_a, parent_b) {
        this.neuralNetwork = getNeuralNetworkFromParents(parent_a, parent_b);
        this.cells = [{ x: Math.floor(Math.random() * width.value), y: Math.floor(Math.random() * (width.value - 1) + 1) }];
        this.food = new Food();
        this.velocity = { x: 0, y: 0 };
        this.alpha = 0;
        this.fitness = 0;
        this.collectedFitness = 0; // The fitness sum of every snake before this one. 
        this.health = 1;
        this.isAlive = true;
    }
    calculateFitness() {
        this.fitness = Math.pow(this.cells.length + (this.health > 0) * 3, 2);
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
            return;
        }

        var headPosition = this.cells[0];
        if (headPosition.x == this.food.position.x && headPosition.y == this.food.position.y) return;

        var inputValues = [
            // Food sensor front, back, left and right
            0, 0, 0, 0,
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

        for (var a = 0; a < inputValues.length; a++) {
            if (inputValues[a] < 0) inputValues[a] = 0;
        }

        // Get and handle output
        var output = this.neuralNetwork.getNewOutput(inputValues);
        if (output[0] >= 0.5) this.turnLeft();
        if (output[1] >= 0.5) this.turnRight();
    }
    draw(alpha) {
        if (this.isAlive) {
            this.alpha += (alpha - this.alpha) * snakeAlphaAnimationSpeed.value;
            if (this.alpha > 0) {
                this.food.draw(this.alpha);
                brush.fillStyle = "rgba(50, 50, 50, " + this.alpha + ")";
                for (var a = 0; a < this.cells.length; a++) {
                    brush.fillRect(this.cells[a].x, this.cells[a].y, 1, 1);
                }
            }
        }
    }
}

//------------------------------------------------------------------------------------------------------

function updateGame(snake) {
    if (!snake.isAlive)
        return;

    //------------------------------------------------------------------------------------------------------

    // Append cell to snake and generate new food if it should eat.
    if (snake.cells[0].x == snake.food.position.x && snake.cells[0].y == snake.food.position.y) {
        snake.food.generateNew();
        snake.cells.push({ x: snake.cells.getLast().x, y: snake.cells.getLast().y });
        snake.health = 1;
    }

    //------------------------------------------------------------------------------------------------------

    // Update velocity of snake.
    snake.updateVelocity();

    // Update position
    for (var a = snake.cells.length - 1; a > 0; a--) {
        if (snake.cells[0].x == snake.cells[a].x && snake.cells[0].y == snake.cells[a].y && a > 1) {
            snake.isAlive = false;
        }
        snake.cells[a] = snake.cells[a - 1];
    }
    snake.cells[0] = {
        x: snake.cells[0].x + snake.velocity.x,
        y: snake.cells[0].y + snake.velocity.y
    };

    //------------------------------------------------------------------------------------------------------
    // Check for deadness

    if (snake.cells[0].x < 0 || snake.cells[0].x >= width.value ||
        snake.cells[0].y < 0 || snake.cells[0].y >= width.value) {
        snake.isAlive = false;
    }

    snake.health = Math.max(0, snake.health - snakeHunger.value);
    if (snake.health == 0) {
        snake.isAlive = false;
    }
}