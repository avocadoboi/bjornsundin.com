// Parameters

const MIN_SIZE = 1 + Math.random() * 4;
const MAX_SIZE = Math.random() * 100 + 100;
const START_HUE = Math.random() * 360;
const SIZE_CHANGE_SPEED = Math.random() * 0.003 + 0.0004
const HUE_CHANGE_SPEED = SIZE_CHANGE_SPEED * 10;
const IS_DARK = Math.round(Math.random());

//-----------------------------------------------------------------------------------------
// Global stuff

var canvas = document.getElementsByTagName("canvas")[0];
var brush = canvas.getContext("2d");
brush.translate(canvas.width * 0.5, canvas.height * 0.5);

if (IS_DARK) {
    document.body.style.backgroundColor = "black";
}

//-----------------------------------------------------------------------------------------

var frameCount = 0;

//-----------------------------------------------------------------------------------------

class Triangle {
    constructor(isFirst = false) {
        this.hue = START_HUE + frameCount * HUE_CHANGE_SPEED;

        //-----------------------------------------------------------------------------------------

        this.sideLength = MIN_SIZE + MAX_SIZE / (1 + frameCount * SIZE_CHANGE_SPEED);

        let angle = Math.random() * Math.PI * 2;
        let radius = Math.sqrt(Math.pow(this.sideLength, 2) - Math.pow(this.sideLength * 0.5, 2)) * 0.5;
        this.points = [
            new Vector(Math.cos(angle) * radius, Math.sin(angle) * radius),
            new Vector(Math.cos(angle + Math.PI / 1.5) * radius, Math.sin(angle + Math.PI / 1.5) * radius),
            new Vector(Math.cos(angle + Math.PI * 4 / 3) * radius, Math.sin(angle + Math.PI * 4 / 3) * radius)
        ];

        if (isFirst) {
            this.position = new Vector(0, 0);
            this.velocity = new Vector();
            this.isFrozen = true;
        }
        else {
            let positionAngle = Math.random() * Math.PI * 2;
            this.position = new Vector(Math.cos(positionAngle) * canvas.width, Math.sin(positionAngle) * canvas.height);
            this.velocity = this.position.getMultiplied(-15).getDivided(canvas.width);
            this.isFrozen = false;
        }
    }

    checkAgainst(triangle) {
        let intersectionDepth;
        let intersectionNormal;

        //-----------------------------------------------------------------------------------------

        let normals = [
            triangle.points[0].getSubtracted(triangle.points[1]).getDivided(triangle.sideLength).getNormal(),
            triangle.points[1].getSubtracted(triangle.points[2]).getDivided(triangle.sideLength).getNormal(),
            triangle.points[2].getSubtracted(triangle.points[0]).getDivided(triangle.sideLength).getNormal(),
            this.points[0].getSubtracted(this.points[1]).getDivided(this.sideLength).getNormal(),
            this.points[1].getSubtracted(this.points[2]).getDivided(this.sideLength).getNormal(),
            this.points[2].getSubtracted(this.points[0]).getDivided(this.sideLength).getNormal(),
        ];
        for (let a = 0; a < normals.length; a++) {
            let min_0, max_0, min_1, max_1;
            for (let b = 0; b < 3; b++) {
                let projectedPoint_0 = Vector.getDotProduct(triangle.points[b].getAdded(triangle.position), normals[a]);
                if (b == 0 || projectedPoint_0 < min_0) {
                    min_0 = projectedPoint_0;
                }
                if (b == 0 || projectedPoint_0 > max_0) {
                    max_0 = projectedPoint_0;
                }

                let projectedPoint_1 = Vector.getDotProduct(this.points[b].getAdded(this.position), normals[a]);
                if (b == 0 || projectedPoint_1 < min_1) {
                    min_1 = projectedPoint_1;
                }
                if (b == 0 || projectedPoint_1 > max_1) {
                    max_1 = projectedPoint_1;
                }
            }

            if (min_0 > max_1 || min_1 > max_0) return;

            let projectionOverlap = (max_1 - min_0 < max_0 - min_1) ? (min_0 - max_1) : (max_0 - min_1);
            if (intersectionDepth == undefined || Math.abs(projectionOverlap) < Math.abs(intersectionDepth)) {
                intersectionDepth = projectionOverlap;
                intersectionNormal = normals[a];
            }
        }
        //-----------------------------------------------------------------------------------------

        this.position.add(intersectionNormal.getMultiplied(intersectionDepth));
        this.isFrozen = true;
        triangle.isFrozen = true;
    }

    draw() {
        brush.fillStyle = "hsl(" + this.hue + ", 100%, 50%)";
        brush.beginPath();
        brush.moveTo(this.points[0].x + this.position.x, this.points[0].y + this.position.y);
        brush.lineTo(this.points[1].x + this.position.x, this.points[1].y + this.position.y);
        brush.lineTo(this.points[2].x + this.position.x, this.points[2].y + this.position.y);
        brush.closePath();
        brush.fill();
    }
}

var triangles = [new Triangle(true)];

//-----------------------------------------------------------------------------------------

function update() {
    if (frameCount % 30 == 0) {
        triangles.push(new Triangle());
    }

    //-----------------------------------------------------------------------------------------

    if (IS_DARK) {
        brush.fillStyle = "hsl(" + START_HUE + ", 100%, 4%)";
    }
    else {
        brush.fillStyle = "white";
    }
    brush.fillRect(-canvas.width * 0.5, -canvas.height * 0.5, canvas.width, canvas.height);

    //-----------------------------------------------------------------------------------------

    for (let a = 0; a < triangles.length; a++) {
        if (triangles[a].isFrozen) {
            triangles[a].draw();
        }
        else {
            triangles[a].position.add(triangles[a].velocity);
            for (let b = 0; b < triangles.length; b++) {
                if (a == b) continue;
                triangles[a].checkAgainst(triangles[b])
            }
        }
    }

    //-----------------------------------------------------------------------------------------

    frameCount++;
    requestAnimationFrame(update);
}
update();