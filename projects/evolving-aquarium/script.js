let parameters = {
    "Fish width": {
        value: 14,
        min: 2,
        max: 200,
        step: 1
    },
    "Fish height": {
        value: 33,
        min: 2,
        max: 200,
        step: 1
    },
    "Fish steer speed": {
        value: 0.5,
        min: 0.001,
        max: 1,
        step: 0.001
    },
    "Fish steer smoothness": {
        value: 0,
        min: 0,
        max: 1,
        step: 0.01
    },
    "Fish swim speed": {
        value: 15,
        min: 0.1,
        max: 100,
        step: 0.1
    },
    "Fish trail decay": {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
        wantsSeperatorAfterwards: true
    },

    "Number of sensors": {
        value: 51,
        min: 3,
        max: 1000,
        step: 1
    },
    "Hidden layer neurons": {
        value: 8,
        min: 0,
        max: 400,
        step: 1,
        wantsSeperatorAfterwards: true
    },

    "Food size": {
        value: 8,
        min: 2,
        max: 100,
        step: 1
    },
    "Number of foods": {
        value: 100,
        min: 1,
        max: 2000,
        step: 1,
        wantsSeperatorAfterwards: true
    },

    "Number of fishes": {
        value: 50,
        min: 2,
        max: 2000,
        step: 1
    },
    "Mating pool size": {
        value: 30,
        min: 1,
        max: 2000,
        step: 1
    },
    "Mating frequency": {
        value: 20,
        min: 1,
        max: 60 * 60,
        step: 1
    },
    "Mutation rate": {
        value: 0.02,
        min: 0.0001,
        max: 1,
        step: 0.001,
        wantsSeperatorAfterwards: true
    },

    "Fitness graph smoothness": {
        value: 0.9,
        min: 0,
        max: 0.99999999999999,
        step: 0.01
    }
};

(function () {
    document.getElementById("button_restart").addEventListener("click", () => {
        aquarium = new Aquarium();
    });

    let div_parameters = document.getElementById("div_parameters");
    for (let parameterName in parameters) {
        let parameter = parameters[parameterName];

        let div_parameter = document.createElement("div");
        div_parameter.style.position = "relative";

        let text_name = document.createElement("p");
        text_name.innerHTML = parameterName;
        text_name.style.color = "rgba(255, 255, 255, 0.6)";
        text_name.style.marginLeft = "30px";
        text_name.style.marginTop = "11px";
        text_name.style.marginBottom = "11px";
        text_name.style.display = "inline-block";
        text_name.style.fontSize = "18px";
        div_parameter.appendChild(text_name);

        let input = document.createElement("input");
        input.type = "number";
        input.style.width = "50px";
        input.style.display = "inline-block";
        input.style.position = "absolute";
        input.style.right = "30px";
        input.style.top = "8px";
        input.style.fontSize = "15px";
        input.style.backgroundColor = "rgba(0, 0, 0, 0)";
        input.style.color = "rgba(255, 255, 255, 0.6)";
        input.style.border = "1px solid rgba(255, 255, 255, 0.5)";
        input.style.paddingLeft = "6px";
        input.style.paddingTop = "4px";
        input.style.paddingBottom = "4px";
        input.step = parameter.step;
        input.value = parameter.value;
        input.min = parameter.min;
        input.max = parameter.max;
        div_parameter.appendChild(input);

        input.addEventListener("change", (p_event) => {
            if (input.valueAsNumber < parameter.min) {
                input.value = parameter.min;
            }
            else if (input.valueAsNumber > parameter.max) {
                input.value = parameter.max;
            }
            if (!isNaN(input.valueAsNumber)) {
                parameter.value = input.valueAsNumber;
            }
        });

        div_parameters.appendChild(div_parameter);

        //---------------------------------

        if (parameter.wantsSeperatorAfterwards) {
            let separator = document.createElement("div");
            separator.style.backgroundColor = "rgb(255, 255, 255, 0.2)";
            separator.style.height = "1px";
            separator.style.margin = "14px 31px";
            div_parameters.appendChild(separator);
        }
    }
})()

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
    return ((e - a) * (h - f) + (b - f) * (g - e)) / (c * (h - f) - d * (g - e));
}

// (a, b) is the position of the vector
// (c, d) is the vector
// (e, f) is the first position of the line
// (g, h) is the second position of the line
function getVectorLineProjectionScalar_1(a, b, c, d, e, f, g, h) {
    return (d * (a - e) + c * (f - b)) / (d * (g - e) - c * (h - f));
}

//---------------------------------

class Fish {
    constructor(p_aquarium, p_mom, p_dad) {
        this.aquarium = p_aquarium;
        this.points = [
            new Vector(-parameters["Fish height"].value * 0.5, -parameters["Fish width"].value * 0.5), new Vector(parameters["Fish height"].value * 0.5, -parameters["Fish width"].value * 0.5),
            new Vector(parameters["Fish height"].value * 0.5, parameters["Fish width"].value * 0.5), new Vector(-parameters["Fish height"].value * 0.5, parameters["Fish width"].value * 0.5)
        ];
        this.normals = [
            new Vector(0, -1), new Vector(1, 0),
            new Vector(0, 1), new Vector(-1, 0)
        ];
        if (parameters["Hidden layer neurons"].value) {
            this.neuralNetwork = new Neuralt.NeuralNetwork(parameters["Number of sensors"].value, [parameters["Hidden layer neurons"].value], 3);
        }
        else {
            this.neuralNetwork = new Neuralt.NeuralNetwork(parameters["Number of sensors"].value, [], 3);
        }
        this.neuralNetwork.neuronActivation = Neuralt.Activations.LeakyReLU;

        if (p_mom == undefined) {
            for (let a = 1; a < this.neuralNetwork.neurons.length; a++) {
                for (let b = 0; b < this.neuralNetwork.neurons[a].length; b++) {
                    for (let c = 0; c < this.neuralNetwork.neurons[a][b].parameters.length; c++) {
                        this.neuralNetwork.neurons[a][b].parameters[c].value = Math.random() * 2 - 1;
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
                        if (randomNumber < parameters["Mutation rate"].value) {
                            let mutation = Math.random() * 2 - 1;
                            mutationSum += Math.abs(mutation - parameter.value);
                            parameter.value = mutation;
                        }
                        else if (randomNumber < 0.5 + parameters["Mutation rate"].value * 0.5) {
                            parameter.value = p_mom.neuralNetwork.neurons[a][b].parameters[c].value;
                        }
                        else {
                            parameter.value = p_dad.neuralNetwork.neurons[a][b].parameters[c].value;
                        }
                    }
                }
            }
            console.log("mutation sum for new fish: " + mutationSum);
            if (Math.abs(p_mom.hue - p_dad.hue) < 360.0 * 0.5) {
                this.hue = 0.5 * (p_mom.hue + p_dad.hue);
            }
            else {
                let min = Math.min(p_mom.hue, p_dad.hue);
                let max = Math.max(p_mom.hue, p_dad.hue);
                this.hue = max + (360 - max + min) * 0.5;
            }
            this.hue += 10 * mutationSum;
            this.hue -= Math.floor(this.hue / 360) * 360
        }

        this.position = new Vector(Math.random() * this.aquarium.canvas.width, Math.random() * this.aquarium.canvas.height);

        this.rotation = Math.random() * Math.PI * 2;
        for (let a = 0; a < this.points.length; a++) {
            this.points[a].rotate(this.rotation);
            this.normals[a].rotate(this.rotation);
        }
        this.rotationSpeed = 0;

        this.fitness = 1;

        this.inputs = new Array(parameters["Number of sensors"].value);
        for (let a = 0; a < parameters["Number of sensors"].value; a++) {
            this.inputs[a] = 0;
        }
    }

    update(p_index) {
        for (let a = 0; a < parameters["Number of sensors"].value; a++) {
            let ray = createVectorFromAngle(this.rotation + a / parameters["Number of sensors"].value * Math.PI * 2);
            let smallestDistance = null;

            for (let b = 0; b < this.aquarium.foods.length; b++) {
                if (b == p_index) {
                    continue;
                }

                let points = this.aquarium.foods[b].points;
                let pointOffset = this.aquarium.foods[b].position;
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
                        }
                    }
                }
            }

            if (smallestDistance == null) {
                this.inputs[a] -= 0.5 * this.inputs[a];
            }
            else {
                this.inputs[a] += 0.7 * (10 / (smallestDistance * 0.001 + 1) - this.inputs[a]);
            }
        }
        let output = this.neuralNetwork.getOutput(this.inputs);

        if (output[0] > output[1] && output[0] > output[2]) {
            this.rotationSpeed -= (parameters["Fish steer speed"].value + this.rotationSpeed) * (1 - parameters["Fish steer smoothness"].value);
        }
        else if (output[1] > output[0] && output[1] > output[2]) {
            this.rotationSpeed += (parameters["Fish steer speed"].value - this.rotationSpeed) * (1 - parameters["Fish steer smoothness"].value);
        }
        else {
            this.rotationSpeed *= parameters["Fish steer smoothness"].value;
        }

        this.rotation += this.rotationSpeed;
        for (let a = 0; a < this.points.length; a++) {
            this.points[a].rotate(this.rotationSpeed);
            this.normals[a].rotate(this.rotationSpeed);
        }

        this.position.add(new Vector(Math.cos(this.rotation) * parameters["Fish swim speed"].value, Math.sin(this.rotation) * parameters["Fish swim speed"].value));
    }

    getNormalizedFitness() {
        return this.fitness * this.fitness;//Math.max(0, 1.0 + (this.fitness - 1.0)/(1 + this.aquarium.frameCount/(60*10)));
    }

    checkCollision(p_object) {
        let normals = p_object.normals.concat(this.normals);

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
                minDepth = null;
                break;
            }

            let depth = max1 - min0;
            if (minDepth == null || depth < minDepth) {
                minDepth = depth;
            }
        }
        if (minDepth == null) {
            // this.fitness *= FITNESS_FACTOR_IDLE;
        }
        else {
            p_object.respawn();
            // this.fitness *= FITNESS_FACTOR_FOOD;
            this.fitness++;
        }
    }

    draw(p_brush) {
        p_brush.fillStyle = "hsl(" + this.hue + ", " + Math.min(100.0, this.fitness * 8.0 + 40.0).toString() + "%, " + Math.min(50, this.fitness * 5 + 20.0).toString() + "%)";
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
            new Vector(-parameters["Food size"].value * 0.5, -parameters["Food size"].value * 0.5),
            new Vector(parameters["Food size"].value * 0.5, -parameters["Food size"].value * 0.5),
            new Vector(parameters["Food size"].value * 0.5, parameters["Food size"].value * 0.5),
            new Vector(-parameters["Food size"].value * 0.5, parameters["Food size"].value * 0.5)
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
        p_brush.fillRect(this.position.x - parameters["Food size"].value * 0.5, this.position.y - parameters["Food size"].value * 0.5, parameters["Food size"].value, parameters["Food size"].value);
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
        this.brush.fillStyle = "rgb(0, 0, 0)";
        this.brush.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.frameCount = 1;

        //---------------------------------

        this.fitnessHistory = [];
        this.recordFitness = 0.0;
        this.recordFishFitness = 0.0;

        this.fishes = new Array(parameters["Number of fishes"].value);
        for (let a = 0; a < this.fishes.length; a++) {
            this.fishes[a] = new Fish(this);
        }

        //---------------------------------

        this.foods = new Array(parameters["Number of foods"].value);
        for (let a = 0; a < this.foods.length; a++) {
            this.foods[a] = new Food(this);
        }
    }

    update() {
        this.brush.fillStyle = "rgba(0, 0, 0, " + parameters["Fish trail decay"].value + ")";
        this.brush.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frameCount % (parameters["Mating frequency"].value * 60) == 0) {
            this.fishes.sort((a, b) => {
                return a.getNormalizedFitness() - b.getNormalizedFitness();
            });
            this.fishes.splice(0, this.fishes.length - parameters["Mating pool size"].value);

            let totalPoolFitness = 0;
            for (let a = 0; a < this.fishes.length; a++) {
                this.fishes[a].normalizedFitness = this.fishes[a].getNormalizedFitness();
                totalPoolFitness += this.fishes[a].normalizedFitness;
            }

            let fitness = totalPoolFitness / this.fishes.length;
            if (this.fitnessHistory.length > 0) {
                fitness = this.fitnessHistory[this.fitnessHistory.length - 1] + (fitness - this.fitnessHistory[this.fitnessHistory.length - 1]) * (1 - parameters["Fitness graph smoothness"].value);
            }
            if (fitness > this.recordFitness) {
                this.recordFitness = fitness;
            }
            this.fitnessHistory.push(fitness);

            // :^)
            while (this.fishes.length < parameters["Number of fishes"].value + parameters["Mating pool size"].value) {
                let mom = null;
                let dad = null;
                let momNumber = Math.random() * totalPoolFitness;
                let dadNumber = Math.random() * totalPoolFitness;
                let accumulatedFitness = 0;
                for (let a = 0; a < parameters["Mating pool size"].value; a++) {
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
            this.fishes.splice(0, parameters["Mating pool size"].value);
        }


        // let bestFishIndex = 0;
        // for (let a = 1; a < this.fishes.length; a++) {
        //     if (this.fishes[a].fitness > this.fishes[bestFishIndex].fitness) {
        //         bestFishIndex = a;
        //     }
        // }

        for (let a = 0; a < this.fishes.length; a++) {
            this.fishes[a].update(a);
            for (let b = 0; b < this.foods.length; b++) {
                this.fishes[a].checkCollision(this.foods[b]);
            }
            if (this.fishes[a].fitness > this.recordFishFitness) {
                this.recordFishFitness = this.fishes[a].fitness;
            }
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
        this.brush.font = "30px arial";
        this.brush.textBaseline = "top";
        this.brush.fillText("Time left for generation: " + (Math.ceil(this.frameCount / (parameters["Mating frequency"].value * 60)) * parameters["Mating frequency"].value - Math.floor(this.frameCount / 60)) + "s", 20, 17);
        this.brush.fillText("Generation: " + Math.floor(this.frameCount / (parameters["Mating frequency"].value * 60)), 20, 54);
        this.brush.fillText("Fish fitness record: " + this.recordFishFitness, 20, 91);

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