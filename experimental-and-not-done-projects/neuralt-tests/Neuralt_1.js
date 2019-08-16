/*
* A simple neural network library,
* made by Björn Sundin.
* http://bjornsundin.com
*/

// Namespace
var Neuralt = {};

// Neuron activation stuff
//
// Activations. Pass one of these
// variables into the getActivated function
// to use the activation.
Neuralt.Activations = {
    Linear: 0,
    BentLinear: 1,
    ReLU: 2,
    SmoothReLU: 3,
    LeakyReLU: 4,
    ELU: 5,
    Sine: 6,
    LongSine: 7,
    Cosine: 8,
    LongCosine: 9,
    Sinc: 10,
    Gaussian: 11,
    Softsign: 12,
    InverseTangent: 13,
    HyperbolicTangent: 14,
    Sigmoid: 15,
    BipolarSigmoid: 16
}
//
// Returns the input activated with
// the specified activation.
Neuralt.getActivated = function (input, activation) {
    switch (activation) {
        case Neuralt.Activations.Linear:
            return input;

        case Neuralt.Activations.BentLinear:
            return (Math.sqrt(input * input + 1) - 1) / 2 + input;

        case Neuralt.Activations.ReLU:
            return input * +(input > 0);

        case Neuralt.Activations.SmoothReLU:
            return Math.log(Math.exp(input) + 1);

        case Neuralt.Activations.LeakyReLU:
            return input < 0 ? input * 0.01 : input;

        case Neuralt.Activations.ELU:
            return input < 0 ? Math.exp(input) - 1 : input;

        case Neuralt.Activations.Sine:
            return Math.sin(input);

        case Neuralt.Activations.LongSine:
            return Math.sin(input) * 2;

        case Neuralt.Activations.Cosine:
            return Math.cos(input);

        case Neuralt.Activations.LongCosine:
            return Math.cos(input) * 2;

        case Neuralt.Activations.Sinc:
            return input != 0 ? Math.sin(input) / input : 1;

        case Neuralt.Activations.Gaussian:
            return Math.exp(-input * input);

        case Neuralt.Activations.Softsign:
            return input / (Math.abs(input) + 1);

        case Neuralt.Activations.InverseTangent:
            return Math.atan(input);

        case Neuralt.Activations.HyperbolicTangent:
            return Math.tanh(input);

        case Neuralt.Activations.Sigmoid:
            return 1 / (Math.exp(-input) + 1);

        case Neuralt.Activations.BipolarSigmoid:
            return 2 / (Math.exp(-input) + 1) - 1;
    }
}
// Returns derivative of the specified
// activation function at specified input.
Neuralt.getActivationDerivative = function (input, activation) {
    switch (activation) {
        case Neuralt.Activations.Linear:
            return 1;

        case Neuralt.Activations.BentLinear:
            return input / (Math.sqrt(input * input + 1) * 2) + 1;

        case Neuralt.Activations.ReLU:
            return +(input > 0);

        case Neuralt.Activations.SmoothReLU:
            return 1 / (Math.exp(-input) + 1);

        case Neuralt.Activations.LeakyReLU:
            return input < 0 ? 0.01 : 1;

        case Neuralt.Activations.ELU:
            return input < 0 ? Math.exp(input) : 1;

        case Neuralt.Activations.Sine:
            return Math.cos(input);

        case Neuralt.Activations.LongSine:
            return Math.cos(input) * 2;

        case Neuralt.Activations.Cosine:
            return -Math.sin(input);

        case Neuralt.Activations.LongCosine:
            return -Math.sin(input) * 2;

        case Neuralt.Activations.Sinc:
            return input != 0 ? Math.cos(input) / input - Math.sin(input) / (input * input) : 0;

        case Neuralt.Activations.Gaussian:
            return Math.exp(-input * input) * input * -2;

        case Neuralt.Activations.Softsign:
            return 1 / Math.pow(Math.abs(input) + 1, 2);

        case Neuralt.Activations.InverseTangent:
            return 1 / (input * input + 1);

        case Neuralt.Activations.HyperbolicTangent:
            return 1 - Math.pow(Math.tanh(input), 2);

        case Neuralt.Activations.Sigmoid:
            var sigmoid = Neuralt.getActivated(input, activation);
            return sigmoid * (1 - sigmoid);

        case Neuralt.Activations.BipolarSigmoid:
            return Neuralt.getActivationDerivative(input, Neuralt.Activations.Sigmoid) * 2;
    }
}

// Classes
//
// A weight or bias in a neural network.
Neuralt.parameter = class {
    constructor(value) {
        this.value = value;
        this.lossSlope = 0;
    }
}
Neuralt.Neuron = class {
    constructor(inputNeurons, neuralNetwork) {
        this.inputNeurons = inputNeurons;
        this.parameters = [];
        for (var a = 0; a < inputNeurons.length + 1; a++) {
            this.parameters.push(new Neuralt.parameter(Math.random() * 2 - 1));
        }
        this.lossSlope = 0;
        this.output = 0;
        this.output_beforeActivation = 0;
        this.neuralNetwork = neuralNetwork;
    }
    updateOutput() {
        // Sum weighted inputs and bias
        var inputSum = this.parameters[this.parameters.length - 1].value;
        for (var a = 0; a < this.inputNeurons.length; a++) {
            inputSum += this.inputNeurons[a].output * this.parameters[a].value;
        }

        this.output_beforeActivation = inputSum;
        this.output = Neuralt.getActivated(inputSum, this.neuralNetwork.neuronActivation);
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
    /*
    * Constructs a new neural network.
    * numberOfNeuronsInHiddenLayers is an array where
    * each number represents the number of neurons
    * in a hidden layer with the same index as
    * the number in the array. 
    */
    constructor(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer) {
        // The speed of learning.
        // Too high will cause the loss to flip out,
        // too low will just make the learning slow.
        // The more neurons you use, the faster it
        // will learn. To normalize the learning rate,
        // use normalizeLearningRate().
        this.learningRate = 0.05;

        // The biggest adjustment the neural network
        // can make to a weight/bias while learning.
        this.maxParameterAdjustment = 0.5;

        this.neuronActivation = Neuralt.Activations.LongSine;
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
                this.neurons[this.neurons.length - 1].push(new Neuralt.Neuron(this.neurons[this.neurons.length - 2], this));
            }
        }
    }

    /*
    * Changes the learning rate according
    * to how many parameters (weights, biases)
    * there are in the neural network.
    * This way, the learning won't transform
    * into Sonic the Hedgehog when you 
    * increase the number of neurons.
    */
    normalizeLearningRate() {
        var numberOfParameters = 0;
        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                numberOfParameters += this.neurons[a][b].parameters.length;
            }
        }
        this.learningRate /= numberOfParameters;
    }

    /*
    * Generates outputs for every neuron
    * in the neural network, from an
    * input.
    */
    forwardPropagate(inputValues) {
        if (inputValues.length != this.neurons[0].length) return;

        for (var a = 0; a < this.neurons[0].length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }

        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateOutput();
            }
        }
    }

    /*
    * Generates outputs for every neuron
    * in the neural network and returns
    * the output values of the output
    * layer, as an array.
    */
    getOutput(inputValues) {
        if (inputValues.length != this.neurons[0].length) return;

        for (var a = 0; a < this.neurons[0].length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }

        var outputValues = [];
        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateOutput();
                if (a == this.neurons.length - 1) {
                    outputValues.push(this.neurons[a][b].output);
                }
            }
        }

        return outputValues;
    }

    /*
    * Returns a new learning batch.
    * A learning batch is an array of fixed size
    * with random training examples that
    * are used in a "training session".
    */
    getNewLearningBatch() {
        // Just to speed up things a tiny bit
        if (this.maxLearningBatchSize == 1) {
            return [this.trainingExamples[Math.floor(Math.random() * this.trainingExamples.length)]];
        }

        var learningBatch = [];
        if (this.trainingExamples.length > this.maxLearningBatchSize) {
            var selectedTrainingExample;
            for (var a = 0; a < this.maxLearningBatchSize; a++) {
                do {
                    selectedTrainingExample = this.trainingExamples[Math.floor(Math.random() * this.trainingExamples.length)];
                } while (selectedTrainingExample.isInLearningBatch);
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

    /*
    * Resets the loss gradients/slopes/derivatives
    * of all neurons and parameters.
    */
    resetLossSlopes() {
        for (var a = 1; a < this.neurons.length; a++) {
            for (var b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].lossSlope = 0;
                for (var c = 0; c < this.neurons[a][b].parameters.length; c++) {
                    this.neurons[a][b].parameters[c].lossSlope = 0;
                }
            }
        }
    }

    /*
    * Returns the error between an output
    * the neural network generated and
    * the desired output. Output values
    * are arrays.
    */
    getError(outputValues, desiredOutputValues) {
        var error = 0;
        for (var a = 0; a < outputValues.length; a++) {
            error += Math.pow(desiredOutputValues[a] - outputValues[a], 2) * 0.5;
        }
        return error;
    }

    /*
    * Returns the loss/error/cost of the whole
    * neural network. How bad it is doing, 
    * essentially.
    */
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

    /*
    * Trains the neural network using backpropagation
    * and gradient descent. 
    * You don't need to give it any arguments
    * if any training examples already are stored
    * in the neural network. If you give it arguments,
    * it will store the input values and desired
    * output values as a new training example.
    * If willCheckIsDuplicate == true, it will
    * check if the input values you gave it already
    * exist in a training example.
    */
    train(inputValues, desiredOutputValues, willCheckIsDuplicate = false) {
        // Check if the specified training example
        // already is stored in the neural network.
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

        // The training examples it's going to decrease
        // the errors of this "training session".
        var learningBatch = this.getNewLearningBatch();

        // Reset previous loss slopes/derivatives/gradients
        // and perform backpropagation and gradient descent.
        this.resetLossSlopes();
        var trainingExample,
            neuron,
            parameter;
        for (var i_trainingExample = 0; i_trainingExample < learningBatch.length; i_trainingExample++) {
            trainingExample = learningBatch[i_trainingExample];

            this.forwardPropagate(trainingExample.inputValues);

            for (var i_neuronLayer = this.neurons.length - 1; i_neuronLayer > 0; i_neuronLayer--) {
                for (var i_neuron = 0; i_neuron < this.neurons[i_neuronLayer].length; i_neuron++) {
                    neuron = this.neurons[i_neuronLayer][i_neuron];

                    // Calculate the partial derivative of the error function for
                    // this training example relative to the output of this neuron.
                    if (i_neuronLayer == this.neurons.length - 1) {
                        neuron.lossSlope = (neuron.output - trainingExample.desiredOutputValues[i_neuron]) / learningBatch.length;
                    }
                    else {
                        neuron.lossSlope = 0;
                        for (var a = 0; a < this.neurons[i_neuronLayer + 1].length; a++) {
                            neuron.lossSlope += this.neurons[i_neuronLayer + 1][a].parameters[i_neuron].value * this.neurons[i_neuronLayer + 1][a].lossSlope;
                        }
                    }
                    neuron.lossSlope *= Neuralt.getActivationDerivative(neuron.output_beforeActivation, this.neuronActivation);

                    for (var i_parameter = 0; i_parameter < neuron.parameters.length; i_parameter++) {
                        // Calculate the partial derivative of the error function for
                        // this training example relative to this parameter.
                        if (i_parameter < neuron.parameters.length - 1) {
                            neuron.parameters[i_parameter].lossSlope += this.neurons[i_neuronLayer - 1][i_parameter].output * neuron.lossSlope;
                        }
                        else {
                            neuron.parameters[i_parameter].lossSlope += neuron.lossSlope;
                        }

                        // If we're on the last training example,
                        // we're done with the loss slopes and
                        // we can adjust the actual parameters
                        // of the neural network.
                        if (i_trainingExample == learningBatch.length - 1) {
                            neuron.parameters[i_parameter].value += Math.max(-this.maxParameterAdjustment, Math.min(this.maxParameterAdjustment, -neuron.parameters[i_parameter].lossSlope * this.learningRate));
                        }
                    }
                }
            }
        }
    }
}