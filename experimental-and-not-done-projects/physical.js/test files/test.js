var world,
    particles = [],
    boundaries = [],
    particleAddFrequency = 80;
class Particle {
    constructor() {
        this.body = new Physical.Bodies.Circle(mouseX || 100, mouseY || 100, random(10, 40));
        world.addBody(this.body);
        this.hue = random(360);
    }
    getIsOffScreen() {
        return false;
        // return (
        //     this.body.position.x < -this.body.size.x || this.body.position.x > width + this.body.size.x ||
        //     this.body.position.y < -this.body.size.y || this.body.position.y > height + this.body.size.y
        // );
    }
    draw() {
        push();
        noFill();
        fill(this.hue, 255, 255);
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.rotation);
        ellipse(0, 0, this.body.radius * 2);
        pop();
    }
}

class Boundary {
    constructor(x, y, w, h) {
        this.body = new Physical.Bodies.Rectangle(x, y, w, h);
        this.body.isStatic = true;
        world.addBody(this.body);
    }
    draw() {
        noStroke();
        fill(200, 200, 200);
        rect(this.body.position.x, this.body.position.y, this.body.size.x, this.body.size.y);
    }
}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
    rectMode(CENTER);
    strokeWeight(1);

    world = new Physical.World()
    world.gravity.y = 9.8;
    world.gravity.x = 0;

    boundaries.push(new Boundary(0, height / 2, 100, height));
    boundaries.push(new Boundary(width, height / 2, 100, height));
    boundaries.push(new Boundary(width / 2, 0, width, 100));
    boundaries.push(new Boundary(width / 2, height, width, 100));
    boundaries.push(new Boundary(width / 2, height / 2, width * 0.7, 100));

    for (var a = 0; a < 10; a++)
        boundaries.push(new Boundary(random(width), random(height), random(5, 200), random(5, 200)));

    particles.push(new Particle());
}

function draw() {
    if (mouseIsPressed && frameCount % 5 == 0)
        particles.push(new Particle())

    particles[0].body.velocity_metersPerSecond.set((mouseX - particles[0].body.position.x) * 6 / world.pixelsPerMeter, (mouseY - particles[0].body.position.y) * 6 / world.pixelsPerMeter);

    world.update();

    background(0, 0, 0);
    for (var a = 0; a < particles.length; a++) {
        particles[a].draw();
        if (particles[a].getIsOffScreen()) {
            world.removeBody(particles[a].body);
            particles.splice(a, 1);
            a--;
        }
    }
    for (var a = 0; a < boundaries.length; a++)
        boundaries[a].draw();
}

// // for (var a = 0; a < world.bodies.length; a++) {
// //     if (world.bodies[a].type == "Circle")
// //         ellipse(
// //             world.bodies[a].position.x, world.bodies[a].position.y,
// //             world.bodies[a].radius * 2, world.bodies[a].radius * 2
// //         );
// //     else if (world.bodies[a].type == "Rectangle")
// //         rect(
// //             world.bodies[a].position.x, world.bodies[a].position.y,
// //             world.bodies[a].size.x, world.bodies[a].size.y
// //         );
// // }