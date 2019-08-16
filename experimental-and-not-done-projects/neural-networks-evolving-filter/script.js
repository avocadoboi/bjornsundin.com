let populationSize = 300;
let mutationProbability = 0.03;
let isMutationIncremental = false;
let mutationStepSize = 0.04;

let inputHistoryLength = 2;
let outputHistoryLength = 2;

let numberOfSamplesPerFrequency = 2000;
let numberOfFrequencyResponseFrequencies = 10;
// let minResponseFrequency = 20;
// let maxResponseFrequency = 20000;
let sampleRate = 44100;
let numberOfFrequencyIndicators = 7;
let frequencyScale = 4;

//--------------------------

let sinewave;
function calculateSinewave() {
    sinewave = new Array(numberOfSamplesPerFrequency);
    for (let a = 0; a < numberOfSamplesPerFrequency; a++) {
        sinewave[a] = Math.sin(Math.PI * 2 * a / numberOfSamplesPerFrequency);
    }
}
calculateSinewave();

//--------------------------

function getFrequencyFromFrequencyResponseIndex(p_index) {
    // return (Math.pow(p_index / (numberOfFrequencyResponseFrequencies - 1), frequencyScale) * (maxResponseFrequency - minResponseFrequency) + minResponseFrequency) / sampleRate;
    return Math.pow(2, (102 * p_index / (numberOfFrequencyResponseFrequencies - 1) - 49) / 12) * 440 / sampleRate;
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
    for (let a = increment; Math.round(a) < numberOfFrequencyResponseFrequencies; a += increment) {
        let position = p_width * a / numberOfFrequencyResponseFrequencies;

        // Draw text
        let hertzFrequency = p_frequencyResponse[Math.floor(a)].frequency * sampleRate;
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
    targetFrequencyResponse[a] = { frequency: getFrequencyFromFrequencyResponseIndex(a), amplitude: +(a > numberOfFrequencyResponseFrequencies * 0.6) };
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
        population.bestFilter = null;
    }
}

//--------------------------
// Best frequency response graph

let canvas_bestFrequencyResponse = document.getElementById("canvas_bestFrequencyResponse");
let brush_bestFrequencyResponse = canvas_bestFrequencyResponse.getContext("2d");

//--------------------------

class Filter {
    constructor(p_daddy) {
        this.inputHistoryWeights = new Array(inputHistoryLength);
        this.outputHistoryWeights = new Array(outputHistoryLength);

        if (p_daddy == undefined) {
            for (let a = 0; a < inputHistoryLength; a++) {
                this.inputHistoryWeights[a] = Math.random() * 2 - 1;
            }
            for (let a = 0; a < outputHistoryLength; a++) {
                this.outputHistoryWeights[a] = Math.random() * 2 - 1;
            }
        }
        else {
            for (let a = 0; a < inputHistoryLength; a++) {
                if (Math.random() <= mutationProbability) {
                    if (isMutationIncremental) {
                        this.inputHistoryWeights[a] = p_daddy.inputHistoryWeights[a] + Math.random() * mutationStepSize*2 - mutationStepSize;
                    }
                    else {
                        this.inputHistoryWeights[a] = Math.random() * 2 - 1;
                    }
                }
                else {
                    this.inputHistoryWeights[a] = p_daddy.inputHistoryWeights[a];
                }
            }
            for (let a = 0; a < outputHistoryLength; a++) {
                if (Math.random() <= mutationProbability) {
                    if (isMutationIncremental){
                        this.outputHistoryWeights[a] = p_daddy.outputHistoryWeights[a] + Math.random() * mutationStepSize*2 - mutationStepSize;
                    }
                    else {
                        this.outputHistoryWeights[a] = Math.random() * 2 - 1;
                    }
                }
                else {
                    this.outputHistoryWeights[a] = p_daddy.outputHistoryWeights[a];
                }
            }
        }

        this.frequencyResponse = [];
        this.fitness = 0;
    }

    updateFitness() {
        let error = 0;

        this.frequencyResponse = new Array(numberOfFrequencyResponseFrequencies);
        for (let i_frequency = 0; i_frequency < numberOfFrequencyResponseFrequencies; i_frequency++) {
            let frequency = getFrequencyFromFrequencyResponseIndex(i_frequency);

            let inputHistory = new Array(inputHistoryLength);
            for (let i_inputHistorySample = 0; i_inputHistorySample < inputHistoryLength; i_inputHistorySample++) {
                inputHistory[i_inputHistorySample] = 0;
            }

            let outputHistory = new Array(outputHistoryLength);
            for (let i_outputHistorySample = 0; i_outputHistorySample < outputHistoryLength; i_outputHistorySample++) {
                outputHistory[i_outputHistorySample] = 0;
            }

            let amplitude = 0;

            for (let i_sample = 0; i_sample < numberOfSamplesPerFrequency; i_sample++) {
                let output = 0;

                // Update input history
                if (inputHistoryLength > 0){
                    for (let i_inputHistorySample = 0; i_inputHistorySample < inputHistoryLength - 1; i_inputHistorySample++) {
                        inputHistory[i_inputHistorySample] = inputHistory[i_inputHistorySample + 1];
                        output += inputHistory[i_inputHistorySample] * this.inputHistoryWeights[i_inputHistorySample];
                    }
                    // inputHistory[inputHistoryLength - 1] = Math.sin(Math.PI * 2 * frequency * i_sample);
                    inputHistory[inputHistoryLength - 1] = sinewave[Math.round(sinewave.length * frequency * i_sample) % sinewave.length];
                    output += inputHistory[inputHistoryLength - 1] * this.inputHistoryWeights[inputHistoryLength - 1];
                }

                // Update output history and amplitude
                if (outputHistoryLength > 0){
                    for (let i_outputHistorySample = 0; i_outputHistorySample < outputHistoryLength - 1; i_outputHistorySample++) {
                        output += outputHistory[i_outputHistorySample] * this.outputHistoryWeights[i_outputHistorySample];
                        outputHistory[i_outputHistorySample] = outputHistory[i_outputHistorySample + 1];
                    }
                    output += outputHistory[outputHistoryLength - 1] * this.outputHistoryWeights[outputHistoryLength - 1];
                    outputHistory[outputHistoryLength - 1] = output;
                }
                amplitude += Math.abs(output);
            }
            amplitude /= numberOfSamplesPerFrequency;
            this.frequencyResponse[i_frequency] = { frequency: frequency, amplitude: amplitude };
            error += Math.abs(amplitude - targetFrequencyResponse[i_frequency].amplitude);
        }
        this.fitness = Math.pow(1/Math.max(0.0000001, error), 5);
    }
}

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
        // let daddy = null;
        let fitnessSum = 0;
        for (let a = 0; a < this.filters.length; a++) {
            this.filters[a].updateFitness();

            // if (daddy == null || this.filters[a].fitness > daddy.fitness) {
            //     daddy = this.filters[a];
            // }

            if (this.bestFilter == null || this.filters[a].fitness > this.bestFilter.fitness) {
                this.bestFilter = this.filters[a];
                drawFrequencyResponseGraph(brush_bestFrequencyResponse, canvas_bestFrequencyResponse.width, canvas_bestFrequencyResponse.height, this.bestFilter.frequencyResponse, false);
            }

            fitnessSum += this.filters[a].fitness;
        }

        let survivors = this.filters;
        this.filters = new Array(populationSize);

        // Choose daddies and make new filters from them
        for (let i_child = 0; i_child < populationSize; i_child++) {
            let daddy = null;
            let daddyNumber = Math.random() * fitnessSum;

            let accumulatedFitness = 0;
            for (let i_survivor = 0; i_survivor < populationSize; i_survivor++) {
                accumulatedFitness += survivors[i_survivor].fitness;
                if (daddyNumber <= accumulatedFitness) {
                    daddy = survivors[i_survivor];
                    break;
                }
            }

            this.filters[i_child] = new Filter(daddy);
        }
    }
}

//--------------------------
// Update

let population = new Population();

function update() {
    population.update();

    // To give the page a chance lol
    setTimeout(() => { requestAnimationFrame(update) }, 20);
}
update();
