/*
* A simple neural network library made by Björn Sundin.
* Be prepared for long variable names.
* http://bjornsundin.com
*/

// Namespace
var Neuralt = {};

//-------------------------------------------------------------------------------------------------

// Activations. Pass one of these variables into 
// the getActivated function to use the activation.
Neuralt.Activations = {
    Linear: 0,
    Bent: 1,
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
};

// Returns the input activated with the specified activation.
Neuralt.getActivated = function (input, activation) {
    switch (activation) {
        case Neuralt.Activations.Linear:
            return input;

        case Neuralt.Activations.Bent:
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
};

// Returns derivative of the specified activation function at specified input.
Neuralt.getActivationDerivative = function (input, activation) {
    switch (activation) {
        case Neuralt.Activations.Linear:
            return 1;

        case Neuralt.Activations.Bent:
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
            let sigmoid = Neuralt.getActivated(input, activation);
            return sigmoid * (1 - sigmoid);

        case Neuralt.Activations.BipolarSigmoid:
            return Neuralt.getActivationDerivative(input, Neuralt.Activations.Sigmoid) * 2;
    }
};

//-------------------------------------------------------------------------------------------------

Neuralt.GradientDescentOptimizations = {
    Simple: 0,
    Momentum: 1,
    Adam: 2
};

//-------------------------------------------------------------------------------------------------

// Value that is added when dividing by a number that could
// be zero.
Neuralt.smallConstant = 0.0000000001;

//-------------------------------------------------------------------------------------------------

// A weight or bias in a neural network.
Neuralt.Parameter = class {
    constructor(neuralNetwork, isBias) {
        this.neuralNetwork = neuralNetwork;
        this.isBias = isBias;
        this.reset();
    }
    adjust() {
        switch (this.neuralNetwork.gradientDescentOptimization) {
            case Neuralt.GradientDescentOptimizations.Simple:
                this.value -= Math.max(-1, Math.min(1, this.neuralNetwork.learningRate * this.lossSlope));
                break;

            case Neuralt.GradientDescentOptimizations.Momentum:
                this.velocity *= 1 - this.neuralNetwork.parameterDamping;
                this.velocity -= this.lossSlope * this.neuralNetwork.learningRate;
                this.value += Math.max(-1, Math.min(1, this.velocity));
                break;

            case Neuralt.GradientDescentOptimizations.Adam:
                this.lossSlopeMean = this.lossSlopeMean * 0.9 + this.lossSlope * 0.1;
                this.lossSlopeVariance = this.lossSlopeVariance * 0.999 + this.lossSlope * this.lossSlope * 0.001;
                this.value -= Math.max(-1, Math.min(1, this.neuralNetwork.learningRate / (Math.sqrt(this.lossSlopeVariance * 1000 + Neuralt.smallConstant)) * this.lossSlopeMean * 10));
                break;
        }
    }
    reset() {
        if (this.isBias) {
            this.value = 0;
        }
        else {
            this.value = Math.random() - 0.5;
        }

        this.lossSlope = 0;
        this.velocity = 0;
        this.lossSlopeMean = 0;
        this.lossSlopeVariance = 0;
    }
};


// A neuron, that simply calculates an output from input(s).
Neuralt.Neuron = class {
    constructor(inputNeurons, isOutputNeuron, neuralNetwork) {
        this.neuralNetwork = neuralNetwork;

        this.inputNeurons = inputNeurons;
        this.parameters = [];
        for (let a = 0; a < inputNeurons.length; a++) {
            this.parameters.push(new Neuralt.Parameter(this.neuralNetwork, false));
        }
        this.parameters.push(new Neuralt.Parameter(this.neuralNetwork, true));

        this.isOutputNeuron = isOutputNeuron;
        this.lossSlope = 0;
        this.output = 0;
        this.output_beforeActivation = 0;
    }
    updateOutput() {
        let inputSum = this.parameters[this.parameters.length - 1].value;
        for (let a = 0; a < this.inputNeurons.length; a++) {
            inputSum += this.inputNeurons[a].output * this.parameters[a].value;
        }

        this.output_beforeActivation = inputSum;
        this.output = Neuralt.getActivated(inputSum, (this.isOutputNeuron ? this.neuralNetwork.outputNeuronActivation : this.neuralNetwork.neuronActivation));
    }
};
Neuralt.InputNeuron = class {
    constructor() {
        this.output = 0;
    }
};

//-------------------------------------------------------------------------------------------------

// A neural network unable to learn.
Neuralt.NeuralNetwork = class {
    /*
    * Constructs a new neural network.
    *
    * numberOfNeuronsInHiddenLayers is an array where each number 
    * represents the number of neurons in a hidden layer that has
    * the same index as the number in the array.
    */
    constructor(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer) {
        // Hyper-parameters

        // The activation function that's applied to the hidden neurons.
        this.neuronActivation = Neuralt.Activations.LeakyReLU;

        // The activation function that's applied to the output neurons.
        this.outputNeuronActivation = Neuralt.Activations.LeakyReLU;

        //-------------------------------------------------------------------------------------------------
        // Internal variables

        // Two-dimensional array of neuron layers and neurons.
        this.neurons = [[]];

        // Total number of parameters in the whole neural network.
        this.numberOfParameters = 0;

        //-------------------------------------------------------------------------------------------------
        // Construct neural network

        // Input layer
        for (let a = 0; a < numberOfNeuronsInInputLayer; a++) {
            this.neurons[0].push(new Neuralt.InputNeuron());
        }

        // Hidden layers and output layer
        for (let a = 0; a < numberOfNeuronsInHiddenLayers.length + 1; a++) {
            this.neurons.push([]);
            let isOutputLayer = (a == numberOfNeuronsInHiddenLayers.length);
            for (let b = 0; b < (isOutputLayer ? numberOfNeuronsInOutputLayer : numberOfNeuronsInHiddenLayers[a]); b++) {
                this.neurons[this.neurons.length - 1].push(new Neuralt.Neuron(this.neurons[this.neurons.length - 2], isOutputLayer, this));
            }
            this.numberOfParameters += (this.neurons[a].length + 1) * this.neurons[a + 1].length;
        }
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Generates outputs for every neuron in the neural network, from input values.
    */
    forwardPropagate(inputValues) {
        if (inputValues.length != this.neurons[0].length) return;

        for (let a = 0; a < this.neurons[0].length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }

        for (let a = 1; a < this.neurons.length; a++) {
            for (let b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateOutput();
            }
        }
    }

    /*
    * Generates outputs for every neuron in the neural network and returns
    * the output values of the output layer, as an array.
    */
    getOutput(inputValues) {
        if (inputValues.length != this.neurons[0].length) return;

        for (let a = 0; a < this.neurons[0].length; a++) {
            this.neurons[0][a].output = inputValues[a];
        }

        let outputValues = [];
        for (let a = 1; a < this.neurons.length; a++) {
            for (let b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].updateOutput();
                if (a == this.neurons.length - 1) {
                    outputValues.push(this.neurons[a][b].output);
                }
            }
        }
        return outputValues;
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Sets both the output neuron activation function and the hidden
    * layer activation function.
    */
    setActivation(activation) {
        this.neuronActivation = activation;
        this.outputNeuronActivation = activation;
    }

    /*
    * Resets the loss gradients/slopes/derivatives of all neurons
    * and parameters.
    * This is used in multiple of the learning neural networks,
    * which is why it's defined here.
    */
    resetLossSlopes() {
        for (let a = 1; a < this.neurons.length; a++) {
            for (let b = 0; b < this.neurons[a].length; b++) {
                this.neurons[a][b].lossSlope = 0;
                for (let c = 0; c < this.neurons[a][b].parameters.length; c++) {
                    this.neurons[a][b].parameters[c].lossSlope = 0;
                }
            }
        }
    }

    /*
    * Resets all of the data of the parameters in the neural network.
    * It re-initializes the values of them and their adjustment data (like velocity). 
    */
    resetParameters() {
        for (let a = 1; a < this.neurons.length; a++) {
            for (let b = 0; b < this.neurons[a].length; b++) {
                for (let c = 0; c < this.neurons[a][b].parameters.length; c++) {
                    this.neurons[a][b].parameters[c].reset();
                }
            }
        }
    }
};

//-------------------------------------------------------------------------------------------------

// A neural network that learns.
Neuralt.LearningNeuralNetwork = class extends Neuralt.NeuralNetwork {
    constructor(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer) {
        super(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer);

        //-------------------------------------------------------------------------------------------------
        // Parameters

        // How fast the neural network learns.
        this.learningRate = 0.01;

        // How much the velocity of a parameter is damped, when momentum is used.
        this.parameterDamping = 0.03;

        // The algorithm for updating parameters.
        this.gradientDescentOptimization = Neuralt.GradientDescentOptimizations.Adam;
    }

}

//-------------------------------------------------------------------------------------------------

// Something that a supervised learning neural network learns from.
Neuralt.LearningExample = class {
    constructor(inputValues, desiredOutputValues) {
        this.inputValues = inputValues;
        this.desiredOutputValues = desiredOutputValues;
        this.isInLearningBatch = false;
    }
};

// A neural network that learns by getting teached.
Neuralt.SupervisedLearningNeuralNetwork = class extends Neuralt.LearningNeuralNetwork {
    /*
    * Constructs a new supervised learning neural network.
    *
    * numberOfNeuronsInHiddenLayers is an array where each number 
    * represents the number of neurons in a hidden layer that
    * has the same index as the number in the array.
    */
    constructor(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer) {
        super(numberOfNeuronsInInputLayer, numberOfNeuronsInHiddenLayers, numberOfNeuronsInOutputLayer);

        //-------------------------------------------------------------------------------------------------
        // Hyper-parameters

        // the maximum number of learning examples the net uses when learning.
        this.maxLearningBatchSize = 100;

        //-------------------------------------------------------------------------------------------------
        // Internal variables

        // What the net learns from, input values paired with output values.
        this.learningExamples = [];
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Adds a new learning example to the neural network, to 
    * learn from later. If willCheckIsDuplicate is true and
    * the learning example already is stored in the neural
    * network, it won't add it.
    */
    addLearningExample(inputValues, desiredOutputValues, willCheckIsDuplicate = false) {
        if (!willCheckIsDuplicate) {
            this.learningExamples.push(new Neuralt.LearningExample(inputValues, desiredOutputValues));
        }
        else if (!this.getExistsLearningExample(inputValues)) {
            this.learningExamples.push(new Neuralt.LearningExample(inputValues, desiredOutputValues));
        }
    }

    /*
    * Returns if the specified learning example already is
    * stored in the neural network
    */
    getExistsLearningExample(learningExampleInputValues) {
        for (let a = 0; a < this.learningExamples.length; a++) {
            for (let b = 0; b < this.learningExamples[a].inputValues.length; b++) {
                if (this.learningExamples[a].inputValues[b] != learningExampleInputValues[b]) {
                    break;
                }
                if (b == this.learningExamples[a].inputValues.length - 1) {
                    return true;
                }
            }
        }
        return false;
    }

    /*
    * Returns a new learning batch.
    * A learning batch is an array of fixed size
    * with shuffled learning examples that
    * are used in a "learning session".
    */
    getNewLearningBatch() {
        // Just to speed up things a tiny bit
        if (this.maxLearningBatchSize == 1) {
            return [this.learningExamples[Math.floor(Math.random() * this.learningExamples.length)]];
        }

        let learningBatch = [];
        if (this.learningExamples.length > this.maxLearningBatchSize) {
            let selectedLearningExample;
            for (let a = 0; a < this.maxLearningBatchSize; a++) {
                do {
                    selectedLearningExample = this.learningExamples[Math.floor(Math.random() * this.learningExamples.length)];
                } while (selectedLearningExample.isInLearningBatch);
                selectedLearningExample.isInLearningBatch = true;
                learningBatch.push(selectedLearningExample);
            }
            for (let a = 0; a < this.maxLearningBatchSize; a++) {
                learningBatch[a].isInLearningBatch = false;
            }
        }
        else {
            learningBatch = this.learningExamples;
        }
        return learningBatch;
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Returns the error between an output the neural 
    * network generated and the desired output.
    */
    getError(outputValues, desiredOutputValues) {
        let error = 0;
        for (let a = 0; a < outputValues.length; a++) {
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
        let errorSum = 0;
        for (let a = 0; a < learningBatch.length; a++) {
            errorSum += this.getError(this.getOutput(learningBatch[a].inputValues), learningBatch[a].desiredOutputValues);
        }
        return errorSum / learningBatch.length;
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Trains the neural network using backpropagation
    * and gradient descent. 
    * You don't need to give it any arguments
    * if any learning examples already are stored
    * in the neural network. If you give it arguments,
    * it will add the input values and desired
    * output values as a new learning example.
    * If willCheckIsDuplicate == true and the 
    * input values you gave it already exist in a
    * learning example, it won't add the new one.
    */
    learn(inputValues, desiredOutputValues, willCheckIsDuplicate = false) {
        if (arguments.length >= 2) {
            addLearningExample(inputValues, desiredOutputValues, willCheckIsDuplicate);
        }
        if (this.learningExamples.length == 0) return;

        // The learning examples it's going to decrease
        // the errors of for this "learning session".
        let learningBatch = this.getNewLearningBatch();

        // Reset previous loss slopes/derivatives/gradients
        // and perform backpropagation and gradient descent.
        this.resetLossSlopes();
        let learningExample, neuron;
        for (let i_learningExample = 0; i_learningExample < learningBatch.length; i_learningExample++) {
            learningExample = learningBatch[i_learningExample];

            // Calculate the outputs of the neurons with this
            // learning example's input values, so that the
            // outputs can be used to calculate the loss
            // slopes for every parameter.
            this.forwardPropagate(learningExample.inputValues);

            for (let i_neuronLayer = this.neurons.length - 1; i_neuronLayer > 0; i_neuronLayer--) {
                for (let i_neuron = 0; i_neuron < this.neurons[i_neuronLayer].length; i_neuron++) {
                    neuron = this.neurons[i_neuronLayer][i_neuron];

                    // Calculate the partial derivative of the error function for
                    // this learning example relative to the output of this neuron.
                    if (i_neuronLayer == this.neurons.length - 1) {
                        neuron.lossSlope = neuron.output - learningExample.desiredOutputValues[i_neuron];
                        // neuron.lossSlope *= Neuralt.getActivationDerivative(neuron.output_beforeActivation, this.outputNeuronActivation);
                    }
                    else {
                        neuron.lossSlope = 0;
                        for (let a = 0; a < this.neurons[i_neuronLayer + 1].length; a++) {
                            neuron.lossSlope += this.neurons[i_neuronLayer + 1][a].parameters[i_neuron].value * this.neurons[i_neuronLayer + 1][a].lossSlope;
                        }
                        neuron.lossSlope *= Neuralt.getActivationDerivative(neuron.output_beforeActivation, this.neuronActivation);
                    }

                    for (let i_parameter = 0; i_parameter < neuron.parameters.length; i_parameter++) {
                        // Calculate the partial derivative of the error function for
                        // this learning example relative to this parameter.
                        if (i_parameter < neuron.parameters.length - 1) {
                            neuron.parameters[i_parameter].lossSlope += this.neurons[i_neuronLayer - 1][i_parameter].output * neuron.lossSlope;
                        }
                        else {
                            neuron.parameters[i_parameter].lossSlope += neuron.lossSlope;
                        }

                        // If we're on the last learning example,
                        // we're done with the loss slopes and
                        // we can adjust the actual parameters
                        // of the neural network.
                        if (i_learningExample == learningBatch.length - 1) {
                            neuron.parameters[i_parameter].adjust();
                        }
                    }
                }
            }
        }
    }
};

//-------------------------------------------------------------------------------------------------

// A neural network that learns from experiences and feedback.
// I'll update this with a few optimizations in the future.
Neuralt.ReinforcementLearningNeuralNetwork = class extends Neuralt.LearningNeuralNetwork {
    /*
    * Constructs a new reinforcement learning neural network.
    *
    * numberOfNeuronsInHiddenLayers is an array where each
    * number represents the number of neurons in a hidden
    * layer that has the same index as the number in the array.
    */
    constructor(numberOfInputs, numberOfNeuronsInHiddenLayers, numberOfActions) {
        super(numberOfInputs, numberOfNeuronsInHiddenLayers, numberOfActions);

        //-------------------------------------------------------------------------------------------------
        // Hyper-parameters

        // How much of its previous experience it remembers
        // every time it gets new feedback.
        this.maxLearningBatchSize = 25;

        // How much the quality of the action after a certain action changes
        // the quality of that certain action.
        this.discountFactor = 0.99;

        // The maximum number of experiences it can remember.
        this.memoryLength = 100000;

        // The minimum probability of random actions.
        this.minExploration = 0.01;

        // The maximum probability of random actions.
        this.maxExploration = 1;

        // How much the probability of random actions decreases over time.
        this.explorationFactor = 0.995;

        // How much experiences that it can learn from more are prioritized.
        this.experiencePrioritization = 0.4;

        // Minimum prioritization of an experience.
        this.minExperiencePrioritization = 0.1;

        // How fast the decaying feedback average changes.
        this.averageFeedbackDecay = 0.999;

        // How often the target network is updated.
        this.targetNetworkUpdateFrequency = 20;

        //-------------------------------------------------------------------------------------------------
        // Internal variables

        // A decaying average of the feedback it gets.
        this.averageFeedback = undefined;

        this.updateCount = 0;

        // The number of outputs/action values the neural network generates.
        this.numberOfActions = numberOfActions;

        // The current probability of random actions.
        this.explorationRate = this.maxExploration;

        // New experience since the last time it got feedback.
        this.experienceSinceFeedback = [];

        // This is what it learns from. These experiences are stored automatically
        // when you give it feedback. It's a sum tree, to be able to efficiently
        // select experiences from a distribution, when prioritizing them.
        this.experience = [[0], []];

        // A neural network that is copied from this primary neural network every
        // targetNetworkUpdateFrequency update. It's used when calculating the target
        // outputs for this nn. This makes learning more stable, since the target
        // outputs don't always shift towards the current outputs (+ reward).
        this.targetNetwork = new Neuralt.NeuralNetwork(numberOfInputs, numberOfNeuronsInHiddenLayers, numberOfActions);
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Returns the next action the neural net will take in the environment,
    * and saves it as an experience to be learned from later.
    */
    getNextAction(state) {
        let action = 0;
        if (Math.random() < this.explorationRate) {
            action = Math.floor(Math.random() * this.numberOfActions);
        }
        else {
            let outputs = this.getOutput(state);
            for (let a = 1; a < outputs.length; a++) {
                if (outputs[a] > outputs[action]) {
                    action = a;
                }
            }
        }
        this.explorationRate = this.minExploration + (this.explorationRate - this.minExploration) * this.explorationFactor;
        if (this.explorationRate < this.minExploration) {
            this.explorationRate = this.minExploration;
        }
        this.experienceSinceFeedback.push({ state_0: state, state_1: undefined, action: action, targetQ: undefined, priority: undefined, feedback: 0 });
        return action;
    }

    //-------------------------------------------------------------------------------------------------

    /*
    * Returns the "Q", how good the action it took in the specified
    * experience is.
    */
    getTargetQ(experience) {
        // Find the best action for the next state
        let actions = this.getOutput(experience.state_1);
        let bestAction = 0;
        for (let a = 0; a < actions.length; a++) {
            if (actions[a] > actions[bestAction]) {
                bestAction = a;
            }
        }

        // The (target) Q of the best action of the next state
        // plus the feedback of the action it took in state_0.
        return experience.feedback + this.discountFactor * this.targetNetwork.getOutput(experience.state_1)[bestAction];
    }

    /*
    * Gives feedback to the neural network, which makes it learn from
    * its previous experiences.
    *
    * The feedback can be any real number. Negative feedback makes it
    * learn to avoid what it did in that context, positive does the opposite.
    */
    giveFeedback(feedback) {
        // Just because this means it doesn't have any experience at all!
        // Ya can't learn from feedback if you haven't done anything!
        if (this.experienceSinceFeedback.length == 0) return;

        //-------------------------------------------------------------------------------------------------
        // Update some variables.

        this.targetNetwork.neuronActivation = this.neuronActivation;
        this.targetNetwork.ouputNeuronActivation = this.ouputNeuronActivation;

        if (this.averageFeedback === undefined) {
            this.averageFeedback = feedback;
        }
        else {
            this.averageFeedback = this.averageFeedback * this.averageFeedbackDecay + feedback * (1 - this.averageFeedbackDecay);
        }

        //-------------------------------------------------------------------------------------------------
        // Create learning batch.

        let learningBatch = [];
        for (let a = 0; a < Math.min(this.experience[this.experience.length - 1].length, this.maxLearningBatchSize); a++) {
            let selectedExperience;
            let randomValue = Math.floor(Math.random() * this.experience[0][0]);
            let index = [0, 0];
            let left, right;
            while (selectedExperience == undefined) {
                index = [index[0] + 1, index[1] * 2];
                left = this.experience[index[0]][index[1]];
                if (this.experience[index[0]].length > index[1] + 1) {
                    right = this.experience[index[0]][index[1] + 1];
                }

                if (typeof left == "object") {
                    if (randomValue <= left.priority) {
                        selectedExperience = left;
                    }
                    else {
                        selectedExperience = right;
                    }
                }
                else {
                    if (randomValue > left) {
                        randomValue -= left;
                        index[1]++;
                    }
                }
            }
            selectedExperience.targetQ = this.getTargetQ(selectedExperience);
            learningBatch.push(selectedExperience);
        }

        //-------------------------------------------------------------------------------------------------
        // Set target Qs for the new experiences, add them to the 
        // learning batch and give feedback to the newest experience

        for (let a = this.experienceSinceFeedback.length - 2; a >= 0; a--) {
            this.experienceSinceFeedback[a].state_1 = this.experienceSinceFeedback[a + 1].state_0;
            this.experienceSinceFeedback[a].targetQ = this.getTargetQ(this.experienceSinceFeedback[a]);
            learningBatch.push(this.experienceSinceFeedback[a]);
        }
        this.experienceSinceFeedback.splice(0, this.experienceSinceFeedback.length - 1);
        this.experienceSinceFeedback[0].feedback = feedback;

        //-------------------------------------------------------------------------------------------------
        // Learn from these experiences by doing backpropagation
        // and gradient descent with experience.targetQ as target
        // output for the action in that experience.

        this.resetLossSlopes();
        let experience, neuron;
        for (let i_experience = 0; i_experience < learningBatch.length; i_experience++) {
            experience = learningBatch[i_experience];

            this.forwardPropagate(experience.state_0);

            for (let i_neuronLayer = this.neurons.length - 1; i_neuronLayer > 0; i_neuronLayer--) {
                for (let i_neuron = 0; i_neuron < this.neurons[i_neuronLayer].length; i_neuron++) {
                    neuron = this.neurons[i_neuronLayer][i_neuron];

                    if (i_neuronLayer == this.neurons.length - 1) {
                        if (i_neuron == experience.action) {
                            neuron.lossSlope = neuron.output - experience.targetQ;

                            if (experience.index == undefined) {
                                experience.priority = Math.max(this.minExperiencePrioritization, Math.pow(Math.abs(neuron.lossSlope), this.experiencePrioritization));
                                experience.index = this.experience[this.experience.length - 1].length;

                                this.experience[this.experience.length - 1].push(experience);
                                for (let a = this.experience.length - 1; a > 0; a--) {
                                    if (this.experience[a].length > this.experience[a - 1].length * 2) {
                                        this.experience[a - 1].push(experience.priority);
                                    }
                                    else {
                                        this.experience[a - 1][this.experience[a - 1].length - 1] += experience.priority;
                                    }
                                }
                                if (this.experience[0].length == 2) {
                                    this.experience.unshift([this.experience[0][0] + this.experience[0][1]]);
                                }
                            }
                            else {
                                let difference = Math.max(this.minExperiencePrioritization, Math.pow(Math.abs(neuron.lossSlope), this.experiencePrioritization)) - experience.priority;
                                experience.priority += difference;

                                let index = experience.index;
                                for (let a = this.experience.length - 2; a >= 0; a--) {
                                    index = Math.floor(index * 0.5);
                                    this.experience[a][index] += difference;
                                }
                            }
                            // neuron.lossSlope *= Neuralt.getActivationDerivative(neuron.output_beforeActivation, this.outputNeuronActivation);
                        }
                        else {
                            neuron.lossSlope = 0;
                        }
                    }
                    else {
                        neuron.lossSlope = 0;
                        for (let a = 0; a < this.neurons[i_neuronLayer + 1].length; a++) {
                            neuron.lossSlope += this.neurons[i_neuronLayer + 1][a].parameters[i_neuron].value * this.neurons[i_neuronLayer + 1][a].lossSlope;
                        }
                        neuron.lossSlope *= Neuralt.getActivationDerivative(neuron.output_beforeActivation, this.neuronActivation);
                    }

                    for (let i_parameter = 0; i_parameter < neuron.parameters.length; i_parameter++) {
                        if (i_parameter < neuron.parameters.length - 1) {
                            neuron.parameters[i_parameter].lossSlope += this.neurons[i_neuronLayer - 1][i_parameter].output * neuron.lossSlope;
                        }
                        else {
                            neuron.parameters[i_parameter].lossSlope += neuron.lossSlope;
                        }

                        if (i_experience == learningBatch.length - 1) {
                            neuron.parameters[i_parameter].adjust();
                            if (this.updateCount % this.targetNetworkUpdateFrequency == 0) {
                                this.targetNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value = neuron.parameters[i_parameter].value;
                            }
                        }
                    }
                }
            }
        }
        if (this.experience[this.experience.length - 1].length == (this.memoryLength << 1)) {
            for (let a = 1; a < this.experience.length; a++) {
                this.experience[a].splice(0, 1 << (a - 1));
            }
            for (let a = 0; a < this.experience[this.experience.length - 1].length; a++) {
                this.experience[this.experience.length - 1][a].index = a;
            }
            this.experience.splice(0, 1);
        }

        this.updateCount++;
    }
}