// Constant variables
//
var MAX_WORD_SIZE = 9;
var HIDDEN_LAYER_SIZES = [60, 40];
var NEURON_ACTIVATION = Neuralt.Activations.LeakyReLU;
var LEARNING_ITERATIONS = 50;
var LEARNING_RATE = 0.01;
var LEARNING_BATCH_PROPORTION = 0.9;

// Some functions
//
function getFileContent() {
    var result = undefined;
    var fileRequest = new XMLHttpRequest();
    fileRequest.open("get", "neuralNetwork.json?cachePrevention=" + Math.random(), false);
    fileRequest.send();
    return fileRequest.responseText;
}
function setFileContent(data) {
    var phpRequest = new XMLHttpRequest();
    phpRequest.open("post", "write-to-file.php", true);
    phpRequest.send(data);
}
function getInputValuesFromWords(strings) {
    var result = [];
    for (var i_string = 0; i_string < strings.length; i_string++) {
        strings[i_string] = strings[i_string].toLowerCase();
        for (var i_character = 0; i_character < MAX_WORD_SIZE; i_character++) {
            if (i_character >= strings[i_string].length) {
                result.push(0);
            }
            else {
                result.push((strings[i_string].charCodeAt(i_character) - 96) / 26);
            }
        }
    }
    return result;
}
String.prototype.getWithoutCharAt = function (index) {
    return this.slice(0, index) + this.slice(index + 1, this.length);
}

// Neural network stuff
//
var neuralNetwork = new Neuralt.SupervisedLearningNeuralNetwork(MAX_WORD_SIZE * 2, HIDDEN_LAYER_SIZES, 1);
var numberOfLearningExamples = 0;
function updateLearningBatchSize() {
    neuralNetwork.maxLearningBatchSize = Math.round(neuralNetwork.learningExamples.length * LEARNING_BATCH_PROPORTION);
}
(function setupNeuralNetwork() {
    neuralNetwork.neuronActivation = NEURON_ACTIVATION;
    neuralNetwork.learningRate = LEARNING_RATE;

    // Load data
    //
    var data = JSON.parse(getFileContent());
    var data_learningExamples = data["learningExamples"];
    numberOfLearningExamples = data_learningExamples.length;
    for (var i_learningExample = 0; i_learningExample < data_learningExamples.length; i_learningExample++) {
        neuralNetwork.learningExamples.push(
            new Neuralt.LearningExample(data_learningExamples[i_learningExample].inputValues, data_learningExamples[i_learningExample].desiredOutputValues)
        );
    }
    var data_parameters = data["parameters"];
    if (data_parameters.length > 0) {
        var data_i_parameter = 0;
        for (var i_neuronLayer = 1; i_neuronLayer < neuralNetwork.neurons.length; i_neuronLayer++) {
            for (var i_neuron = 0; i_neuron < neuralNetwork.neurons[i_neuronLayer].length; i_neuron++) {
                for (var i_parameter = 0; i_parameter < neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters.length; i_parameter++) {
                    neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value = data_parameters[data_i_parameter].value;
                    neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].lossSlopeMean = data_parameters[data_i_parameter].lossSlopeMean;
                    neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].lossSlopeVariance = data_parameters[data_i_parameter].lossSlopeVariance;
                    data_i_parameter++;
                }
            }
        }
    }
    updateLearningBatchSize();
})();
function learn(inputValues, desiredOutputValues) {
    // Import data
    var data = JSON.parse(getFileContent()),
        data_learningExamples = data["learningExamples"],
        data_parameters = data["parameters"];

    for (var i_learningExample = numberOfLearningExamples; i_learningExample < data_learningExamples.length; i_learningExample++) {
        neuralNetwork.learningExamples.push(new Neuralt.LearningExample(
            data_learningExamples[i_learningExample].inputValues, data_learningExamples[i_learningExample].desiredOutputValues
        ));
    }

    var existedLearningExample = false;
    outerLoop:
    for (var i_learningExample = 0; i_learningExample < data_learningExamples.length; i_learningExample++) {
        for (var i_inputValue = 0; i_inputValue < data_learningExamples[i_learningExample].inputValues.length; i_inputValue++) {
            if (data_learningExamples[i_learningExample].inputValues[i_inputValue] != inputValues[i_inputValue]) {
                break;
            }
            if (i_inputValue == data_learningExamples[i_learningExample].inputValues.length - 1) {
                data_learningExamples[i_learningExample].desiredOutputValues = desiredOutputValues;
                neuralNetwork.learningExamples[i_learningExample].desiredOutputValues = desiredOutputValues;
                existedLearningExample = true;
                break outerLoop;
            }
        }
    }

    if (existedLearningExample) {
        for (var a = 0; a < LEARNING_ITERATIONS; a++) neuralNetwork.learn();
    }
    else {
        neuralNetwork.learningExamples.push(new Neuralt.LearningExample(inputValues, desiredOutputValues));
        data_learningExamples.push({ inputValues: inputValues, desiredOutputValues: desiredOutputValues });
        for (var a = 0; a < LEARNING_ITERATIONS; a++) neuralNetwork.learn();
    }

    numberOfLearningExamples = neuralNetwork.learningExamples.length;

    data["parameters"] = [];
    data_parameters = data["parameters"];
    for (var i_neuronLayer = 1; i_neuronLayer < neuralNetwork.neurons.length; i_neuronLayer++) {
        for (var i_neuron = 0; i_neuron < neuralNetwork.neurons[i_neuronLayer].length; i_neuron++) {
            for (var i_parameter = 0; i_parameter < neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters.length; i_parameter++) {
                data_parameters.push({
                    value: neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value,
                    lossSlopeMean: neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].lossSlopeMean,
                    lossSlopeVariance: neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].lossSlopeVariance
                });
            }
        }
    }

    // Export
    setFileContent(JSON.stringify(data));
}

// UI functionality
//
(function setupTabButtons() {
    var tabButtons = document.querySelectorAll("#div_tabButtons > div");
    var tabs = document.querySelectorAll("#div_container > div");

    function styleHovering(button) {
        button.style.backgroundColor = "#007899";
        button.style.color = "white";
    }
    function stylePressed(button) {
        button.style.backgroundColor = "#005C75";
        button.style.color = "white";
        button.style.cursor = "default";
    }
    function styleResting(button) {
        button.style.backgroundColor = "white";
        button.style.color = "black";
        button.style.cursor = "pointer";
    }
    for (var a = 0; a < tabButtons.length; a++) {
        tabButtons[a].tabIndex = a;
        tabButtons[a].onmousedown = function (event_0) {
            event_0.target.onmouseenter = function () { }
            event_0.target.onmouseleave = function () { }
            stylePressed(event_0.target);
            tabs[event_0.target.tabIndex].style.display = "block";

            for (var b = 0; b < tabButtons.length; b++) {
                if (b != event_0.target.tabIndex) {
                    styleResting(tabButtons[b]);
                    tabButtons[b].onmouseenter = function (event_1) { styleHovering(event_1.target); }
                    tabButtons[b].onmouseleave = function (event_1) { styleResting(event_1.target); }
                    tabs[b].style.display = "none";
                }
            }
        }
        tabButtons[a].ontouchstart = function (event) { event.target.onmousedown(event); }
    }
    tabButtons[1].onmousedown({ target: tabButtons[1] });
})();
(function setupInputs() {
    var inputs = document.getElementsByTagName("input");
    for (var i_input = 0; i_input < inputs.length; i_input++) {
        inputs[i_input].oninput = function (event) {
            var string = event.target.value;
            event.target.value = "";
            var characterCode;
            for (var a = 0; a < string.length; a++) {
                characterCode = string.charCodeAt(a);
                if (((characterCode >= 97 && characterCode <= 122) || (characterCode >= 65 && characterCode <= 90)) && a < MAX_WORD_SIZE) {
                    event.target.value += string.charAt(a);
                }
            }
        }
    }
})();
(function setupTestTab() {
    var inputs = document.querySelectorAll("#div_tab_test > input");
    var p_answer = document.getElementById("p_answer");
    for (var i_input = 0; i_input < inputs.length; i_input++) {
        inputs[i_input].addEventListener("input", function () {
            var output = neuralNetwork.getOutput(getInputValuesFromWords([inputs[0].value, inputs[1].value]))[0];
            p_answer.innerHTML = (output >= 0.5 ? "Yes." : "No.") + "<br>(" + output.toFixed(2) + ")";
        });
    }
})();
(function setupTrainTab() {
    var inputs = document.querySelectorAll("#div_tab_learn > input");
    var selector_rhymesWith = document.querySelector("#div_tab_learn > select");
    var button_learn = document.querySelector("#div_tab_learn > button");
    var p_loss = document.querySelector("#div_tab_learn > p");
    button_learn.onclick = function () {
        learn(getInputValuesFromWords([inputs[0].value, inputs[1].value]), [+(selector_rhymesWith.selectedIndex == 0)]);

        neuralNetwork.maxLearningBatchSize = neuralNetwork.learningExamples.length;
        p_loss.innerText = "Loss: " + neuralNetwork.getLoss().toFixed(5);
        updateLearningBatchSize();
    }
})();
(function setupWatchTab() {
    var NEURON_CIRCLE_RADIUS = 7;

    var canvas = document.querySelector("#div_tab_watch > canvas"),
        brush = canvas.getContext("2d");

    var maxLayerSize = 0;
    for (var i_neuronLayer = 0; i_neuronLayer < neuralNetwork.neurons.length; i_neuronLayer++) {
        if (neuralNetwork.neurons[i_neuronLayer].length > maxLayerSize) {
            maxLayerSize = neuralNetwork.neurons[i_neuronLayer].length;
        }
    }
    document.querySelectorAll("#div_tabButtons > div")[2].addEventListener("click", function () {
        brush.clearRect(0, 0, canvas.width, canvas.height);

        var neuronPositions = [];
        for (var i_neuronLayer = 0; i_neuronLayer < neuralNetwork.neurons.length; i_neuronLayer++) {
            neuronPositions.push([]);
            for (var i_neuron = 0; i_neuron < neuralNetwork.neurons[i_neuronLayer].length; i_neuron++) {
                neuronPositions[i_neuronLayer].push({
                    x: NEURON_CIRCLE_RADIUS + i_neuronLayer * (canvas.width - NEURON_CIRCLE_RADIUS * 2) / (neuralNetwork.neurons.length - 1),
                    y: canvas.height * 0.5 + (i_neuron - neuralNetwork.neurons[i_neuronLayer].length * 0.5) * (canvas.height - NEURON_CIRCLE_RADIUS * 2) / maxLayerSize,
                });
                brush.beginPath();
                brush.arc(
                    neuronPositions[i_neuronLayer][i_neuron].x,
                    neuronPositions[i_neuronLayer][i_neuron].y,
                    NEURON_CIRCLE_RADIUS, 0, Math.PI * 2
                );
                brush.fillStyle = "#007899";
                brush.fill();
                if (i_neuronLayer > 0) {
                    for (var i_parameter = 0; i_parameter < neuronPositions[i_neuronLayer - 1].length; i_parameter++) {
                        brush.beginPath();
                        brush.moveTo(neuronPositions[i_neuronLayer - 1][i_parameter].x, neuronPositions[i_neuronLayer - 1][i_parameter].y);
                        brush.lineTo(neuronPositions[i_neuronLayer][i_neuron].x, neuronPositions[i_neuronLayer][i_neuron].y);
                        if (neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value > 0) {
                            brush.strokeStyle = "rgba(0, 0, 0, " + neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value + ")";
                        }
                        else {
                            brush.strokeStyle = "rgba(255, 0, 0, " + -neuralNetwork.neurons[i_neuronLayer][i_neuron].parameters[i_parameter].value + ")";
                        }
                        brush.stroke();
                    }
                }
            }
        }
    });
})()