class Vector {
    constructor(a, b) {
        if (a == undefined && b == undefined) {
            this.x = 0, this.y = 0;
        }
        else this.set(a, b);
    }

    set(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                this.x = a, this.y = a;
            }
            else {
                this.x = a.x, this.y = a.y;
            }
        }
        else {
            this.x = a, this.y = b;
        }
    }

    getCopy() {
        return new Vector(this.x, this.y);
    }

    getEquals(a, b) {
        if (b == undefined) {
            return this.x == a.x && this.y == a.y;
        }
        else {
            return this.x == a && this.y == b;
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    add(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                this.x += a, this.y += a;
            }
            else {
                this.x += a.x, this.y += a.y;
            }
        }
        else {
            this.x += a, this.y += b;
        }
    }
    getAdded(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                return new Vector(this.x + a, this.y + a);
            }
            else {
                return new Vector(this.x + a.x, this.y + a.y);
            }
        }
        else {
            return new Vector(this.x + a, this.y + b);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    subtract(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                this.x -= a, this.y -= a;
            }
            else {
                this.x -= a.x, this.y -= a.y;
            }
        }
        else {
            this.x -= a, this.y -= b;
        }
    }
    getSubtracted(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                return new Vector(this.x - a, this.y - a);
            }
            else {
                return new Vector(this.x - a.x, this.y - a.y);
            }
        }
        else {
            return new Vector(this.x - a, this.y - b);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    divide(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                this.x /= a, this.y /= a;
            }
            else {
                this.x /= a.x, this.y /= a.y;
            }
        }
        else {
            this.x /= a, this.y /= b;
        }
    }
    getDivided(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                return new Vector(this.x / a, this.y / a);
            }
            else {
                return new Vector(this.x / a.x, this.y / a.y);
            }
        }
        else {
            return new Vector(this.x / a, this.y / b);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    multiply(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                this.x *= a, this.y *= a;
            }
            else {
                this.x *= a.x, this.y *= a.y;
            }
        }
        else {
            this.x *= a, this.y *= b;
        }
    }
    getMultiplied(a, b) {
        if (b == undefined) {
            if (a.x == undefined) {
                return new Vector(this.x * a, this.y * a);
            }
            else {
                return new Vector(this.x * a.x, this.y * a.y);
            }
        }
        else {
            return new Vector(this.x * a, this.y * b);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    getDistanceSquared(a, b) {
        if (b == undefined) {
            return (this.x - a.x) * (this.x - a.x) + (this.y - a.y) * (this.y - a.y);
        }
        else {
            return (this.x - a) * (this.x - a) + (this.y - b) * (this.y - b);
        }
    }
    static getDistanceSquared(a, b, c, d) {
        if (arguments.length == 4) {
            return (a - c) * (a - c) + (b - d) * (b - d);
        }
        else if (arguments.length == 3) {
            if (typeof a == "object" && typeof b == "number" && typeof c == "number") {
                return (a.x - b) * (a.x - b) + (a.y - c) * (a.y - c);
            }
            else if (typeof a == "number" && typeof b == "number" && typeof c == "object") {
                return (a - c.x) * (a - c.x) + (b - c.y) * (b - c.y);
            }
        }
        else {
            return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
        }
    }

    getDistance(a, b) {
        if (b == undefined) {
            return Math.sqrt((this.x - a.x) * (this.x - a.x) + (this.y - a.y) * (this.y - a.y));
        }
        else {
            return Math.sqrt((this.x - a) * (this.x - a) + (this.y - b) * (this.y - b));
        }
    }
    static getDistance(a, b, c, d) {
        if (arguments.length == 4) {
            return Math.sqrt((a - c) * (a - c) + (b - d) * (b - d));
        }
        else if (arguments.length == 3) {
            if (typeof a == "object" && typeof b == "number" && typeof c == "number") {
                return Math.sqrt((a.x - b) * (a.x - b) + (a.y - c) * (a.y - c));
            }
            else if (typeof a == "number" && typeof b == "number" && typeof c == "object") {
                return Math.sqrt((a - c.x) * (a - c.x) + (b - c.y) * (b - c.y));
            }
        }
        else {
            return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        }
    }

    getLengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        this.divide(this.getLength());
    }
    getNormalized() {
        return this.getDivided(this.getLength());
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    getNormal(isClockwise) {
        if (isClockwise) {
            return new Vector(-this.y, this.x);
        }
        return new Vector(this.y, -this.x);
    }

    rotate(rotation, origin_a, origin_b) {
        if (origin_a == undefined) {
            this.set(
                this.x * Math.cos(rotation) - this.y * Math.sin(rotation),
                this.x * Math.sin(rotation) + this.y * Math.cos(rotation)
            );
        }
        else if (origin_b == undefined) {
            this.set(
                (this.x - origin_a.x) * Math.cos(rotation) - (this.y - origin_a.y) * Math.sin(rotation) + origin_a.x,
                (this.y - origin_a.y) * Math.cos(rotation) + (this.x - origin_a.x) * Math.sin(rotation) + origin_a.y
            );
        }
        else {
            this.set(
                (this.x - origin_a) * Math.cos(rotation) - (this.y - origin_a) * Math.sin(rotation) + origin_a,
                (this.y - origin_b) * Math.cos(rotation) + (this.x - origin_b) * Math.sin(rotation) + origin_b
            );
        }
    }
    getRotated(rotation, origin_a, origin_b) {
        if (origin_a == undefined) {
            return new Vector(
                this.x * Math.cos(rotation) - this.y * Math.sin(rotation),
                this.x * Math.sin(rotation) + this.y * Math.cos(rotation)
            );
        }
        else if (origin_b == undefined) {
            return new Vector(
                (this.x - origin_a.x) * Math.cos(rotation) - (this.y - origin_a.y) * Math.sin(rotation) + origin_a.x,
                (this.y - origin_a.y) * Math.cos(rotation) + (this.x - origin_a.x) * Math.sin(rotation) + origin_a.y
            );
        }
        else {
            return new Vector(
                (this.x - origin_a) * Math.cos(rotation) - (this.y - origin_a) * Math.sin(rotation) + origin_a,
                (this.y - origin_b) * Math.cos(rotation) + (this.x - origin_b) * Math.sin(rotation) + origin_b
            );
        }
    }

    setRotation(rotation, origin_a, origin_b) {
        var currentRotation;
        if (origin_a == undefined) {
            currentRotation = Math.atan2(this.y, this.x);
        }
        else if (origin_b == undefined) {
            currentRotation = Math.atan2(this.y - origin_a.y, this.x - origin_a.x);
        }
        else {
            currentRotation = Math.atan2(this.y - origin_b, this.x - origin_a);
        }
        this.rotate(rotation - currentRotation, origin_a, origin_b);
    }
    getWithRotation(rotation, origin_a, origin_b) {
        var currentRotation;
        if (origin_a == undefined) {
            currentRotation = Math.atan2(this.y, this.x);
        }
        else if (origin_b == undefined) {
            currentRotation = Math.atan2(this.y - origin_a.y, this.x - origin_a.x);
        }
        else {
            currentRotation = Math.atan2(this.y - origin_b, this.x - origin_a);            
        }
        return this.getRotated(rotation - currentRotation, origin_a, origin_b);
    }

    getRotation(origin_a, origin_b) {
        if (origin_a == undefined) {
            return Math.atan2(this.y, this.x);
        }
        else if (origin_b == undefined) {
            return Math.atan2(this.y - origin_a.y, this.x - origin_a.x);
        }
        else {
            return Math.atan2(this.y - origin_b, this.x - origin_a);
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    getDotProduct(a, b) {
        if (b == undefined) {
            return this.x * a.x + this.y * a.y;
        }
        else {
            return this.x * a + this.y * b;
        }
    }
    static getDotProduct(a, b, c, d) {
        if (arguments.length == 4) {
            return a * c + b * d;
        }
        else if (arguments.length == 3) {
            if (typeof a == "object" && typeof b == "number" && typeof c == "number") {
                return a.x * b + a.y * c;
            }
            else if (typeof a == "number" && typeof b == "number" && typeof c == "object") {
                return a * c.x + b * c.y;
            }
        }
        else {
            return a.x * b.x + a.y * b.y;
        }
    }

    getCrossProduct(a, b) {
        if (b == undefined) {
            return this.x * a.y - a.x * this.y;
        }
        else {
            return this.x * b - a * this.y;
        }
    }
    static getCrossProduct(a, b, c, d) {
        if (arguments.length == 4) {
            return a * d - b * c;
        }
        else if (arguments.length == 3) {
            if (typeof a == "object" && typeof b == "number" && typeof c == "number") {
                return a.x * c - a.y * b;
            }
            else if (typeof a == "number" && typeof b == "number" && typeof c == "object") {
                return a * c.y - b * c.x;
            }
        }
        else {
            return a.x * b.y - a.y * b.x;
        }
    }
};