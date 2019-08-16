const POINT_SPACING = 350;
const POINT_RADIUS = 4;
const CONTROL_RADIUS = 7;
const CONTROL_STRENGTH = 3;
const CURVE_DETAIL = 200;
const CURVE_ORDER = 2;

//-------------------

let input_order = document.getElementById("input_order");
input_order.min = 1;
input_order.max = 5;
input_order.value = CURVE_ORDER.toString();
input_order.onchange = draw;

let input_controlStrength = document.getElementById("input_controlStrength");
input_controlStrength.min = 0.5;
input_controlStrength.max = 15;
input_controlStrength.value = CONTROL_STRENGTH.toString();
input_controlStrength.onchange = draw;

//-------------------

let pointPosition_0 = new Vector(-POINT_SPACING * 0.5, 0);
let pointPosition_1 = new Vector(POINT_SPACING * 0.5, 0);
let controlPosition_0 = new Vector(-POINT_SPACING * 0.5, 100);
let controlPosition_1 = new Vector(POINT_SPACING * 0.5, -100);
let draggedControl = null;

//-------------------

function draw() {
    push();

    //-------------------

    translate(width * 0.5, height * 0.5);

    background(220, 220, 220);

    //-------------------

    strokeWeight(1);
    stroke(190, 190, 190);
    line(pointPosition_0.x, pointPosition_0.y, controlPosition_0.x, controlPosition_0.y);
    line(pointPosition_1.x, pointPosition_1.y, controlPosition_1.x, controlPosition_1.y);

    fill(30, 30, 30);
    ellipse(pointPosition_0.x, pointPosition_0.y, POINT_RADIUS * 2);
    ellipse(pointPosition_1.x, pointPosition_1.y, POINT_RADIUS * 2);

    //-------------------

    stroke(0, 0, 0);
    strokeWeight(2);

    let delta_0 = controlPosition_0.getSubtracted(pointPosition_0).getMultiplied(input_controlStrength.value);
    let delta_1 = controlPosition_1.getSubtracted(pointPosition_1).getMultiplied(input_controlStrength.value);
    let step = 1.0 / CURVE_DETAIL;
    let lastPosition;
    for (let t = 0; t <= 1; t += step) {
        //let position = pointPosition_0.getAdded(delta_0.getMultiplied(t)).getMultiplied(pow(1 - t, input_order.value))
        //    .getAdded(pointPosition_1.getAdded(delta_1.getMultiplied(1 - t)).getMultiplied(pow(t, input_order.value)));
        let part_0 = (1 - t) * (1 - t) * (1 - t);
        let part_1 = 3 * t * (1 - t) * (1 - t);
        let part_2 = 3 * t * t * (1 - t);
        let part_3 = t * t * t;
        let position = new Vector(
            pointPosition_0.x*part_0 + controlPosition_0.x*part_1 + controlPosition_1.x*part_2 + pointPosition_1.x*part_3,
            pointPosition_0.y*part_0 + controlPosition_0.y*part_1 + controlPosition_1.y*part_2 + pointPosition_1.y*part_3
        );
        // p0 + tp1 - tp0 + tp1 + ttp2 - ttp1 - tp0 - ttp1 + ttp0 +
        // tp1 + ttp2 - ttp1 + ttp2 + tttp3 - tttp2 - ttp1 - tttp2 + tttp1 -
        // tp0 - ttp1 + ttp0 - ttp1 - tttp2 + tttp1 + ttp0 + tttp1 - tttp0 =

        // p0(1 - t)^3 +
        // p1(3t(1 - t)^2) +
        // p2(3t^2(1 - t)) + 
        // p3(t^3)
        if (lastPosition) {
            line(lastPosition.x, lastPosition.y, position.x, position.y);
        }
        lastPosition = position;
    }
    line(lastPosition.x, lastPosition.y, pointPosition_1.x, pointPosition_1.y);

    //-------------------

    fill(100, 100, 100);
    stroke(0, 0, 0);
    strokeWeight(0.5);
    ellipse(controlPosition_0.x, controlPosition_0.y, CONTROL_RADIUS * 2);
    ellipse(controlPosition_1.x, controlPosition_1.y, CONTROL_RADIUS * 2);

    pop();
}

//-------------------

function getIsMouseInside(p_controlPosition) {
    return p_controlPosition.getDistanceSquared(mouseX - width * 0.5, mouseY - height * 0.5) < CONTROL_RADIUS * CONTROL_RADIUS;
}

function mouseMoved() {
    if (getIsMouseInside(controlPosition_0) ||
        getIsMouseInside(controlPosition_1)) {
        document.body.style.cursor = "grab";
    }
    else {
        document.body.style.cursor = "default";
    }

}
function mouseDragged() {
    if (draggedControl != null) {
        document.body.style.cursor = "grabbing";
        draggedControl.add(mouseX - pmouseX, mouseY - pmouseY);
        draw();
    }
    pmouseX = mouseX;
    pmouseY = mouseY;
}

function mousePressed() {
    if (getIsMouseInside(controlPosition_0)) {
        draggedControl = controlPosition_0;
        document.body.style.cursor = "grabbing";
    }
    else if (getIsMouseInside(controlPosition_1)) {
        draggedControl = controlPosition_1;
        document.body.style.cursor = "grabbing";
    }
    pmouseX = mouseX;
    pmouseY = mouseY;
}
function mouseReleased() {
    draggedControl = null;
}

//-------------------

function setup() {
    createCanvas(innerWidth, innerHeight);
    noLoop();
}
function windowResized() {
    resizeCanvas(innerWidth, innerHeight);
    draw();
}
