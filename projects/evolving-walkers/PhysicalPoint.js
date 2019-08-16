function PhysicalPoint(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);

    this.applyForce = function (x, y) {
        this.velocity.add(createVector(x, y));
    }
    this.update = function () {
        this.position.add(this.velocity);
    }
}