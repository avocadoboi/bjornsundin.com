//=====================================================================================================================
// Constants

const GRAPH_RESOLUTION = 200;

//=====================================================================================================================
// Global variables

var isPaused = true;
var numberOfHiddenNeurons = 5;

//=====================================================================================================================
// Neural network stuffs

var neuralNetwork = new Neuralt.SupervisedLearningNeuralNetwork(1, [numberOfHiddenNeurons], 1);
neuralNetwork.setActivation(Neuralt.Activations.Sigmoid);
neuralNetwork.maxLearningBatchSize = 100000;
neuralNetwork.learningRate = 0.05;
neuralNetwork.parameterDamping = 0.03;

var learningExamples = [];
neuralNetwork.learningExamples = learningExamples;

//=====================================================================================================================
// Canvas stuffs

var canvas = document.getElementById("canvas");
var brush = canvas.getContext("2d");
canvas.addEventListener("click", (event) => learningExamples.push(new Neuralt.LearningExample([event.offsetX / canvas.width * 2 - 1], [1 - event.offsetY / canvas.height])));

var canvas_visualization = document.getElementById("canvas_visualization");
var brush_visualization = canvas_visualization.getContext("2d");
canvas_visualization.width = document.getElementById("controls").clientWidth;
canvas_visualization.height = document.getElementById("output").clientHeight - document.getElementById("controls").clientHeight - 80;

function update() {
    if (!isPaused) {
        neuralNetwork.learn();
    }

    //=====================================================================================================================
    // Clear visualization background

    brush_visualization.clearRect(0, 0, canvas_visualization.width, canvas_visualization.height);

    //=====================================================================================================================
    // Draw visualization

    let radius = canvas_visualization.height / neuralNetwork.neurons[1].length / 3;

    brush_visualization.fillStyle = "rgb(255,64,129)";

    for (let a = 0; a < neuralNetwork.neurons[1].length; a++) {
        let y = canvas_visualization.height / neuralNetwork.neurons[1].length * (a + 0.5);

        brush_visualization.strokeStyle = neuralNetwork.neurons[1][a].parameters[0].value >= 0 ? "lightblue" : "red";
        brush_visualization.lineWidth = Math.abs(neuralNetwork.neurons[1][a].parameters[0].value);
        brush_visualization.beginPath();
        brush_visualization.moveTo(canvas_visualization.width * 0.5, y);
        brush_visualization.lineTo(radius, canvas_visualization.height * 0.5);
        brush_visualization.stroke();
        
        brush_visualization.strokeStyle = neuralNetwork.neurons[2][0].parameters[a].value >= 0 ? "lightblue" : "red";
        brush_visualization.lineWidth = Math.abs(neuralNetwork.neurons[2][0].parameters[a].value);
        brush_visualization.beginPath();
        brush_visualization.moveTo(canvas_visualization.width * 0.5, y);
        brush_visualization.lineTo(canvas_visualization.width - radius, canvas_visualization.height * 0.5);
        brush_visualization.stroke();

        brush_visualization.beginPath();
        brush_visualization.arc(canvas_visualization.width * 0.5, y, radius, 0, Math.PI * 2);
        brush_visualization.fill();
    }

    brush_visualization.beginPath();
    brush_visualization.arc(radius, canvas_visualization.height * 0.5, radius, 0, Math.PI * 2);
    brush_visualization.fill();

    brush_visualization.beginPath();
    brush_visualization.arc(canvas_visualization.width - radius, canvas_visualization.height * 0.5, radius, 0, Math.PI * 2);
    brush_visualization.fill();

    //=====================================================================================================================
    // Clear background

    brush.clearRect(0, 0, canvas.width, canvas.height);

    //=====================================================================================================================
    // Draw text

    brush.fillStyle = "#ddd";
    brush.textAlign = "center";
    brush.font = "100 40px arial";
    brush.fillText("Click to add points", canvas.width * 0.5, canvas.height * 0.5);

    //=====================================================================================================================
    // Draw points

    for (let a = 0; a < learningExamples.length; a++) {
        brush.fillStyle = "black";
        brush.beginPath();
        brush.arc((learningExamples[a].inputValues[0] + 1) * canvas.width * 0.5, (1 - learningExamples[a].desiredOutputValues[0]) * canvas.height, 4, 0, Math.PI * 2);
        brush.fill();
    }

    //=====================================================================================================================
    // Draw output

    brush.strokeStyle = "#000";
    brush.lineWidth = 1.5;
    brush.beginPath();
    for (let x = -1; x <= 1.00000000000001; x += 2 / GRAPH_RESOLUTION) {
        let y = (1 - neuralNetwork.getOutput([x])[0]) * canvas.height;
        if (x == -1) {
            brush.moveTo((x + 1) * canvas.width * 0.5, y);
        }
        else {
            brush.lineTo((x + 1) * canvas.width * 0.5, y);
        }
    }
    brush.stroke();

    //=====================================================================================================================
    // Draw output for neurons

    let neuron;
    let outputLayer = neuralNetwork.neurons[neuralNetwork.neurons.length - 1];
    for (let a = 0; a < neuralNetwork.neurons[neuralNetwork.neurons.length - 2].length; a++) {
        neuron = neuralNetwork.neurons[neuralNetwork.neurons.length - 2][a];

        brush.strokeStyle = "rgba(0, 150, 0, 0.5)";
        brush.beginPath();
        for (let x = -1; x <= 1.00000000000001; x += 2 / GRAPH_RESOLUTION) {
            neuralNetwork.forwardPropagate([x]);

            let y = (-(neuron.output * outputLayer[0].parameters[a].value + outputLayer[0].parameters[outputLayer[0].parameters.length - 1].value)) * canvas.height * 0.5 + canvas.height * 0.5;
            if (x == -1) {
                brush.moveTo((x + 1) * canvas.width * 0.5, y);
            }
            else {
                brush.lineTo((x + 1) * canvas.width * 0.5, y);
            }
        }
        brush.stroke();
    }

    //=====================================================================================================================

    requestAnimationFrame(update);
}; update();

//=====================================================================================================================
// Controls

(() => {
    // Clearing points
    document.getElementById("button_clear").onclick = () => learningExamples.splice(0, learningExamples.length);

    // Pause/play
    let button_playPause = document.getElementById("button_playPause");
    button_playPause.onclick = () => {
        isPaused = !isPaused
        button_playPause.children[0].innerHTML = isPaused ? "play_arrow" : "pause";
        document.getElementById("tooltip_playPause").innerHTML = isPaused ? "Continue learning" : "Pause learning";
    };

    // Reset neural network
    document.getElementById("button_reset").onclick = () => {
        neuralNetwork.neurons = [[new Neuralt.InputNeuron()], []];
        for (let a = 0; a < numberOfHiddenNeurons; a++) {
            neuralNetwork.neurons[neuralNetwork.neurons.length - 1].push(new Neuralt.Neuron(neuralNetwork.neurons[0], false, neuralNetwork));
        }
        neuralNetwork.neurons.push([new Neuralt.Neuron(neuralNetwork.neurons[neuralNetwork.neurons.length - 1], true, neuralNetwork)]);
    };

    // Activation function
    let select_activation = document.getElementById("select_activation");
    for (var activation in Neuralt.Activations) {
        select_activation.add(new Option(activation.toString()));
        if (Neuralt.Activations[activation.toString()] == neuralNetwork.neuronActivation) {
            select_activation.options[select_activation.options.length - 1].selected = true;
        }
    }
    select_activation.onchange = () => neuralNetwork.setActivation(Neuralt.Activations[select_activation.options[select_activation.selectedIndex].innerHTML]);

    // Gradient descent optimization
    let select_gradientDescentOptimization = document.getElementById("select_gradientDescentOptimization");
    for (var optimization in Neuralt.GradientDescentOptimizations) {
        select_gradientDescentOptimization.add(new Option(optimization.toString()));
        if (Neuralt.GradientDescentOptimizations[optimization.toString()] == neuralNetwork.gradientDescentOptimization) {
            select_gradientDescentOptimization.options[select_gradientDescentOptimization.options.length - 1].selected = true;
        }
    }
    select_gradientDescentOptimization.onchange = () => neuralNetwork.gradientDescentOptimization = Neuralt.GradientDescentOptimizations[select_gradientDescentOptimization.options[select_gradientDescentOptimization.selectedIndex].innerHTML];

    // Learning rate
    let slider_learningRate = document.getElementById("slider_learningRate");
    slider_learningRate.value = neuralNetwork.learningRate.toString();
    slider_learningRate.onchange = () => neuralNetwork.learningRate = parseFloat(slider_learningRate.value);

    // Parameter damping
    let slider_parameterDamping = document.getElementById("slider_parameterDamping");
    slider_parameterDamping.value = neuralNetwork.parameterDamping.toString();
    slider_parameterDamping.onchange = () => neuralNetwork.parameterDamping = parseFloat(slider_parameterDamping.value);

    // Number of hidden neurons
    let input_numberOfHiddenNeurons = document.getElementById("input_numberOfHiddenNeurons");
    input_numberOfHiddenNeurons.value = numberOfHiddenNeurons.toString();
    input_numberOfHiddenNeurons.oninput = () => numberOfHiddenNeurons = parseInt(Math.max(1, input_numberOfHiddenNeurons.value));
})()