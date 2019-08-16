Physical.Bodies = {};

Physical.Bodies.Body = class {
    constructor() {
        // The shape type of the body.
        this.type = "Body";

        // The world that contains this body.
        this.world = null;

        // The point in 2d space where the center of mass of the body is.
        // Setting the position manually will probably break physics.
        this.position = new Physical.Vector();
        this.position_pixels = new Physical.Vector();

        // The speed of the center of mass  of the body, in meters per second.
        this.velocity_metersPerSecond = new Physical.Vector();

        // The surface of the body, this is used to calculate the mass and 
        // is recalculated every world update.
        this.area_squareMeters = 0;

        // The mass of the body relative to its area.
        this.density_kilosPerSquareMeter = 1;

        // How large of a force that is required to get the body to move 
        // along the tangent of a collision. This can go beyond 1 i guess
        this.staticFriction = 0.1;

        // Friction while it's moving. Goes between 0 and 1.
        this.dynamicFriction = 0.1;

        // The bounciness of the body. Goes between 0 and 1.
        this.restitution = 0.2;

        // Whether the body can move or not.
        this.isStatic = false;
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    // Applies a force on the body in newtons.
    applyForce(a, b) {
        if (!this.isStatic)
            if (arguments.length == 1)
                this.velocity_metersPerSecond.add(a.getDivided(this.getMass() * this.world.updatesPerSecond));
            else
                this.velocity_metersPerSecond.add(new Physical.Vector(a, b).getDivided(this.getMass() * this.world.updatesPerSecond));
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    getMass() {
        return this.area_squareMeters * this.density_kilosPerSquareMeter;
    }
    getBounds() {
        var bounds_meters = this.getBounds_meters();
        return {
            left: bounds_meters.left * this.world.pixelsPerMeter,
            right: bounds_meters.right * this.world.pixelsPerMeter,
            top: bounds_meters.top * this.world.pixelsPerMeter,
            bottom: bounds_meters.bottom * this.world.pixelsPerMeter
        };
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    static updateCollision(a, b) {
        if (a.isStatic && b.isStatic)
            return;

        var depth, normal;

        if (a.type == "Rectangle") {
            if (b.type == "Rectangle") {
                var delta = new Physical.Vector(a.position.x - b.position.x, a.position.y - b.position.y);
                var overlap = new Physical.Vector(a.size_meters.x * 0.5 + b.size_meters.x * 0.5 - Math.abs(delta.x), a.size_meters.y * 0.5 + b.size_meters.y * 0.5 - Math.abs(delta.y));
                if (overlap.x > 0 && overlap.y > 0) {
                    if (overlap.x < overlap.y) {
                        depth = overlap.x;
                        normal = new Physical.Vector(Math.sign(delta.x), 0);
                    }
                    else {
                        depth = overlap.y;
                        normal = new Physical.Vector(0, Math.sign(delta.y) == 0 ? 1 : Math.sign(delta.y));
                    }
                }
                else return;
            }
            else if (b.type == "Circle") {
                this.updateCollision(b, a);
                return;
            }
        }
        else if (a.type == "Circle") {
            if (b.type == "Circle") {
                let delta = a.position.getSubtracted(b.position);
                if (delta.getLengthSquared() > (a.radius_meters + b.radius_meters) * (a.radius_meters + b.radius_meters)) {
                    let deltaLength = delta.getLength();
                    if (deltaLength == 0) {
                        normal = new Physical.Vector(1, 0);
                    }
                    else {
                        normal = delta.getDivided(deltaLength);
                    }
                    depth = a.radius_meters + b.radius_meters - deltaLength;
                }
                else return;
            }
            else if (b.type == "Rectangle") {
                let delta = new Physical.Vector(a.position.x - b.position.x, a.position.y - b.position.y);
                let closestPoint = new Physical.Vector(
                    Math.max(b.position.x - b.size_meters.x / 2, Math.min(b.position.x + b.size_meters.x / 2, a.position.x)),
                    Math.max(b.position.y - b.size_meters.y / 2, Math.min(b.position.y + b.size_meters.y / 2, a.position.y))
                );
                let closestPointDelta = a.position.getSubtracted(closestPoint);

                if (closestPoint.equals(a.position)) {
                    if (b.size_meters.x / 2 - Math.abs(delta.x) < b.size_meters.y / 2 - Math.abs(delta.y)) {
                        if (delta.x > 0) {
                            normal = new Physical.Vector(1, 0);
                            depth = b.position.x + b.size_meters.x / 2 - a.position.x + a.radius_meters;
                        }
                        else {
                            normal = new Physical.Vector(-1, 0);
                            depth = Math.abs(b.position.x - b.size_meters.x / 2 - a.position.x - a.radius_meters);
                        }
                    }
                    else {
                        if (delta.y > 0) {
                            normal = new Physical.Vector(0, 1);
                            depth = b.position.y + b.size_meters.y / 2 - a.position.y + a.radius_meters;
                        }
                        else {
                            normal = new Physical.Vector(0, -1);
                            depth = Math.abs(b.position.y - b.size_meters.y / 2 - a.position.y - a.radius_meters);
                        }
                    }
                }
                else if (closestPointDelta.getLengthSquared() < a.radius_meters * a.radius_meters) {
                    let distance = closestPointDelta.getLength();
                    normal = closestPointDelta.getDivided(distance);
                    depth = a.radius_meters - distance;
                }
                else return;
            }
        }

        //------------------------------------------------------------------------------------------------------------------------------------------

        var inverseMass_a = (a.isStatic) ? (0) : (1 / (a.area_squareMeters * a.density_kilosPerSquareMeter)),
            inverseMass_b = (b.isStatic) ? (0) : (1 / (b.area_squareMeters * b.density_kilosPerSquareMeter));

        //------------------------------------------------------------------------------------------------------------------------------------------
        // position correction

        var percent = 1;
        var correction = normal.getMultiplied(-depth * percent / (inverseMass_a + inverseMass_b));
        if (!a.isStatic) {
            a.position.add(correction.getMultiplied(-inverseMass_a));
        }
        if (!b.isStatic) {
            b.position.add(correction.getMultiplied(inverseMass_b));
        }

        //------------------------------------------------------------------------------------------------------------------------------------------
        // Solve

        var relativeVelocityAlongNormal = Physical.Vector.getDot(a.velocity_metersPerSecond.getSubtracted(b.velocity_metersPerSecond), normal);
        if (relativeVelocityAlongNormal > 0) return;

        var impulse = normal.getMultiplied(
            ((a.restitution + b.restitution) / 2 + 1) * relativeVelocityAlongNormal / (inverseMass_a + inverseMass_b)
        );
        a.velocity_metersPerSecond.add(impulse.getMultiplied(-inverseMass_a));
        b.velocity_metersPerSecond.add(impulse.getMultiplied(inverseMass_b));

        //------------------------------------------------------------------------------------------------------------------------------------------
        // FRICTION!!

        var relativeVelocity = a.velocity_metersPerSecond.getSubtracted(b.velocity_metersPerSecond);
        var relativeVelocityAgainstNormal = Physical.Vector.getCross(normal, relativeVelocity);

        var tangent;
        if (relativeVelocityAgainstNormal < 0) {
            tangent = new Physical.Vector(-normal.y, normal.x);
        }
        else if (relativeVelocityAgainstNormal > 0) {
            tangent = new Physical.Vector(normal.y, -normal.x);
        }
        else return;

        var relativeVelocityAlongTangent = Physical.Vector.getDot(relativeVelocity, tangent);
        if (Math.abs(relativeVelocityAlongTangent) <= Math.min(a.staticFriction / inverseMass_a, b.staticFriction / inverseMass_b)) {
            impulse = tangent.getMultiplied(relativeVelocityAlongTangent);
        }
        else {
            impulse = tangent.getMultiplied(relativeVelocityAlongTangent * Math.min(a.dynamicFriction, b.dynamicFriction));
        }

        a.applyForce(impulse.getMultiplied(-1));
        b.applyForce(impulse);
    }
}

Physical.Bodies.Rectangle = class extends Physical.Bodies.Body {
    constructor(x, y, w, h) {
        super();
        this.type = "Rectangle";
        this.position_pixels.set(x, y);
        this.size = new Physical.Vector(w, h);
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    updateArea() {
        this.area_squareMeters = this.size_meters.x * this.size_meters.y;
    }
    getBounds_meters() {
        return {
            left: this.position.x - this.size_meters.x / 2,
            right: this.position.x + this.size_meters.x / 2,
            top: this.position.y - this.size_meters.y / 2,
            bottom: this.position.y + this.size_meters.y / 2
        };
    }
}
Physical.Bodies.Circle = class extends Physical.Bodies.Body {
    constructor(x, y, radius) {
        super();
        this.type = "Circle";
        this.position_pixels.set(x, y);
        this.radius = radius;
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    updateArea() {
        this.area_squareMeters = this.radius_meters * this.radius_meters * Math.PI;
    }
    getBounds_meters() {
        return {
            left: this.position.x - this.radius,
            right: this.position.x + this.radius,
            top: this.position.y - this.radius,
            bottom: this.position.y + this.radius
        };
    }
}