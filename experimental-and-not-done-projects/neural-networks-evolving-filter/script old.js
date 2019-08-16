let populationSize = 200;
let numberOfSurvivors = 5;
let mutationProbability = 0.05;

let hasFrequencyInput = true;
let numberOfOutputHistoryInputs = 4;
let numberOfInputHistoryInputs = 4;
let numberOfNeuronsInHiddenLayer = 8;
let activationFunction = Neuralt.Activations.LeakyReLU;

let numberOfSamplesPerFrequency = 700;
let numberOfFrequencyResponseFrequencies = 50;
let minResponseFrequency = 20;
let maxResponseFrequency = 20000;
let sampleRate = 44100;
let numberOfFrequencyIndicators = 6;
let frequencyScale = 5;

//--------------------------

let sinewave;
function calculateSinewave() {
    sinewave = new Array(numberOfSamplesPerFrequency);
    for (let a = 0; a < numberOfSamplesPerFrequency; a++) {
        sinewave[a] = Math.sin(Math.PI * 2 * a / numberOfSamplesPerFrequency);
    }
}
calculateSinewave();

function getFrequencyFromFrequencyResponseIndex(p_index) {
    return (Math.pow(p_index / (numberOfFrequencyResponseFrequencies - 1), frequencyScale) * (maxResponseFrequency - minResponseFrequency) + minResponseFrequency) / sampleRate;
}

function drawFrequencyResponseGraph(p_brush, p_width, p_height, p_frequencyResponse, p_isUserDrawable) {
    p_brush.fillStyle = "rgb(250, 250, 250)";
    p_brush.fillRect(0, 0, p_width, p_height);

    if (p_isUserDrawable) {
        p_brush.font = "30px Arial";
        p_brush.textAlign = "center";
        p_brush.fillStyle = "rgb(200, 200, 200)";
        p_brush.fillText("Drag to draw frequency response", canvas_targetFrequencyResponse.width * 0.5, canvas_targetFrequencyResponse.height * 0.5);
    }

    // Draw frequency indicators
    p_brush.font = "14px Arial";
    p_brush.fillStyle = "rgb(30, 30, 30)";
    p_brush.strokeStyle = "rgb(170, 170, 170)";
    p_brush.textAlign = "center";
    let increment = numberOfFrequencyResponseFrequencies / numberOfFrequencyIndicators;
    for (let a = increment; a < numberOfFrequencyResponseFrequencies; a += increment) {
        let position = p_width * a / (numberOfFrequencyResponseFrequencies);

        // Draw text
        let hertzFrequency = p_frequencyResponse[Math.round(a)].frequency * sampleRate;
        if (hertzFrequency < 1000) {
            p_brush.fillText(Math.round(hertzFrequency) + " hz", position + 5, 20);
        }
        else {
            p_brush.fillText((hertzFrequency / 1000).toFixed(1) + " khz", position + 5, 20);
        }

        // Draw frequency indicator line
        p_brush.beginPath();
        p_brush.moveTo(position, 27);
        p_brush.lineTo(position, 36);
        p_brush.stroke();
    }

    // Draw graph
    p_brush.lineWidth = 2;
    p_brush.strokeStyle = "rgb(20, 20, 20)";
    p_brush.beginPath();
    for (let a = 0; a < numberOfFrequencyResponseFrequencies; a++) {
        let position = new Vector(p_width * a / (numberOfFrequencyResponseFrequencies - 1), p_height - p_height * 0.5 * p_frequencyResponse[a].amplitude);
        if (a == 0) {
            p_brush.moveTo(position.x, position.y);
        }
        else {
            p_brush.lineTo(position.x, position.y);
        }
    }
    p_brush.stroke();
}

//--------------------------
// Target frequency response graph

let canvas_targetFrequencyResponse = document.getElementById("canvas_targetFrequencyResponse");
let brush_targetFrequencyResponse = canvas_targetFrequencyResponse.getContext("2d");

let targetFrequencyResponse = new Array(numberOfFrequencyResponseFrequencies);
for (let a = 0; a < numberOfFrequencyResponseFrequencies; a++) {
    targetFrequencyResponse[a] = { frequency: getFrequencyFromFrequencyResponseIndex(a), amplitude: +(a < numberOfFrequencyResponseFrequencies * 0.5) };
}
drawFrequencyResponseGraph(brush_targetFrequencyResponse, canvas_targetFrequencyResponse.width, canvas_targetFrequencyResponse.height, targetFrequencyResponse, true);

let isUserDrawingTargetFrequencyResponse = false;
canvas_targetFrequencyResponse.onmousedown = () => isUserDrawingTargetFrequencyResponse = true;
onmouseup = () => isUserDrawingTargetFrequencyResponse = false;
onmousemove = (p_event) => {
    if (isUserDrawingTargetFrequencyResponse) {
        let x = Math.max(0, Math.min(canvas_targetFrequencyResponse.width - 1, p_event.pageX - canvas_targetFrequencyResponse.getBoundingClientRect().x));
        let y = Math.max(0, Math.min(canvas_targetFrequencyResponse.height - 1, p_event.pageY - canvas_targetFrequencyResponse.getBoundingClientRect().y));
        if (p_event.altKey) {
            targetFrequencyResponse[Math.floor(x / canvas_targetFrequencyResponse.width * numberOfFrequencyResponseFrequencies)].amplitude = Math.round(2 - 2 * y / canvas_targetFrequencyResponse.height);
        }
        else {
            targetFrequencyResponse[Math.floor(x / canvas_targetFrequencyResponse.width * numberOfFrequencyResponseFrequencies)].amplitude = 2 - 2 * y / canvas_targetFrequencyResponse.height;
        }
        drawFrequencyResponseGraph(brush_targetFrequencyResponse, canvas_targetFrequencyResponse.width, canvas_targetFrequencyResponse.height, targetFrequencyResponse, true);
    }
}

//--------------------------
// Best frequency response graph

let canvas_bestFrequencyResponse = document.getElementById("canvas_bestFrequencyResponse");
let brush_bestFrequencyResponse = canvas_bestFrequencyResponse.getContext("2d");

//--------------------------

class Filter {
    constructor(p_dad, p_mom) {
        this.neuralNetwork = new Neuralt.NeuralNetwork(numberOfInputHistoryInputs + 1 + numberOfOutputHistoryInputs + hasFrequencyInput, [], 1);
        if (p_dad == undefined) {
            for (let i_layer = 1; i_layer < this.neuralNetwork.neurons.length; i_layer++) {
                for (let i_neuron = 0; i_neuron < this.neuralNetwork.neurons[i_layer].length; i_neuron++) {
                    for (let i_parameter = 0; i_parameter < this.neuralNetwork.neurons[i_layer][i_neuron].parameters.length; i_parameter++) {
                        this.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value = Math.random()*2 - 1;
                    }
                }
            }
        }
        else {
            for (let i_layer = 1; i_layer < this.neuralNetwork.neurons.length; i_layer++) {
                for (let i_neuron = 0; i_neuron < this.neuralNetwork.neurons[i_layer].length; i_neuron++) {
                    for (let i_parameter = 0; i_parameter < this.neuralNetwork.neurons[i_layer][i_neuron].parameters.length; i_parameter++) {
                        if (Math.random() <= mutationProbability) {
                            this.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value += Math.random()*2 - 1;
                        }
                        else {
                            if (Math.random() < 0.5) {
                                this.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value = p_dad.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value;
                            }
                            else {
                                this.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value = p_mom.neuralNetwork.neurons[i_layer][i_neuron].parameters[i_parameter].value;
                            }
                        }
                    }
                }
            }
        }

        this.neuralNetwork.setActivation(activationFunction);

        this.frequencyResponse = [];
        this.cutoffFrequency = 0;
        this.fitness = 0;
    }

    updateFitness() {
        let error = 0;
        this.frequencyResponse = new Array(numberOfFrequencyResponseFrequencies);
        for (let i_frequency = 0; i_frequency < numberOfFrequencyResponseFrequencies; i_frequency++) {
            let frequency = getFrequencyFromFrequencyResponseIndex(i_frequency);

            let inputHistory = new Array(numberOfInputHistoryInputs);

            let outputHistory = new Array(numberOfOutputHistoryInputs);
            let score = 0;

            for (let i_sample = 0; i_sample < numberOfSamplesPerFrequency; i_sample++) {
                // Update input history
                for (let i_inputHistorySample = 0; i_inputHistorySample < inputHistory.length - 1; i_inputHistorySample++) {
                    inputHistory[i_inputHistorySample] = inputHistory[i_inputHistorySample + 1];
                }
                // inputHistory[inputHistory.length - 1] = Math.sin(Math.PI * 2 * frequency * i_sample);
                inputHistory[inputHistory.length - 1] = sinewave[Math.round(sinewave.length * frequency * i_sample) % sinewave.length];

                // Put the inputs in an array
                let inputs = new Array(this.neuralNetwork.neurons[0].length);
                for (let i_input = 0; i_input < inputs.length; i_input++) {
                    if (i_input < inputHistory.length) {
                        if (inputHistory[i_input] == undefined) {
                            inputs[i_input] = 0;
                        }
                        else {
                            inputs[i_input] = inputHistory[i_input];
                        }
                    }
                    else if (i_input < inputHistory.length + outputHistory.length) {
                        if (outputHistory[i_input - inputHistory.length] == undefined) {
                            inputs[i_input] = 0;
                        }
                        else {
                            inputs[i_input] = outputHistory[i_input - inputHistory.length];
                        }
                    }
                    else {
                        inputs[i_input] = this.cutoffFrequency;
                    }
                }

                // Update output history and score
                for (let i_outputHistorySample = 0; i_outputHistorySample < outputHistory.length - 1; i_outputHistorySample++) {
                    outputHistory[i_outputHistorySample] = outputHistory[i_outputHistorySample + 1];
                }
                outputHistory[outputHistory.length - 1] = this.neuralNetwork.getOutput(inputs)[0];
                score += Math.abs(outputHistory[outputHistory.length - 1]);
            }
            score /= numberOfSamplesPerFrequency;
            this.frequencyResponse[i_frequency] = { frequency: frequency, amplitude: score };
            error += Math.pow(Math.abs(score - targetFrequencyResponse[i_frequency].amplitude), 2);
        }
        this.fitness = Math.pow(1 / Math.max(0.0000001, error), 2);
    }
}

let filter = new Filter();
filter.updateFitness();

//--------------------------

class Population {
    constructor() {
        this.filters = new Array(populationSize);
        for (let a = 0; a < populationSize; a++) {
            this.filters[a] = new Filter();
        }
        this.bestFilter = null;
    }

    update() {
        for (let a = 0; a < this.filters.length; a++) {
            this.filters[a].updateFitness();
            if (this.bestFilter == null || this.filters[a].fitness > this.bestFilter.fitness) {
                this.bestFilter = this.filters[a];
            }
        }

        let survivors = this.filters;
        survivors.sort((a, b) => a.fitness < b.fitness ? 1 : (a.fitness > b.fitness ? -1 : 0));
        survivors.splice(numberOfSurvivors);
        
        let fitnessSum = 0;
        for (let a = 0; a < survivors.length; a++){
            fitnessSum += survivors[a].fitness;
        }

        this.filters = new Array(populationSize);

        // Choose dad and mom
        for (let i_child = 0; i_child < populationSize; i_child++) {
            let dad = null, mom = null;
            let momNumber = Math.random() * fitnessSum;
            let dadNumber = Math.random() * fitnessSum;

            let accumulatedFitness = 0;
            for (let i_survivor = 0; i_survivor < numberOfSurvivors; i_survivor++) {
                accumulatedFitness += survivors[i_survivor].fitness;
                if (momNumber < accumulatedFitness && mom == null) {
                    mom = survivors[i_survivor];
                }
                if (dadNumber < accumulatedFitness && dad == null) {
                    dad = survivors[i_survivor];
                }
                if (dad != null && mom != null) {
                    break;
                }
            }

            this.filters[i_child] = new Filter(dad, mom);
        }

        drawFrequencyResponseGraph(brush_bestFrequencyResponse, canvas_bestFrequencyResponse.width, canvas_bestFrequencyResponse.height, this.bestFilter.frequencyResponse, false);
    }
}

//--------------------------
// Update

let population = new Population();

function update() {
    population.update();
}
setInterval(update, 5000);
