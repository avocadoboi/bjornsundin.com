const FISH_WIDTH = 18;
const FISH_HEIGHT = 38;
const FISH_ROTATE_SPEED = 0.08;
const FISH_SWIM_SPEED = 2.0;

const FOOD_SIZE = 10;

const MATING_FREQUENCY = 20; // In seconds
const MATING_POOL_SIZE = 15;
const BIRTH_MUTATION_RATE = 0.04;

const NUMBER_OF_FISHES = 35;
const NUMBER_OF_FOODS = 20;
const NUMBER_OF_SENSORS = 10;
const NUMBER_OF_NEURONS_IN_HIDDEN_LAYER = 10;

const NUMBER_OF_COLLISION_ITERATIONS = 1;
const COLLISION_POSITION_CORRECTION = 0.8;

const FITNESS_FACTOR_COLLISION = 0.995;
const FITNESS_FACTOR_FOOD = 1.3;
const FITNESS_FACTOR_IDLE = 0.99999;
const FITNESS_FACTOR_FORWARD = 1.001;

//---------------------------------

function createVectorFromAngle(p_angle) {
    return new Vector(Math.cos(p_angle), Math.sin(p_angle));
}

//---------------------------------

// (a, b) is the position of the vector
// (c, d) is the vector
// (e, f) is the first position of the line
// (g, h) is the second position of the line
function getVectorLineProjectionScalar_0(a, b, c, d, e, f, g, h) {
    return ((e - a)*(h - f) + (b - f)*(g - e))/(c*(h - f) - d*(g - e));
}

// (a, b) is the position of the vector
// (c, d) is the vector
// (e, f) is the first position of the line
// (g, h) is the second position of the line
function getVectorLineProjectionScalar_1(a, b, c, d, e, f, g, h) {
    return (d*(a - e) + c*(f - b)) / (d*(g - e) - c*(h - f));
}

//---------------------------------

function createRectangle(p_x, p_y, p_w, p_h) {
    return {
        points: [
            new Vector(-p_w*0.5, -p_h*0.5), new Vector(p_w*0.5, -p_h*0.5),
            new Vector(p_w*0.5, p_h*0.5), new Vector(-p_w*0.5, p_h*0.5)
        ],
        normals: [
            new Vector(0, -1), new Vector(1, 0),
            new Vector(0, 1), new Vector(-1, 0)
        ],
        position: new Vector(p_x, p_y)
    }
}

//---------------------------------

class Fish {
    constructor(p_aquarium, p_mom, p_dad) {
        this.aquarium = p_aquarium;
        this.points = [
            new Vector(-FISH_HEIGHT * 0.5, -FISH_WIDTH * 0.5), new Vector(FISH_HEIGHT * 0.5, -FISH_WIDTH * 0.5),
            new Vector(FISH_HEIGHT * 0.5, FISH_WIDTH * 0.5), new Vector(-FISH_HEIGHT * 0.5, FISH_WIDTH * 0.5)
        ];
        this.normals = [
            new Vector(0, -1), new Vector(1, 0),
            new Vector(0, 1), new Vector(-1, 0)
        ];
        this.neuralNetwork = new Neuralt.NeuralNetwork(NUMBER_OF_SENSORS, [NUMBER_OF_NEURONS_IN_HIDDEN_LAYER], 3);
        this.neuralNetwork.neuronActivation = Neuralt.Activations.LeakyReLU;

        if (p_mom == undefined) {
            for (let a = 1; a < this.neuralNetwork.neurons.length; a++) {
                for (let b = 0; b < this.neuralNetwork.neurons[a].length; b++) {
                    for (let c = 0; c < this.neuralNetwork.neurons[a][b].parameters.length; c++) {
                        this.neuralNetwork.neurons[a][b].parameters[c].value = Math.random()*2 - 1;
                    }
                }
            }
            this.hue = 360 * Math.random();
        }
        else {
            let mutationSum = 0;
            for (let a = 1; a < this.neuralNetwork.neurons.length; a++) {
                for (let b = 0; b < this.neuralNetwork.neurons[a].length; b++) {
                    for (let c = 0; c < this.neuralNetwork.neurons[a][b].parameters.length; c++) {
                        let parameter = this.neuralNetwork.neurons[a][b].parameters[c];
                        let randomNumber = Math.random();
                        if (randomNumber < BIRTH_MUTATION_RATE) {
                            let mutation = Math.random()*2 - 1;
                            mutationSum += Math.abs(mutation - parameter.value);
                            parameter.value = mutation;
                        }
                        else if (randomNumber < 0.5 + BIRTH_MUTATION_RATE*0.5) {
                            parameter.value = p_mom.neuralNetwork.neurons[a][b].parameters[c].value;
                        }
                        else {
                            parameter.value = p_dad.neuralNetwork.neurons[a][b].parameters[c].value;
                        }
                    }
                }
            }
            if (Math.abs(p_mom.hue - p_dad.hue) < 360.0*0.5) {
                this.hue = 0.5*(p_mom.hue + p_dad.hue);
            }
            else {
                let min = Math.min(p_mom.hue, p_dad.hue);
                let max = Math.max(p_mom.hue, p_dad.hue);
                this.hue = max + (360 - max + min)*0.5;
            }
            this.hue += mutationSum;
            this.hue -= Math.floor(this.hue/360)*360
        }
        
        this.position = new Vector(Math.random() * this.aquarium.canvas.width, Math.random() * this.aquarium.canvas.height);
        
        this.rotation = Math.random()*Math.PI*2;
        for (let a = 0; a < this.points.length; a++) {
            this.points[a].rotate(this.rotation);
            this.normals[a].rotate(this.rotation);
        }
        this.rotationSpeed = 0;

        this.fitness = 1;

        this.inputs = new Array(NUMBER_OF_SENSORS);
        for (let a = 0; a < NUMBER_OF_SENSORS; a++) {
            this.inputs[a] = 0;
        }
    }

    update(p_index, p_willDrawRays) {
        for (let a = 0; a < NUMBER_OF_SENSORS; a++) {
            let ray = createVectorFromAngle(this.rotation + a / NUMBER_OF_SENSORS * Math.PI * 2);
            let smallestDistance = null;
            let isFood = false;

            for (let b = 0; b < this.aquarium.fishes.length + this.aquarium.foods.length + 4; b++) {
                if (b == p_index) {
                    continue;
                }

                let points = (b < this.aquarium.fishes.length) ? (this.aquarium.fishes[b].points) : ((b < this.aquarium.fishes.length + 4) ? this.aquarium.walls[b - this.aquarium.fishes.length].points : this.aquarium.foods[b - this.aquarium.fishes.length - 4].points); 
                let pointOffset = (b < this.aquarium.fishes.length) ? this.aquarium.fishes[b].position : ((b < this.aquarium.fishes.length + 4) ? this.aquarium.walls[b - this.aquarium.fishes.length].position : this.aquarium.foods[b - this.aquarium.fishes.length - 4].position);
                for (let c = 0; c < this.points.length; c++) {
                    let scalar = getVectorLineProjectionScalar_1(
                        this.position.x, this.position.y, ray.x, ray.y, 
                        points[c].x + pointOffset.x, points[c].y + pointOffset.y,
                        points[(c + 1) % 4].x + pointOffset.x, points[(c + 1) % 4].y + pointOffset.y
                    );
                    if (scalar >= 0 && scalar <= 1) {
                        scalar = getVectorLineProjectionScalar_0(
                            this.position.x, this.position.y, ray.x, ray.y, 
                            points[c].x + pointOffset.x, points[c].y + pointOffset.y,
                            points[(c + 1) % 4].x + pointOffset.x, points[(c + 1) % 4].y + pointOffset.y
                        );
                        if ((smallestDistance == null || scalar < smallestDistance) && scalar > 0) {
                            smallestDistance = scalar;
                            if (b >= this.aquarium.fishes.length + 4) {
                                isFood = true;
                            }
                        }
                    }
                }
            }

            if (isFood) {
                this.inputs[a] += 0.5*(2 / (smallestDistance*0.0001+1) - this.inputs[a]);
            }
            else {
                this.inputs[a] += 0.1*(-2 / (smallestDistance*0.01+1) - this.inputs[a]);
            }

            if (p_willDrawRays) {
                if (this.inputs[a] > 0) {
                    this.aquarium.brush.strokeStyle = "rgba(0, 255, 0, " + Math.abs(this.inputs[a]) + ")";
                }
                else {
                    this.aquarium.brush.strokeStyle = "rgba(255, 0, 0," + Math.abs(this.inputs[a]) + ")";
                }
                this.aquarium.brush.beginPath();
                this.aquarium.brush.moveTo(this.position.x, this.position.y);
                this.aquarium.brush.lineTo(this.position.x + smallestDistance*ray.x, this.position.y + smallestDistance*ray.y);
                this.aquarium.brush.stroke();
            }
            
        }
        let output = this.neuralNetwork.getOutput(this.inputs);

        if (output[0] > output[1] && output[0] > output[2]) {
            this.rotationSpeed -= (FISH_ROTATE_SPEED + this.rotationSpeed)*0.01;
        }
        else if (output[1] > output[0] && output[1] > output[2]) {
            this.rotationSpeed += (FISH_ROTATE_SPEED - this.rotationSpeed)*0.01;
        }
        else {
            this.rotationSpeed *= 1 - 0.01;
            this.fitness *= FITNESS_FACTOR_FORWARD;
        }

        this.rotation += this.rotationSpeed;
        for (let a = 0; a < this.points.length; a++) {
            this.points[a].rotate(this.rotationSpeed);
            this.normals[a].rotate(this.rotationSpeed);
        }

        this.position.add(new Vector(Math.cos(this.rotation) * FISH_SWIM_SPEED, Math.sin(this.rotation) * FISH_SWIM_SPEED));
    }

    getNormalizedFitness() {
        return this.fitness*this.fitness;//Math.max(0, 1.0 + (this.fitness - 1.0)/(1 + this.aquarium.frameCount/(60*10)));
    }

    checkCollision(p_object) {
        let normals = p_object.normals.concat(this.normals);
        
        let normal = null;
        let minDepth = null;
        
        for (let a = 0; a < normals.length; a++) {
            let min0 = null;
            let max0 = null;
            let min1 = null;
            let max1 = null;

            for (let b = 0; b < this.points.length; b++) {
                let scalar = this.points[b].getAdded(this.position).getDotProduct(normals[a]);
                if (min0 == null || scalar < min0) {
                    min0 = scalar;
                }
                if (max0 == null || scalar > max0) {
                    max0 = scalar;
                }

                if (p_object.position == undefined) {
                    scalar = p_object.points[b].getDotProduct(normals[a]);
                }
                else {
                    scalar = p_object.points[b].getAdded(p_object.position).getDotProduct(normals[a]);
                }
                if (min1 == null || scalar < min1) {
                    min1 = scalar;
                }
                if (max1 == null || scalar > max1) {
                    max1 = scalar;
                }
            }

            if (max0 < min1 || min0 > max1) {
                normal = null;
                break;
            }

            let depth = max1 - min0;
            if (minDepth == null || depth < minDepth) {
                minDepth = depth;
                normal = normals[a];
            }
        }
        if (normal != null) {
            if (p_object instanceof Fish) {
                this.position.add(normal.getMultiplied(minDepth*COLLISION_POSITION_CORRECTION*0.5));
                p_object.position.add(normal.getMultiplied(-minDepth*COLLISION_POSITION_CORRECTION*0.5));
                this.fitness *= FITNESS_FACTOR_COLLISION;
                p_object.fitness *= FITNESS_FACTOR_COLLISION;
            }
            else if (p_object instanceof Food) {
                p_object.respawn();
                this.fitness *= FITNESS_FACTOR_FOOD;
            }
            else {
                this.position.add(normal.getMultiplied(minDepth*COLLISION_POSITION_CORRECTION));
                this.fitness *= FITNESS_FACTOR_COLLISION;
            }
        }
        else {
            this.fitness *= FITNESS_FACTOR_IDLE;
        }
    }

    draw(p_brush) {
        p_brush.fillStyle = "hsl(" + this.hue + ", " + Math.min(100.0, 40.0*this.fitness + 30.0).toString() + "%, " + Math.min(50, 20.0*this.fitness + 10.0).toString() + "%)";
        p_brush.beginPath();
        p_brush.moveTo(this.points[0].x + this.position.x, this.points[0].y + this.position.y);
        p_brush.lineTo(this.points[1].x + this.position.x, this.points[1].y + this.position.y);
        p_brush.lineTo(this.points[2].x + this.position.x, this.points[2].y + this.position.y);
        p_brush.lineTo(this.points[3].x + this.position.x, this.points[3].y + this.position.y);
        p_brush.closePath();
        p_brush.fill();
    }
}

class Food {
    constructor(p_aquarium) {
        this.aquarium = p_aquarium;
        this.respawn();
        this.points = [
            new Vector(-FOOD_SIZE*0.5, -FOOD_SIZE*0.5),
            new Vector(FOOD_SIZE*0.5, -FOOD_SIZE*0.5),
            new Vector(FOOD_SIZE*0.5, FOOD_SIZE*0.5),
            new Vector(-FOOD_SIZE*0.5, FOOD_SIZE*0.5)
        ];
        this.normals = [
            new Vector(0, -1), new Vector(1, 0),
            new Vector(0, 1), new Vector(-1, 0)
        ];
    }
    respawn() {
        this.position = new Vector(Math.random() * this.aquarium.canvas.width, Math.random() * this.aquarium.canvas.height);
    }
    draw(p_brush) {
        p_brush.fillStyle = "rgb(250, 20, 30)";
        p_brush.fillRect(this.position.x - FOOD_SIZE * 0.5, this.position.y - FOOD_SIZE * 0.5, FOOD_SIZE, FOOD_SIZE);
    }
}

//---------------------------------

class Aquarium {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        addEventListener("resize", () => {
            this.canvas.width = innerWidth;
            this.canvas.height = innerHeight;  
            this.updateWalls();  
        })

        this.brush = this.canvas.getContext("2d");

        this.frameCount = 1;

        //---------------------------------

        this.walls = new Array(4);
        this.updateWalls();

        //---------------------------------

        this.fitnessHistory = [];
        this.recordFitness = 0.0;
        
        this.fishes = new Array(NUMBER_OF_FISHES);
        for (let a = 0; a < this.fishes.length; a++) {
            this.fishes[a] = new Fish(this);
        }

        //---------------------------------

        this.foods = new Array(NUMBER_OF_FOODS);
        for (let a = 0; a < this.foods.length; a++) {
            this.foods[a] = new Food(this);
        }
    }
    updateWalls() {
        this.walls[0] = createRectangle(-100, innerHeight*0.5, 200, innerHeight*2);
        this.walls[1] = createRectangle(innerWidth + 100, innerHeight*0.5, 200, innerHeight*2);
        this.walls[2] = createRectangle(innerWidth*0.5, -100, innerWidth*2, 200);
        this.walls[3] = createRectangle(innerWidth*0.5, innerHeight + 100, innerWidth*2, 200);
    }

    update() {
        this.brush.fillStyle = "rgb(0, 0, 0)";
        this.brush.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frameCount % (MATING_FREQUENCY*60) == 0) {
            this.fishes.sort((a, b) => {
                return a.getNormalizedFitness() - b.getNormalizedFitness();
            });
            this.fishes.splice(0, this.fishes.length - MATING_POOL_SIZE);

            let totalPoolFitness = 0;
            for (let a = 0; a < this.fishes.length; a++) {
                this.fishes[a].normalizedFitness = this.fishes[a].getNormalizedFitness();
                totalPoolFitness += this.fishes[a].normalizedFitness;
            }

            let fitness = totalPoolFitness / this.fishes.length;
            if (fitness > this.recordFitness) {
                this.recordFitness = fitness;
            }
            this.fitnessHistory.push(fitness);

            // :^)
            while (this.fishes.length < NUMBER_OF_FISHES + MATING_POOL_SIZE) {
                let mom = null;
                let dad = null;
                let momNumber = Math.random()*totalPoolFitness;
                let dadNumber = Math.random()*totalPoolFitness;
                let accumulatedFitness = 0;
                for (let a = 0; a < MATING_POOL_SIZE; a++) {
                    accumulatedFitness += this.fishes[a].normalizedFitness;
                    if (mom == null && momNumber < accumulatedFitness) {
                        mom = this.fishes[a];
                        if (dad != null) {
                            break;
                        }
                    }
                    if (dad == null && dadNumber < accumulatedFitness) {
                        dad = this.fishes[a];
                        if (mom != null) {
                            break;
                        }
                    }
                }
                this.fishes.push(new Fish(this, mom, dad));
            }
            this.fishes.splice(0, MATING_POOL_SIZE);
        }
        
        for (let i = 0; i < NUMBER_OF_COLLISION_ITERATIONS; i++) {
            for (let a = 0; a < this.fishes.length; a++) {
                for (let b = a + 1; b < this.fishes.length; b++) {
                    this.fishes[a].checkCollision(this.fishes[b]);
                }
                if (i == 0) {
                    for (let b = 0; b < this.foods.length; b++) {
                        this.fishes[a].checkCollision(this.foods[b]);
                    }
                }
                this.fishes[a].checkCollision(this.walls[0]);
                this.fishes[a].checkCollision(this.walls[1]);
                this.fishes[a].checkCollision(this.walls[2]);
                this.fishes[a].checkCollision(this.walls[3]);
            }
        }

        let bestFishIndex = 0;
        for (let a = 1; a < this.fishes.length; a++) {
            if (this.fishes[a].fitness > this.fishes[bestFishIndex].fitness) {
                bestFishIndex = a;
            }
        }
        
        for (let a = 0; a < this.fishes.length; a++) {
            this.fishes[a].update(a, bestFishIndex == a);
            this.fishes[a].draw(this.brush);
        }
        for (let a = 0; a < this.foods.length; a++) {
            this.foods[a].draw(this.brush);
        }


        if (this.fitnessHistory.length > 1) {
            this.brush.strokeStyle = "rgba(255, 100, 230, 0.5)";
            this.brush.lineWidth = 2;
            for (let a = 0; a < this.fitnessHistory.length; a++) {
                let x = this.canvas.width * a / (this.fitnessHistory.length - 1)
                let y = this.canvas.height * (1 - this.fitnessHistory[a] / this.recordFitness);
                if (a == 0) {
                    this.brush.beginPath();
                    this.brush.moveTo(x, y);
                }
                else {
                    this.brush.lineTo(x, y);
                }
            }
            this.brush.stroke();
        } 

        this.brush.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.brush.font = "40px arial";
        this.brush.textBaseline = "top";
        this.brush.fillText("Generation: " + Math.floor(this.frameCount / (MATING_FREQUENCY*60)), 10, 10);

        this.frameCount++;
    }
}

//---------------------------------

let aquarium = new Aquarium();

function update() {
    aquarium.update();

    requestAnimationFrame(update);
}
update();