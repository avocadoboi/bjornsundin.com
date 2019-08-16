var canvas;
var state = 0;
var gravity = 0.27;
var groundPosition;
var groundFriction = 0.8;
var population;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    textSize(30);
    strokeWeight(1);
    groundPosition = height * 0.7;
    population = new Population();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    groundPosition = height * 0.7;
}

function draw() {
    if (state === 0) {
        // Add point/vertex
        if (events.wasMousePressed) {
            if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
                mouseY > height / 2 - 100 && mouseY < height / 2 + 100) {
                population.original.addPoint(mouseX, mouseY);
            }
        }

        // Start the evolution!!
        if (events.wasEnterPressed) {
            population.initialize();
            state++;
        }

        // Clear
        background(5);

        // Draw text!!
        textAlign(CENTER);
        noStroke();
        fill(255, 255, 255, 220);
        text("Draw your shape by clicking.", width / 2, height * 0.25);
        text("Press enter to continue.", width / 2, height * 0.75);

        // Draw rectangle
        noFill();
        stroke(255, 255, 255, 100);
        rect(width / 2 - 100, height / 2 - 100, 200, 200);

        // Draw creature
        population.original.draw();

        // Draw circles showing where the points of the creature are
        for (var c = 0; c < population.original.points.length; c++) {
            stroke(0);
            if (c === population.original.points.length - 1)
                fill(255, 200, 200, 150);
            else
                fill(255, 255, 255, 150);
            ellipse(population.original.points[c].position.x, population.original.points[c].position.y, 10, 10);
        }
        events.reset();
    }
    if (state == 1) {
        population.update();

        // Clear
        background(0);

        // Draw the ground!!
        stroke(255);
        line(0, groundPosition, width, groundPosition);

        // Draw creature!1!
        population.draw();
    }
}