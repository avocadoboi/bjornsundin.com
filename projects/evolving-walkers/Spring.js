// Change these values to get different interesting results!
// Be careful though, it might explode..
var numberOfForces = 4;
var forceFrequency = 20;
var strength = 0.1;
var wildness = 0.07;
var damping = 0.007;

var currentForceIndex = 0;

function Spring(p_jellyPoint_0, p_jellyPoint_1) {
    // Values between 0 and 1, the spring's forces.
    this.forces = [];

    // The points that the spring is connected to.
    this.point_0 = p_jellyPoint_0;
    this.point_1 = p_jellyPoint_1;

    this.getLength = function () {
        return dist(this.point_0.position.x, this.point_0.position.y, this.point_1.position.x, this.point_1.position.y);
    }
    this.restingLength = this.getLength();

    this.update = function () {
        var length = this.getLength();
        if (length == 0) length = 1;

        // Calculate the spring forces between the two points and apply them.
        var forceX = ((this.point_0.position.x - this.point_1.position.x) / length) * (this.restingLength - length) * strength;
        var forceY = ((this.point_0.position.y - this.point_1.position.y) / length) * (this.restingLength - length) * strength;
        this.point_0.applyForce(forceX, forceY);
        this.point_1.applyForce(-forceX, -forceY);
        this.point_0.velocity.mult(1 - damping);
        this.point_1.velocity.mult(1 - damping);

        // Contract the spring according to the current DNA force
        this.point_0.applyForce(
            (this.point_1.position.x - this.point_0.position.x) * this.forces[currentForceIndex] * wildness,
            (this.point_1.position.y - this.point_0.position.y) * this.forces[currentForceIndex] * wildness
        );
        this.point_1.applyForce(
            (this.point_0.position.x - this.point_1.position.x) * this.forces[currentForceIndex] * wildness,
            (this.point_0.position.y - this.point_1.position.y) * this.forces[currentForceIndex] * wildness
        );
        if (frameCount % forceFrequency === 0) {
            currentForceIndex++;
            if (currentForceIndex == numberOfForces) {
                currentForceIndex = 0;
            }
        }
    }
}