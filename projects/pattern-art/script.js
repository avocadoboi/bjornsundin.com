function drawImage() {
    var hueRange = random(5, 30);
    var startingHue = random(100 - hueRange);
    var dotResolution = round(random(3, 20));
    var scaleX = random(0.0000000001, 0.2);
    var scaleY = random(0.0000000001, 0.2);
    var isSquares = round(random());

    background(startingHue, 100, 10);

    for (let a = 0; a < dotResolution * dotResolution; a++) {
        let sinAngle_x = (a % dotResolution) / (dotResolution - 1) / scaleX - 0.5 / scaleX + HALF_PI;
        let sinAngle_y = floor(a / dotResolution) / (dotResolution - 1) / scaleY - 0.5 / scaleY + HALF_PI;
        let brightness = (sin(sinAngle_x) * 0.5 + 0.5) * (sin(sinAngle_y) * 0.5 + 0.5);

        fill(startingHue + brightness * hueRange, 85, 100, brightness * 100);

        if (isSquares) {
            rect(
                (a % dotResolution) * width / dotResolution + width / dotResolution * 0.5,
                floor(a / dotResolution) * height / dotResolution + height / dotResolution * 0.5,
                width / dotResolution * brightness,
                height / dotResolution * brightness
            );
        }
        else {
            ellipse(
                (a % dotResolution) * width / dotResolution + width / dotResolution * 0.5,
                floor(a / dotResolution) * height / dotResolution + height / dotResolution * 0.5,
                width / dotResolution * brightness,
                height / dotResolution * brightness
            );
        }
    }
}

function setup() {
    createCanvas(1425, 1425);
    noStroke();
    rectMode(CENTER);
    colorMode(HSB, 100, 100, 100, 100);

    drawImage();
}