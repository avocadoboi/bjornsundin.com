// Constant parameters
var attractionStrength = 10;
var minAttractionDistance = 40;
var numberOfIterations = 5;
var edgeMargin = 0.1; // Expressed as proportion of width

//-------------------------------
// Randomized parameters

var numberOfAttractors = Math.floor(Math.random() * 10 + 5);
var v_hue = Math.random() * 360;
var positionFollowSpeed = Math.random() * (0.002 - 0.0001) + 0.0001;
var isDark = Math.round(Math.random());

//-------------------------------

var canvas = document.getElementsByTagName("canvas")[0];
var brush = canvas.getContext("2d");
brush.fillStyle = "hsl(" + v_hue.toString() + ", " + (isDark ? 20 : 8).toString() + "%, " + (isDark ? 6 : 75.5).toString() + "%)";
brush.fillRect(0, 0, canvas.width, canvas.height);

brush.strokeStyle = "hsla(" + v_hue.toString() + ", " + "100%, " + (isDark ? 50 : 25).toString() + "%, 0.05)";
brush.lineWidth = 2;

//-------------------------------

function getNewPosition() {
    return new Vector(
        canvas.width * (Math.random() * (1 - edgeMargin * 2) + edgeMargin),
        canvas.height * (Math.random() * (1 - edgeMargin * 2) + edgeMargin)
    );
}

//-------------------------------

var attractors = [];
for (var a = 0; a < numberOfAttractors; a++) {
    attractors.push({ position: getNewPosition(), mass: Math.random() * 3 + 8 });
}

//-------------------------------

var position_0 = getNewPosition();
var position_1 = position_0.getCopy();

var velocityAmplitude = Math.random(),
    velocityAngle = Math.random() * Math.PI * 2;

var velocity = new Vector(Math.cos(velocityAngle) * velocityAmplitude, Math.sin(velocityAngle) * velocityAmplitude);

//-------------------------------

function update() {
    for (var i_iteration = 0; i_iteration < numberOfIterations; i_iteration++) {
        for (var a = 0; a < attractors.length; a++) {
            var accelerationVector = attractors[a].position.getSubtracted(position_0);
            var distanceSquared = accelerationVector.x * accelerationVector.x + accelerationVector.y * accelerationVector.y;
            if (distanceSquared > minAttractionDistance * minAttractionDistance) {
                accelerationVector.divide(Math.sqrt(distanceSquared));
                accelerationVector.multiply(attractionStrength * attractors[a].mass / distanceSquared);
                velocity.add(accelerationVector);
            }
        }

        position_1.add(position_0.getSubtracted(position_1).getMultiplied(positionFollowSpeed));
        position_0.add(velocity);
        brush.beginPath();
        brush.moveTo(position_0.x, position_0.y);
        brush.lineTo(position_1.x, position_1.y);
        brush.stroke();
    }
    requestAnimationFrame(update);
}
update();
