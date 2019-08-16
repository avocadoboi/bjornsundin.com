Physical.World = class {
    constructor() {
        this.bodies = [];
        this.gravity = new Physical.Vector();

        // How many steps that represent one second.
        this.updatesPerSecond = 60;

        // How many pixels one meter is.
        this.pixelsPerMeter = 120;

        this.numberOfIterations = 5;
    }
    addBody(body) {
        body.world = this;
        body.position.set(body.position.getDivided(this.pixelsPerMeter));
        if (body.type == "Rectangle")
            body.size_meters = body.size.getDivided(this.pixelsPerMeter);
        else if (body.type == "Circle")
            body.radius_meters = body.radius / this.pixelsPerMeter;
        this.bodies.push(body);
    }
    removeBody(body) {
        if (typeof body == "number")
            this.bodies.splice(body, 1);
        else
            this.bodies.splice(this.bodies.indexOf(body), 1);
    }
    update() {
        // Apply gravity and update velocity & position.
        for (var a = 0; a < this.bodies.length; a++) {
            if (!this.bodies[a].isStatic) {
                var body = this.bodies[a];
                body.updateArea();
                body.applyForce(this.gravity.getMultiplied(body.getMass()));
                body.position.add(body.velocity_metersPerSecond.getDivided(this.updatesPerSecond));
                body.rotation += body.angularVelocity / (this.updatesPerSecond);
            }
        }

        // Broad phase
        var pairs = [];
        var AABB_a;
        var AABB_b;
        for (var a = 0; a < this.bodies.length; a++) {
            for (var b = a + 1; b < this.bodies.length; b++) {
                if (!this.bodies[a].isStatic || !this.bodies[b].isStatic) {
                    AABB_a = this.bodies[a].getBounds();
                    AABB_b = this.bodies[b].getBounds();
                    if (AABB_b.right > AABB_a.left && AABB_b.left < AABB_a.right &&
                        AABB_b.bottom > AABB_a.top && AABB_b.top < AABB_a.bottom) {
                        pairs.push(this.bodies[a], this.bodies[b]);
                    }
                }
            }
        }

        // Narrow phase
        for (var a = 0; a < this.numberOfIterations; a++) {
            for (var b = 0; b < pairs.length - 1; b += 2) {
                Physical.Bodies.Body.updateCollision(pairs[b], pairs[b + 1]);
            }
        }

        // Update pixel position
        for (var a = 0; a < this.bodies.length; a++) {
            this.bodies[a].position.set(this.bodies[a].position.getMultiplied(this.pixelsPerMeter));
        }
    }
}   