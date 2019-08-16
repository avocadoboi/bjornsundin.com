/*
* Snake learning!!! By me, the avocado boi
* http://www.bjornsundin.com
*/

//------------------------------------------------------------------------------------------------------
// User modifyable parameters

var learningRate = {},
    learningBatchSize = {},
    experiencePrioritization = {},
    targetNetworkUpdateFrequency = {},
    feedbackTimeDiscount = {},
    explorationFactor = {},
    minExploration = {},
    maxExploration = {},
    numberOfNeuronsInHiddenLayer_0 = {},
    numberOfNeuronsInHiddenLayer_1 = {},
    obstacleSensorRange = {},

    frameRate = {},
    numberOfIterationsPerFrame = {},
    width = {};

//------------------------------------------------------------------------------------------------------

var sliderData = [
    {
        name: "Learning rate",
        defaultValue: 0.01,
        min: 0.001, max: 0.07,
        step: 0.001,
        variable: learningRate,
        isNewCategory: false
    },
    {
        name: "Learning batch size",
        defaultValue: 35,
        min: 1, max: 200,
        step: 1,
        variable: learningBatchSize,
        isNewCategory: false
    },
    {
        name: "Experience prioritization*",
        defaultValue: 0.9,
        min: 0, max: 1,
        step: 0.01,
        variable: experiencePrioritization,
        isNewCategory: false
    },
    {
        name: "Target network update freq.",
        defaultValue: 500,
        min: 1, max: 3000,
        step: 1,
        variable: targetNetworkUpdateFrequency,
        isNewCategory: false
    },
    {
        name: "Feedback time discount",
        defaultValue: 0.87,
        min: 0, max: 0.999,
        step: 0.001,
        variable: feedbackTimeDiscount,
        isNewCategory: false
    },
    {
        name: "Exploration decrease factor",
        defaultValue: 0.9991,
        min: 0.99, max: 0.999999,
        step: 0.000001,
        variable: explorationFactor,
        isNewCategory: false
    },
    {
        name: "Minimum exploration",
        defaultValue: 0,
        min: 0, max: 0.5,
        step: 0.001,
        variable: minExploration,
        isNewCategory: false
    },
    {
        name: "Maximum exploration*",
        defaultValue: 1,
        min: 0, max: 1,
        step: 0.001,
        variable: maxExploration,
        isNewCategory: false
    },

    {
        name: "Neurons in hidden layer 0*",
        defaultValue: 10,
        min: 0, max: 70,
        step: 1,
        variable: numberOfNeuronsInHiddenLayer_0,
        isNewCategory: true
    },
    {
        name: "Neurons in hidden layer 1*",
        defaultValue: 0,
        min: 0, max: 70,
        step: 1,
        variable: numberOfNeuronsInHiddenLayer_1,
        isNewCategory: false
    },
    {
        name: "Obstacle sensor range*",
        defaultValue: 2,
        min: 1, max: 15,
        step: 1,
        variable: obstacleSensorRange,
        isNewCategory: false
    },

    {
        name: "Frame rate",
        defaultValue: 60,
        min: 2, max: 60,
        step: 1,
        variable: frameRate,
        isNewCategory: true
    },
    {
        name: "Iterations per frame",
        defaultValue: 2,
        min: 1, max: 100,
        step: 1,
        variable: numberOfIterationsPerFrame,
        isNewCategory: false
    },
    {
        name: "Width*",
        defaultValue: 30,
        min: 5, max: 150,
        step: 1,
        variable: width,
        isNewCategory: false
    }
];
var sliders = [];

function getHasAsteriskAtEnd(string) {
    return string.charAt(string.length - 1) == '*';
}

(function () {
    var button_restart = document.getElementById("button_restart");
    button_restart.addEventListener("click", function () {
        for (var a = 0; a < sliders.length; a++) {
            if (getHasAsteriskAtEnd(sliderData[a].name)) {
                sliderData[a].variable.value = sliders[a].valueAsNumber;
                sliders[a].valueText.innerText = '(' + sliderData[a].variable.value + ')';
            }
        }
        snake = new Snake();
    });

    //------------------------------------------------------------------------------------------------------

    var div_content = document.getElementById("div_content");
    for (let a = 0; a < sliderData.length; a++) {
        // Add slider description

        let description = document.createElement("p");
        if (getHasAsteriskAtEnd(sliderData[a].name)) {
            description.innerHTML = sliderData[a].name.substr(0, sliderData[a].name.length - 1) + "<span class='red'>*</span> :";
        }
        else {
            description.innerHTML = sliderData[a].name + ":";
        }
        if (sliderData[a].isNewCategory) {
            description.style.marginTop = "15px";
        }
        div_content.appendChild(description);

        //------------------------------------------------------------------------------------------------------
        // Add slider container

        let container = document.createElement("p");
        container.style.width = "357px";
        container.style.transform = "translateX(-10px) translateY(2px)";
        div_content.appendChild(container);

        //------------------------------------------------------------------------------------------------------
        // Add slider

        let slider = document.createElement("input");
        container.appendChild(slider);

        slider.type = "range";
        slider.min = sliderData[a].min.toString();
        slider.max = sliderData[a].max.toString();
        slider.step = sliderData[a].step.toString();
        slider.className = "mdl-slider mdl-js-slider";

        componentHandler.upgradeElement(slider);
        slider.MaterialSlider.change(sliderData[a].defaultValue);
        sliders.push(slider);

        sliderData[a].variable.value = sliderData[a].defaultValue;
        if (!getHasAsteriskAtEnd(sliderData[a].name)) {
            slider.addEventListener("input", function () {
                sliderData[a].variable.value = slider.valueAsNumber;
            });
        }

        //------------------------------------------------------------------------------------------------------
        // Add slider value text

        let valueText = document.createElement("p");
        valueText.style.transform = "translateX(-25px)";
        valueText.innerText = '(' + slider.value + ')';
        slider.addEventListener("input", function () {
            if (slider.value != sliderData[a].variable.value) {
                valueText.innerHTML = '(' + sliderData[a].variable.value + ", <span class='red'>" + slider.value + '</span>)';
            }
            else {
                valueText.innerHTML = '(' + slider.value + ')';
            }
        });
        slider.valueText = valueText;
        div_content.appendChild(valueText);

        div_content.appendChild(document.createElement("br"));
    }
})()

//------------------------------------------------------------------------------------------------------

var obstacleSensorFieldWidth;
var snake = new Snake();
var text_status = document.getElementById("text_status");

//------------------------------------------------------------------------------------------------------

var frameCount = 0;
function update() {
    if (frameCount % (60 / frameRate.value) < 1) {
        snake.neuralNetwork.learningRate = learningRate.value;
        snake.neuralNetwork.experiencePrioritization = experiencePrioritization.value;
        snake.neuralNetwork.discountFactor = feedbackTimeDiscount.value;
        snake.neuralNetwork.explorationFactor = explorationFactor.value;
        snake.neuralNetwork.minExploration = minExploration.value;
        snake.neuralNetwork.maxExploration = maxExploration.value;
        snake.neuralNetwork.maxLearningBatchSize = learningBatchSize.value;
        snake.neuralNetwork.targetNetworkUpdateFrequency = targetNetworkUpdateFrequency.value;

        for (var a = 0; a < numberOfIterationsPerFrame.value; a++) {
            snake.update();
        }
        brush.clearRect(0, 0, width.value, width.value);
        snake.draw();

        // if (snake.neuralNetwork.averageFeedback === undefined) {
        //     text_status.innerHTML = "Average feedback: unknown, best length: " + snake.recordLength;
        // }
        // else {
        //     text_status.innerHTML = "Average feedback: " + snake.neuralNetwork.averageFeedback.toFixed(3) + ", best length: " + snake.recordLength;
        // }
        text_status.innerHTML = "Average length: " + Math.round(snake.averageLength) + ", best length: " + snake.recordLength;
    }
    frameCount++;
    requestAnimationFrame(update);
} update();