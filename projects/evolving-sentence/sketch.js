var population;
var targetString = "I like cats. Cats are cool!!!";
var possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.! ";

function setup() {
    createCanvas(windowWidth, windowHeight);

    population = new Population();
    population.start();

    textSize(30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

String.prototype.replaceCharAt = function (index, char) {
    return this.substr(0, index) + char + this.substr(index + 1);
}

function draw() {
    population.update();

    if (population.getIsDone()) {
        population.mutationProbability = 0.001;
        population.isDone = true;
    }

    background(200);
    population.draw();
}