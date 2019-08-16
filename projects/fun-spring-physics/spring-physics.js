// Constants

const PARAMETERS_PANEL_WIDTH = 300;
const PIXELS_PER_METER = 250;
const GRAB_RADIUS = 20;

//==================================================================================================================
// Global variables

var canvas = document.getElementById("canvas");
var brush = canvas.getContext("2d");

var mousePosition = new Vector();
var draggedPointIndex = -1;

var points = [];
var springs = [];

//==================================================================================================================
// Parameters

var parameters = {};
parameters["Spring stiffness"] = 0.5;
parameters["Spring friction"] = 0.4;
parameters["Joint friction"] = 0.1;
parameters["Surface friction"] = 0.1;
parameters["Gravity"] = 0;
parameters["Color"] = "#f90089";

var parametersPanel = QuickSettings.create(10, 10, "Parameters");
parametersPanel.setWidth(PARAMETERS_PANEL_WIDTH);
parametersPanel.setDraggable(false);
parametersPanel.setCollapsible(false);
parametersPanel._panel.style.boxShadow = "0px 1px 4px 0px gray";

parametersPanel.bindRange("Spring stiffness", 0.001, 1, parameters["Spring stiffness"], 0.001, parameters);
parametersPanel.bindRange("Spring friction", 0, 1, parameters["Spring friction"], 0.001, parameters);
parametersPanel.bindRange("Joint friction", 0, 0.2, parameters["Joint friction"], 0.001, parameters);
parametersPanel.bindRange("Surface friction", 0, 1, parameters["Surface friction"], 0.001, parameters);
parametersPanel.bindRange("Gravity", 0, 20, parameters["Gravity"], 0.1, parameters);
parametersPanel.bindColor("Color", parameters["Color"], parameters);
parametersPanel.addButton("Clear points", function () { points = []; springs = []; });

//==================================================================================================================

class Point {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector();
        this.force = new Vector();
        this.frictionForce = new Vector();

        this.isDragged = false;
    }

    //==================================================================================================================

    update() {
        if (this.isDragged) {
            this.position.set(mousePosition);
            this.velocity.set(0);
            this.force.set(0);
            this.frictionForce.set(0);
        }
        else {
            this.velocity.add(this.frictionForce);
            this.frictionForce.set(0);

            this.velocity.add(this.force);
            this.force.set(0);

            this.position.add(this.velocity);

            this.force.y += parameters["Gravity"] * PIXELS_PER_METER / (60 * 60);
        }

        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = 0;
            this.velocity.y *= 1 - parameters["Surface friction"];
        }
        else if (this.position.x > canvas.width) {
            this.position.x = canvas.width;
            this.velocity.x = 0;
            this.velocity.y *= 1 - parameters["Surface friction"];
        }

        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.velocity.x *= 1 - parameters["Surface friction"];
        }
        else if (this.position.y > canvas.height) {
            this.position.y = canvas.height;
            this.velocity.y = 0;
            this.velocity.x *= 1 - parameters["Surface friction"];
        }
    }
};

class Spring {
    constructor(point_0, point_1) {
        this.point_0 = point_0;
        this.point_1 = point_1;
        this.targetLength = Vector.getDistance(point_0.position, point_1.position);
    }

    //==================================================================================================================

    update() {
        let delta = this.point_1.position.getSubtracted(this.point_0.position);
        let distance = delta.getLength();
        let normalized;
        if (distance > 0) {
            normalized = delta.getDivided(distance);
        }
        else {
            normalized = new Vector(0, 1);
        }
        let normalizedNormal = normalized.getNormal(false);
        let force = normalized.getMultiplied((distance - this.targetLength) * parameters["Spring stiffness"] / (points.length - 1) * 4);
        let relativeVelocity = this.point_1.velocity.getSubtracted(this.point_0.velocity);

        // Add forces
        this.point_0.force.add(force.getMultiplied(0.5));
        this.point_1.force.add(force.getMultiplied(-0.5));

        // Add spring friction
        this.point_0.frictionForce.add(normalized.getMultiplied(parameters["Spring friction"] * Vector.getDotProduct(normalized, relativeVelocity) / (points.length - 1)));
        this.point_1.frictionForce.add(normalized.getMultiplied(-parameters["Spring friction"] * Vector.getDotProduct(normalized, relativeVelocity) / (points.length - 1)));

        // Add joint friction
        this.point_0.frictionForce.add(normalizedNormal.getMultiplied(0.5 * parameters["Joint friction"] * Vector.getDotProduct(normalizedNormal, relativeVelocity) / (points.length - 1)));
        this.point_1.frictionForce.add(normalizedNormal.getMultiplied(-0.5 * parameters["Joint friction"] * Vector.getDotProduct(normalizedNormal, relativeVelocity) / (points.length - 1)));
    }
}; var springs = [];

//==================================================================================================================
// Events

onresize = function () {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    parametersPanel.setPosition(innerWidth - PARAMETERS_PANEL_WIDTH - 10, 10);
}; onresize();

oncontextmenu = function (event) {
    if (event.button == 2) {
        return false;
    }
}

onpointerup = function (event) {
    if (event.button == 2) {
        points.push(new Point(event.pageX, event.pageY));
        for (let a = 0; a < points.length - 1; a++) {
            springs.push(new Spring(points[a], points[points.length - 1]));
        }
    }
    else if (draggedPointIndex > -1) {
        points[draggedPointIndex].isDragged = false;
        draggedPointIndex = -1;
    }
}

onpointerdown = function (event) {
    if (event.button == 0) {
        for (let a = 0; a < points.length; a++) {
            if (Vector.getDistance(points[a].position, event.pageX, event.pageY) < GRAB_RADIUS) {
                points[a].isDragged = true;
                draggedPointIndex = a;
                break;
            }
        }
    }
}

onmousemove = function (event) {
    mousePosition.set(event.pageX, event.pageY);
}

//==================================================================================================================

function update() {
    for (let a = 0; a < springs.length; a++) {
        springs[a].update();
    }
    for (let a = 0; a < points.length; a++) {
        points[a].update();
    }

    //==================================================================================================================

    brush.clearRect(0, 0, canvas.width, canvas.height);

    brush.font = "40px Arial";
    brush.textAlign = "center";
    brush.fillStyle = "#ccc";
    brush.fillText("Right click to add points.", canvas.width * 0.5, canvas.height * 0.5 - 25);
    brush.fillText("Left click and drag on a vertex to drag jelly.", canvas.width * 0.5, canvas.height * 0.5 + 25)

    // Jelly polygon
    brush.beginPath();
    for (let a = 0; a < points.length; a++) {
        if (a == 0) {
            brush.moveTo(points[a].position.x, points[a].position.y);
        }
        else {
            brush.lineTo(points[a].position.x, points[a].position.y);
        }
    }
    brush.closePath();

    brush.fillStyle = parameters["Color"];
    brush.fill();

    //==================================================================================================================

    requestAnimationFrame(update);
}; update();