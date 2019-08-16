const NUMBER_OF_FREQUENCIES = 15;
const NUMBER_OF_POINTS = 500;
const SCALE_X = 400;
const SCALE_Y = 10;
const BALL_SIZE = 10;

//-----------------------------------------

let canvas = document.getElementById("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;
addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

let brush = canvas.getContext("2d");

//-----------------------------------------

let frequencies = new Array(NUMBER_OF_FREQUENCIES);
let amplitudes = new Array(NUMBER_OF_FREQUENCIES);
let phases = new Array(NUMBER_OF_FREQUENCIES);

for (let a = 0; a < NUMBER_OF_FREQUENCIES; a++) {
    frequencies[a] = Math.random();
    frequencies[a] *= frequencies[a]*frequencies[a]*Math.PI*2/SCALE_X;

    amplitudes[a] = Math.random()*SCALE_Y/(frequencies[a]*10 + 0.1);

    phases[a] = Math.random()*Math.PI*2;
}

function getValue(p_x) {
    let sum = 0;
    for (let a = 0; a < NUMBER_OF_FREQUENCIES; a++) {
        sum += amplitudes[a]*Math.cos(frequencies[a]*p_x + phases[a]);
    }
    return sum;
}
function getDerivative(p_x) {
    let sum = 0;
    for (let a = 0; a < NUMBER_OF_FREQUENCIES; a++) {
        sum += -frequencies[a]*amplitudes[a]*Math.sin(frequencies[a]*p_x + phases[a]);
    }
    return sum;
}

let velocity = 0;
let position = 0;

function update() {
    brush.clearRect(0, 0, canvas.width, canvas.height);
    
    let derivative = getDerivative(position);
    velocity -= derivative;
    velocity *= 0.96;
    // velocity += Math.sqrt(derivative*velocity;

    position += velocity;

    brush.fillStyle = "black";
    brush.beginPath();
    brush.arc(canvas.width*0.5 + position, canvas.height*0.5 - getValue(position) - BALL_SIZE, BALL_SIZE, 0, Math.PI*2);
    brush.fill();

    brush.strokeStyle = "black";
    brush.beginPath();
    brush.moveTo(0, canvas.height*0.5 - getValue(0 - canvas.width*0.5));
    for (let a = 1; a <= NUMBER_OF_POINTS; a++) {
        brush.lineTo(a*canvas.width/NUMBER_OF_POINTS, canvas.height*0.5 - getValue(a*canvas.width/NUMBER_OF_POINTS - canvas.width*0.5));
    }
    brush.stroke();

    requestAnimationFrame(update);
}
update();