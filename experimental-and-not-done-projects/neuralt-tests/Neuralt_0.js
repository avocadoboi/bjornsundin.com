var Neuralt = {};

Neuralt.Neuron = class {
    constructor(inputNeurons) {
        this.inputNeurons = inputNeurons;
        this.inputWeightsAndBias = [];
        for (var a = 0; a < inputNeurons.length; a++) {
            this.inputWeightsAndBias.push(Math.random());
        }
        this.inputWeightsAndBias.push(0);
        this.output = 0;
    }
    updateOutput() {
        // Sum weighted inputs and bias
        var inputSum = this.inputWeightsAndBias[this.inputWeightsAndBias.length - 1];
        for (var a = 0; a < this.inputNeurons.length; a++) {
            inputSum += this.inputNeurons[a].output * this.inputWeightsAndBias[a];
        }

        // Activate with leaky relu
        this.output = Math.max(inputSum * 0.01, inputSum);
    }
}
Neuralt.InputNeuron = class {
    constructor() {
        this.output = 0;
    }
}

Neuralt.TrainingExample = class {
    constructor(inputValues, desiredOutputValues) {
        this.inputValues = inputValues;
        this.desiredOutputValues = desiredOutputValues;
        this.isInLearningBatch = false;
    }
}

Neuralt.NeuralNetwork = class {
    constructor(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer) {
        this.learningRate = 0.05;
        this.maxLearningBatchSize = 10;
        this.neurons = [[]];
        this.trainingExamples = [];

        // Input layer
        for (var a = 0; a < numberOfNeuronsInInputLayer; a++) {
            this.neurons[0].push(new Neuralt.InputNeuron());
        }

        // Hidden layers and output layer
        for (var a = 0; a < numberOfNeuronsInHiddenLayers.length + 1; a++) {
            this.neurons.push([]);
            for (var b = 0; b < (a == numberOfNeuronsInHiddenLayers.length ? numberOfNeuronsInOutputLayer : numberOfNeuronsInHiddenLayers[a]); b++) {
                this.neurons[this.neurons.length - 1].push(new Neuralt.Neuron(this.neurons[this.neurons.length - 2]));
            }
        }
    }
    getOutput(inputValues) {
        if (inputValues.length != this.neurons[0].length) return;

        for (var a = 0; a < this.neurons[0].length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }

        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateOutput();
            }
        }

        var outputValues = [];
        for (var a = 0; a < this.neurons[this.neurons.length - 1].length; a++) {
            outputValues.push(this.neurons[this.neurons.length - 1][a].output / this.neurons[this.neurons.length - 1].length);
        }
        return outputValues;
    }
    getError(outputValues, desiredOutputValues) {
        var error = 0;
        for (var a = 0; a < outputValues.length; a++) {
            error += Math.abs(desiredOutputValues[a] - outputValues[a]);
        }
        return error * error;
    }
    getNewLearningBatch() {
        var learningBatch = [];
        if (this.trainingExamples.length > this.maxLearningBatchSize) {
            var selectedTrainingExample;
            for (var a = 0; a < this.maxLearningBatchSize; a++) {
                do {
                    selectedTrainingExample = this.trainingExamples[Math.floor(Math.random() * this.trainingExamples.length)];
                } while (selectedTrainingExample.isInTrainingBatch);
                selectedTrainingExample.isInLearningBatch = true;
                learningBatch.push(selectedTrainingExample);
            }
            for (var a = 0; a < learningBatch.length; a++) {
                learningBatch[a].isInLearningBatch = false;
            }
        }
        else {
            learningBatch = this.trainingExamples;
        }
        return learningBatch;
    }
    getLoss(learningBatch) {
        if (learningBatch === undefined) {
            learningBatch = this.getNewLearningBatch();
        }
        var errorSum = 0;
        for (var a = 0; a < learningBatch.length; a++) {
            errorSum += this.getError(this.getOutput(learningBatch[a].inputValues), learningBatch[a].desiredOutputValues);
        }
        return errorSum / learningBatch.length;
    }
    train(inputValues, desiredOutputValues, willCheckIsDuplicate = false) {
        if (arguments.length > 0) {
            var existsTrainingExample = false;
            if (willCheckIsDuplicate) {
                outerLoop:
                for (var a = 0; a < this.trainingExamples.length; a++) {
                    for (var b = 0; b < this.trainingExamples[a].inputValues.length; b++) {
                        if (this.trainingExamples[a].inputValues[b] != inputValues[b]) {
                            break;
                        }
                        if (b == this.trainingExamples[a].inputValues.length - 1) {
                            existsTrainingExample = true;
                            break outerLoop;
                        }
                    }
                }
            }
            if (!existsTrainingExample) {
                this.trainingExamples.push(new Neuralt.TrainingExample(inputValues, desiredOutputValues));
            }
        }

        var learningBatch = this.getNewLearningBatch();

        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                for (var c = 0; c < this.neurons[a][b].inputWeightsAndBias.length; c++) {
                    var loss_before = this.getLoss(learningBatch);
                    this.neurons[a][b].inputWeightsAndBias[c] += this.learningRate;
                    var loss_after = this.getLoss(learningBatch);
                    this.neurons[a][b].inputWeightsAndBias[c] += Math.max(-0.5, Math.min(0.5, loss_before - loss_after)) * this.learningRate;
                }
            }
        }
    }
}