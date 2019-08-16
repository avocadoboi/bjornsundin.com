var canvas = document.createElement("canvas"); document.body.appendChild(canvas);
var brush = canvas.getContext("2d");
// How many seconds in the simulation one real life second is.
var simulationSpeed = 1;
var frameRate = 60;
// This is extremely big compared to real G,
// this is because a computer can't really hold
// the mass needed for any movement with real G.
// Just look at the mass of the earth.
var G = 6.67408 / 10000;
var metersPerPixel = 40;
var frameCount = 0;

class Vector2 {
    constructor(a, b) {
        if (typeof b != "undefined")
            this.x = a, this.y = b;
        else if (typeof a != "undefined")
            this.x = a.x, this.y = a.y;
        else this.x = 0, this.y = 0;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    add(x, y) {
        this.x += x;
        this.y += y;
    }
    subtract(x, y) {
        this.x -= x;
        this.y -= y;
    }
    getDivided(divisor) {
        return new Vector2(this.x / divisor, this.y / divisor);
    }
    getMultiplied(factor) {
        return new Vector2(this.x * factor, this.y * factor);
    }
    getSubtracted(x, y) {
        return new Vector2(this.x - x, this.y - y);
    }
    static getDistanceSquared(a, b) {
        return Math.abs((a.x - b.x) * (a.x - b.x)) + Math.abs((a.y - b.y) * (a.y - b.y));
    }
    static getDistance(a, b) {
        return Math.sqrt(Vector2.getDistanceSquared(a, b));
    }
}

window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}; window.onresize();

var lastTouchPosition = new Vector2(0, 0);
var mousePosition = new Vector2(0, 0);
var mouseMovement = new Vector2(0, 0);
var isMouseButtonDown;
var isLeftPressed, isRightPressed, isUpPressed, isDownPressed;
var cameraPosition = new Vector2(0, 0);
window.onmousedown = function () {
    isMouseButtonDown = true;
}
window.onmouseup = function () {
    isMouseButtonDown = false;
}
window.ontouchstart = function (event) {
    isMouseButtonDown = true;
    mousePosition.set(event.touches[0].pageX, event.touches[0].pageY);
    lastTouchPosition.set(mousePosition.x, mousePosition.y);
}
window.ontouchend = function () {
    isMouseButtonDown = false;
}
document.onmousemove = function (event) {
    mousePosition.set(event.pageX, event.pageY);
    mouseMovement.add(event.movementX, event.movementY);
}
window.ontouchmove = function (event) {
    mousePosition.set(event.touches[0].pageX, event.touches[0].pageY);
    mouseMovement.add(mousePosition.x - lastTouchPosition.x, mousePosition.y - lastTouchPosition.y);
    lastTouchPosition.set(mousePosition.x, mousePosition.y);
}
window.onkeydown = function (event) {
    switch (event.keyCode) {
        case 37://left
            isLeftPressed = true;
            break;
        case 39://right
            isRightPressed = true;
            break;
        case 38://up
            isUpPressed = true;
            break;
        case 40://down
            isDownPressed = true;
            break;
    }
}
window.onkeyup = function (event) {
    switch (event.keyCode) {
        case 37://left
            isLeftPressed = false;
            break;
        case 39://right
            isRightPressed = false;
            break;
        case 38://up
            isUpPressed = false;
            break;
        case 40://down
            isDownPressed = false;
            break;
    }
}

class Mass {
    constructor(x_pixels, y_pixels, radius_pixels) {
        this.position_pixels = new Vector2(x_pixels, y_pixels);
        this.position_meters = new Vector2(x_pixels * metersPerPixel, y_pixels * metersPerPixel);
        this.velocity_metersPerSecond = new Vector2(0, 0);
        this.radius_pixels = radius_pixels;
        this.radius_meters = radius_pixels * metersPerPixel;
        this.density_kilosPerMeterCubed = 40;
        this.mass_kilos = 0;
        this.updateMass();

        this.color = "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 70%)";
    }
    applyForce(x, y) {
        this.velocity_metersPerSecond.add(x / this.mass_kilos, y / this.mass_kilos);
    }
    addMass(mass) {
        this.radius_meters = Math.cbrt((this.mass_kilos + mass) / (this.density_kilosPerMeterCubed * Math.PI * (4 / 3)));
        this.radius_pixels = this.radius_meters / metersPerPixel;
        this.updateMass();
    }
    updatePosition() {
        this.position_meters.add(this.velocity_metersPerSecond.x * simulationSpeed / frameRate, this.velocity_metersPerSecond.y * simulationSpeed / frameRate);
        this.position_pixels.set(this.position_meters.x / metersPerPixel, this.position_meters.y / metersPerPixel);
    }
    updateMass() {
        this.mass_kilos = 4 / 3 * this.radius_meters * this.radius_meters * this.radius_meters * Math.PI * this.density_kilosPerMeterCubed;
    }
    draw() {
        brush.beginPath();
        brush.arc(this.position_pixels.x - cameraPosition.x, this.position_pixels.y - cameraPosition.y, this.radius_pixels, 0, Math.PI * 2);
        brush.fillStyle = this.color;
        brush.fill();
    }
}
var masses = [];

function update() {
    if (isMouseButtonDown && frameCount % 2 == 0) {
        masses.push(new Mass(mousePosition.x + cameraPosition.x + Math.random() * 100 - 50, mousePosition.y + cameraPosition.y + Math.random() * 100 - 50, Math.random() * 10 + 0.5))
        masses[masses.length - 1].velocity_metersPerSecond.set(mouseMovement.x * 80, mouseMovement.y * 80);
    }
    if (isLeftPressed)
        cameraPosition.x -= 5;
    if (isRightPressed)
        cameraPosition.x += 5;
    if (isUpPressed)
        cameraPosition.y -= 5;
    if (isDownPressed)
        cameraPosition.y += 5;

    brush.clearRect(0, 0, canvas.width, canvas.height);
    for (var a = 0; a < masses.length; a++) {
        var mass_a = masses[a];
        var mass_a_wasRemoved = false;
        if (
            mass_a.position_pixels.x < cameraPosition.x - mass_a.radius_pixels - 400 ||
            mass_a.position_pixels.x > cameraPosition.x + canvas.width + mass_a.radius_pixels + 400 ||
            mass_a.position_pixels.y < cameraPosition.y - mass_a.radius_pixels - 400 ||
            mass_a.position_pixels.y > cameraPosition.y + canvas.height + mass_a.radius_pixels + 400
        ) {
            masses.splice(a, 1);
            a--;
            continue;
        }
        for (var b = a + 1; b < masses.length; b++) {
            var mass_b = masses[b];
            var distance = Vector2.getDistance(mass_a.position_meters, mass_b.position_meters);
            var force;
            if (distance < mass_a.radius_meters + mass_b.radius_meters) {
                if (mass_a.mass_kilos > mass_b.mass_kilos) {
                    force = mass_b.velocity_metersPerSecond.getMultiplied(mass_b.mass_kilos);
                    mass_a.applyForce(force.x, force.y);
                    mass_a.addMass(mass_b.mass_kilos);
                    masses.splice(b, 1);
                    if (b < a) a--;
                    b--;
                    continue;
                }
                else {
                    force = mass_a.velocity_metersPerSecond.getMultiplied(mass_a.mass_kilos);
                    mass_b.applyForce(force.x, force.y);
                    mass_b.addMass(mass_a.mass_kilos);
                    masses.splice(a, 1);
                    a--;
                    mass_a_wasRemoved = true;
                    break;
                }
            }
            force = mass_b.position_meters.getSubtracted(mass_a.position_meters.x, mass_a.position_meters.y).getMultiplied(1 / distance * (G * mass_a.mass_kilos * mass_b.mass_kilos / (distance * distance)));
            mass_a.applyForce(force.x, force.y);
            mass_b.applyForce(-force.x, -force.y);
        }
        if (!mass_a_wasRemoved) {
            mass_a.updatePosition();
            mass_a.draw();
        }
    }

    mouseMovement.set(0, 0);
    frameCount++;
} setInterval(update, 1000 / frameRate);