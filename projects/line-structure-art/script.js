//-------------------------------------------
//
// A very ugly sketch, please don't read it pls
//
//-------------------------------------------

const HUE_ADJUSTMENT = 0.005;
const CIRCLE_VELOCITY = 3;
const RADIUS = 6;

var currentHue;
var circles;

function getNewCircle(isFirst = false) {
    let angle = random(TWO_PI);
    let amp = random(width * 0.6, width * 0.9);
    let p = createVector(
        isFirst ? 0 : cos(angle) * amp,
        isFirst ? 0 : sin(angle) * amp
    );
    return {
        h: currentHue,
        p: p,
        e: true,
        v: p5.Vector.div(p5.Vector.mult(p, -10), amp),
        nodes: []
    };
}

function setup() {
    createCanvas(1425, 1425);
    colorMode(HSB, 100, 100, 100);
    background(100);

    currentHue = random(100);
    circles = [getNewCircle(true)];
}

function draw() {
    translate(width * 0.5, height * 0.5);
    circles.push(getNewCircle());
    currentHue += HUE_ADJUSTMENT;
    if (currentHue >= 100) currentHue -= 100;
    let newlyFreezedCircles = [];
    for (let i = 0; i < 60; i++) {
        for (let a = 0; a < circles.length; a++) {
            let c = circles[a];
            if (c.e) {
                for (let b = 0; b < circles.length; b++) {
                    if (b == a) continue;
                    let c1 = circles[b];
                    let n = p5.Vector.sub(c1.p, c.p);
                    n.normalize();
                    let o = RADIUS * 2 - p5.Vector.dist(p5.Vector.add(c.p, c.v), c1.p);
                    if (o > 0) {
                        c.p.add(p5.Vector.mult(p5.Vector.mult(n, -1), o));
                        c.p.add(c.v);
                        c.e = false;
                        c1.e = false;
                        c.v = createVector();
                        c1.v = createVector();
                        c.nodes.push(c1);
                        newlyFreezedCircles.push(c);
                    }
                }
                c.p.add(c.v);
            }
        }
    }
    for (let a = 0; a < newlyFreezedCircles.length; a++) {
        let c = newlyFreezedCircles[a];
        for (let b = 0; b < c.nodes.length; b++) {
            strokeWeight(2);
            stroke(c.h, 100, 100);
            line(c.p.x, c.p.y, c.nodes[b].p.x, c.nodes[b].p.y);
        }
    }
}