/*
* Snake evolution!!! By me, the avocado boi
* http://www.bjornsundin.com
*/

//------------------------------------------------------------------------------------------------------
// User modifyable parameters

var populationSize = {},
    poolSize = {},
    mutationRate = {},
    snakeHunger = {},

    numberOfNeuronsInHiddenLayer_0 = {},
    numberOfNeuronsInHiddenLayer_1 = {},
    obstacleSensorRange = {},

    numberOfIterationsPerFrame = {},
    width = {},
    snakeAlphaAnimationSpeed = {};

var obstacleSensorFieldWidth;

//------------------------------------------------------------------------------------------------------

var sliderData = [
    {
        name: "Population size*",
        defaultValue: 500,
        min: 10, max: 1000,
        step: 1,
        variable: populationSize,
        isNewCategory: false
    },
    {
        name: "Pool size",
        defaultValue: 30,
        min: 2, max: 500,
        step: 1,
        variable: poolSize,
        isNewCategory: false
    },
    {
        name: "Mutation rate",
        defaultValue: 0.001,
        min: 0, max: 0.007,
        step: 0.00001,
        variable: mutationRate,
        isNewCategory: false
    },
    {
        name: "Snake hunger",
        defaultValue: 0.0032,
        min: 0.0003, max: 0.009,
        step: 0.0001,
        variable: snakeHunger,
        isNewCategory: false
    },

    {
        name: "Neurons in hidden layer 0*",
        defaultValue: 10,
        min: 0, max: 45,
        step: 1,
        variable: numberOfNeuronsInHiddenLayer_0,
        isNewCategory: true
    },
    {
        name: "Neurons in hidden layer 1*",
        defaultValue: 0,
        min: 0, max: 45,
        step: 1,
        variable: numberOfNeuronsInHiddenLayer_1,
        isNewCategory: false
    },
    {
        name: "Obstacle sensor range*",
        defaultValue: 4,
        min: 1, max: 13,
        step: 1,
        variable: obstacleSensorRange,
        isNewCategory: false
    },

    {
        name: "Iterations per frame",
        defaultValue: 1,
        min: 1, max: 100,
        step: 1,
        variable: numberOfIterationsPerFrame,
        isNewCategory: true
    },
    {
        name: "Width*",
        defaultValue: 30,
        min: 5, max: 150,
        step: 1,
        variable: width,
        isNewCategory: false
    },
    {
        name: "Snake opacity animation speed",
        defaultValue: 0.06,
        min: 0.001, max: 1,
        step: 0.001,
        variable: snakeAlphaAnimationSpeed,
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
            switch (sliderData[a].name) {
                case "Pool size":
                    if (sliders[a].valueAsNumber > populationSize.value) {
                        poolSize.value = populationSize.value;
                        sliders[a].MaterialSlider.change(populationSize.value);
                        sliders[a].valueText.innerText = '(' + populationSize.value + ')';
                    }
                    sliders[a].max = populationSize.value;
                    sliders[a].MaterialSlider.updateValueStyles_();
                    break;
            }
        }
        text_status.innerHTML = "";
        population = new Population();
    });

    //------------------------------------------------------------------------------------------------------

    var div_content = document.getElementById("div_content");
    for (let a = 0; a < sliderData.length; a++) {
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

        let container = document.createElement("p");
        container.style.width = "357px";
        container.style.transform = "translateX(-10px) translateY(2px)";
        div_content.appendChild(container);

        //------------------------------------------------------------------------------------------------------

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

var text_status = document.getElementById("text_status");
var population = new Population();

function update() {
    for (var a = 0; a < numberOfIterationsPerFrame.value; a++) {
        if (a == numberOfIterationsPerFrame.value - 1) {
            brush.clearRect(0, 0, width.value, width.value);
            population.updateAndDraw();
        }
        else {
            population.update();
        }
    }
    requestAnimationFrame(update);
} update();