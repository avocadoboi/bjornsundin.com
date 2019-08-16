const PLUPP_RADIUS = 15;
const PLUPP_COLOR = "rgb(255, 100, 190)";

const GRID_SIZE = 10;
const CURVE_DETAIL = 150;

const ANIMATED_RECTANGLE_WIDTH = 70;
const ANIMATED_RECTANGLE_HEIGHT = 10;

//-----------------------------
// Canvas

let canvas = document.getElementById("canvas");
let width = canvas.width - PLUPP_RADIUS * 2;
let height = canvas.height - PLUPP_RADIUS * 2;

let brush = canvas.getContext("2d");

//-----------------------------

let cubicBezierText = document.getElementById("cubicBezierText");

//-----------------------------
// Curve points

let point_0 = new Vector(0, height);
let point_1 = new Vector(width, 0);
let draggedPoint = -1;

function handlePointerDown(p_x, p_y) {
    let rect = canvas.getBoundingClientRect();
    let x = p_x - rect.x - PLUPP_RADIUS;
    let y = p_y - rect.y - PLUPP_RADIUS;

    if ((x - point_0.x)*(x - point_0.x) + (y - point_0.y)*(y - point_0.y) < PLUPP_RADIUS*PLUPP_RADIUS) {
        draggedPoint = 0;
        document.body.style.cursor = "grabbing";        
    }
    else if ((x - point_1.x)*(x - point_1.x) + (y - point_1.y)*(y - point_1.y) < PLUPP_RADIUS*PLUPP_RADIUS) {
        draggedPoint = 1;
        document.body.style.cursor = "grabbing";        
    }
}
addEventListener("touchstart", (p_event)=> {
    handlePointerDown(p_event.touches[0].clientX, p_event.touches[0].clientY);
    p_event.preventDefault();
});
addEventListener("mousedown", (p_event) => {
    handlePointerDown(p_event.x, p_event.y);
});

addEventListener("touchend", (p_event)=> {
    draggedPoint = -1;
    p_event.preventDefault();
});
addEventListener("mouseup", () => {
    draggedPoint = -1;
});

function handlePointerMove(p_x, p_y){
    function updatePoint(p_point){
        let rect = canvas.getBoundingClientRect();
        p_point.x = p_x - rect.x - PLUPP_RADIUS;
        p_point.y = p_y - rect.y - PLUPP_RADIUS;

        if (p_point.x < 0){
            p_point.x = 0;
        }
        if (p_point.x > width){
            p_point.x = width;
        }
        if (p_point.y < 0){
            p_point.y = 0;
        }
        if (p_point.y > height){
            p_point.y = height;
        }
        drawCurve();
    }
    
    if (draggedPoint == 0) {
        updatePoint(point_0);
        document.body.style.cursor = "grabbing";
    }
    else if (draggedPoint == 1) {
        updatePoint(point_1);
        document.body.style.cursor = "grabbing";
    }
    else {
        let rect = canvas.getBoundingClientRect();
        let x = p_x - rect.x - PLUPP_RADIUS;
        let y = p_y - rect.y - PLUPP_RADIUS;
        if ((x - point_0.x)*(x - point_0.x) + (y - point_0.y)*(y - point_0.y) < PLUPP_RADIUS*PLUPP_RADIUS || 
            (x - point_1.x)*(x - point_1.x) + (y - point_1.y)*(y - point_1.y) < PLUPP_RADIUS*PLUPP_RADIUS) 
        {
            document.body.style.cursor = "grab";
        }
        else {
            document.body.style.cursor = "default";
        }
    }

    cubicBezierText.innerHTML = "cubic-bezier(" + Math.round(point_0.x/width*100)/100 + ", " + Math.round(100-point_0.y/height*100)/100 + ", " + Math.round(point_1.x/width*100)/100 + ", " + Math.round(100-point_1.y/height*100)/100 + ")";
}
addEventListener("touchmove", (p_event) => {
    handlePointerMove(p_event.touches[0].clientX, p_event.touches[0].clientY);
    p_event.preventDefault();
});
addEventListener("mousemove", (p_event) => {
    handlePointerMove(p_event.x, p_event.y);
});

//-----------------------------

// I didn't really need to do this for this site but i know i'll want to write this algorithm
// in c++ later for other projects so why not do it now when it's easier to debug

// It uses newton's method to converge on the root of f(t) = x
function getEasedValue(p_x0, p_y0, p_x1, p_y1, p_targetX, p_precision = 0.001) {
    if (p_targetX == 0)  {
        return 0;
    }
    if (p_targetX == 1) {
        return 1;
    }

    let t;
    if (!p_x0 && !p_x1) {
        t = Math.pow(p_targetX, 1/3);
    }
    else {   
        t = p_targetX < 0.5 ? 0.25 : 0.75;
        
        let error = 1;
        while (Math.abs(error) > p_precision) {
            error = p_targetX - t*((1-t)*(3*(1-t)*p_x0 + 3*t*p_x1) + t*t);
            t += error / (p_x0*(3 - 12*t + 9*t*t) + p_x1*(6*t - 9*t*t) + 3*t*t);
        }
    }
        
    return t*((1-t)*(3*(1-t)*p_y0 + 3*t*p_y1) + t*t);
}

//-----------------------------

function drawCurve() {
    brush.clearRect(0, 0, canvas.width, canvas.height);

    //-----------------------------
    // Grid

    brush.strokeStyle = "rgb(200, 200, 200)";
    brush.lineWidth = 1;
    for (let a = 0; a <= GRID_SIZE; a++){
        brush.beginPath();
        brush.moveTo(PLUPP_RADIUS, PLUPP_RADIUS + height*a/GRID_SIZE);
        brush.lineTo(PLUPP_RADIUS + width, PLUPP_RADIUS + height*a/GRID_SIZE);
        brush.stroke();

        brush.beginPath();
        brush.moveTo(PLUPP_RADIUS + width*a/GRID_SIZE, PLUPP_RADIUS);
        brush.lineTo(PLUPP_RADIUS + width*a/GRID_SIZE, PLUPP_RADIUS + height);
        brush.stroke();
    }

    //-----------------------------
    // Lines    

    brush.lineWidth = 3;
    brush.strokeStyle = "rgb(170, 170, 170";
    brush.beginPath();
    brush.moveTo(PLUPP_RADIUS, PLUPP_RADIUS + height);
    brush.lineTo(PLUPP_RADIUS + point_0.x, PLUPP_RADIUS + point_0.y);
    brush.stroke();

    brush.beginPath();
    brush.moveTo(PLUPP_RADIUS + width, PLUPP_RADIUS);
    brush.lineTo(PLUPP_RADIUS + point_1.x, PLUPP_RADIUS + point_1.y);
    brush.stroke();

    //-----------------------------
    // Curve

    brush.lineWidth = 3;
    brush.strokeStyle = "rgb(80, 80, 80)";
    brush.beginPath();
    for (let a = 0; a <= CURVE_DETAIL; a++) {
        let t = a / CURVE_DETAIL;
        let x = PLUPP_RADIUS + t*width;
        let y = PLUPP_RADIUS + height - getEasedValue(point_0.x/width, 1-point_0.y/height, point_1.x/width, 1-point_1.y/height, t)*height;
        if (a == 0){
            brush.moveTo(x, y);
        }
        else {
            brush.lineTo(x, y);
        }
    }
    brush.stroke();
    
    //-----------------------------
    // Plupps
    
    brush.fillStyle = PLUPP_COLOR;
    brush.beginPath();
    brush.arc(point_0.x + PLUPP_RADIUS, point_0.y + PLUPP_RADIUS, PLUPP_RADIUS, 0, Math.PI*2);
    brush.fill();

    brush.beginPath();
    brush.arc(point_1.x + PLUPP_RADIUS, point_1.y + PLUPP_RADIUS, PLUPP_RADIUS, 0, Math.PI*2);
    brush.fill();
}
drawCurve();

//-----------------------------
// The lil animation thing

let animationCanvas = document.getElementById("animationCanvas");
let animationBrush = animationCanvas.getContext("2d");

let animationProgress = 1;
let animationDirection = -1;

function updateAnimation() {
    animationBrush.clearRect(0, 0, animationCanvas.width, animationCanvas.height);

    let value = getEasedValue(point_0.x/width, 1-point_0.y/height, point_1.x/width, 1-point_1.y/height, animationProgress)*animationDirection + (animationDirection == -1);
    
    animationBrush.fillStyle = "rgb(20, 200, 170)";
    animationBrush.fillRect(value*(animationCanvas.width - ANIMATED_RECTANGLE_WIDTH - 20) + 10, animationCanvas.height*0.5 - ANIMATED_RECTANGLE_HEIGHT*0.5, ANIMATED_RECTANGLE_WIDTH, ANIMATED_RECTANGLE_HEIGHT);
    
    //-----------------------------

    animationProgress += 0.03;
    if (animationProgress >= 1) animationProgress = 1;

    //-----------------------------
    
    requestAnimationFrame(updateAnimation);
}
updateAnimation();

addEventListener("touchend", (p_event) => {
    animationProgress = 0;
    animationDirection *= -1;
    p_event.preventDefault();
});
addEventListener("mouseup", () => {
    animationProgress = 0;
    animationDirection *= -1;
});
