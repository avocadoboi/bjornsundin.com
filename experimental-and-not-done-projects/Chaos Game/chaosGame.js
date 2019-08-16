var numberOfShapePoints = 3,
    pointRadius = 0.5,
    iterations = 100;

var currentPoint;
var shapePoints = [];
var history = [];

function setup() {
    var canvasStyle = createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight)).canvas.style;
    canvasStyle.position = "absolute";
    canvasStyle.left = "50%";
    canvasStyle.top = "50%";
    canvasStyle.transform = "translateX(-50%) translateY(-50%)";
    background(0);
    noStroke();
    fill(120, 100, 255);

    currentPoint = createVector(random(width), random(height));

    for (var a = 0; a < TWO_PI; a += TWO_PI / numberOfShapePoints)
        shapePoints.push(createVector(sin(a - HALF_PI) * width / 2 + width / 2, cos(a - HALF_PI) * height / 2 + height / 2));
}

function draw() {
    for (var a = 0; a < iterations; a++) {
        var randomPointIndex;
        var willTryNew = true;
        while (willTryNew) {
            randomPointIndex = floor(random(shapePoints.length));

            willTryNew = false;
            for (var b = 0; b < history.length; b++)
                if (history[b] == randomPointIndex)
                    willTryNew = true;
        }
        for (var b = history.length - 1; b > 0; b--)
            history[b] = history[b - 1];
        //history[0] = randomPointIndex;
        currentPoint.set(
            (shapePoints[randomPointIndex].x + currentPoint.x) / 2,
            (shapePoints[randomPointIndex].y + currentPoint.y) / 2);
        ellipse(currentPoint.x, currentPoint.y, pointRadius * 2);
    }
}