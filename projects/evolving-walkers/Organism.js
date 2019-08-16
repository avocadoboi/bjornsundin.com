function Organism() {
    // A bunch of PhysicalPoints, defining the current shape.
    this.points = [];

    // These springs act like muscles too, and carry
    // the DNA of this organism. It's a bit weird.
    this.springs = [];

    // The fill color of this organism.
    this.m_color = color(random(200, 255), random(200, 255), random(200, 255), 10);

    // The (x)position where this organism starts its life
    this.startPosition = 0;
    // The current (x)position of this organism
    this.position = 0;

    // The fitness (^:
    this.fitness = 0;

    // The sum of the fitnesses of every organism that's
    // earlier in the organism array in a Population object.
    // (What the hell should i call this variable??)
    this.collectedFitness = 0;

    // Calculates the fitness, the fitness is
    // how far it has traveled to the right.
    this.calculateFitness = function () {
        this.position = 0;
        for (var a = 0; a < this.points.length; a++) {
            this.position += this.points[a].position.x;
        }
        this.position /= this.points.length;
        this.fitness = pow((this.position - this.startPosition + 60) / 60, 4)*Math.sign((this.position - this.startPosition + 60) / 60);
        if (this.position - this.startPosition <= 0) {
            this.fitness = 0;
        }
    }

    // Adds a point and updates the springs
    this.addPoint = function (x, y) {
        this.points.push(new PhysicalPoint(x, y));
        this.springs.length = 0;
        var xSum = 0;
        for (var a = 0; a < this.points.length; a++) {
            xSum += this.points[a].position.x;
            for (var b = 0; b < this.points.length; b++) {
                if (a != b) {
                    this.springs.push(new Spring(this.points[a], this.points[b]));
                }
            }
        }
        this.startPosition = xSum / this.points.length;
    }

    // Updates the physics and stuff
    this.update = function () {
        // Apply gravitational force
        for (var a = 0; a < this.points.length; a++) {
            this.points[a].applyForce(0, gravity);
        }
        // Update the springs
        for (var a = 0; a < this.springs.length; a++) {
            this.springs[a].update();
        }
        // Detect and resolve collisions with ground
        for (var a = 0; a < this.points.length; a++) {
            if (this.points[a].position.y + this.points[a].velocity.y > groundPosition) {
                this.points[a].position.y = groundPosition;
                this.points[a].applyForce(0, -this.points[a].velocity.y);
                this.points[a].velocity.x *= 1 - groundFriction;
            }
        }
        // Apply velocity for every point
        for (var a = 0; a < this.points.length; a++) {
            this.points[a].update();
        }

        this.calculateFitness();
    }

    // Draws the organism onto the canvas.
    this.draw = function () {
        fill(this.m_color);

        stroke(255);
        beginShape();
        for (var c = 0; c < this.points.length; c++) {
            vertex(this.points[c].position.x, this.points[c].position.y);
        }
        endShape(CLOSE);
    }
}