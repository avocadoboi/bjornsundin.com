let points = [];

function mouseClicked() {
    points.push(new Vector(mouseX, mouseY));
}

function getTrianglesFromPolygon(p_points) {
    if (p_points.length > 2) {
        let triangles = [];
        let pointsCopy = new Array(p_points.length);

        let area = 0;
        for (let a = 0; a < p_points.length; a++) {
            let nextPoint = a == p_points.length - 1 ? p_points[0] : p_points[a + 1];
            area += (p_points[a].x - nextPoint.x) * (p_points[a].y + nextPoint.y);

            pointsCopy[a] = p_points[a].getCopy();
        }
        let isClockwise = area > 0;

        while (pointsCopy.length > 2) {
            let bestTriangle;
            let bestTrianglePointIndex;
            let bestSideSquareSum = 0;
            for (let a = 0; a < pointsCopy.length; a++) {
                let i1 = a < pointsCopy.length - 1 ? a + 1 : 0;
                let i2 = a < pointsCopy.length - 2 ? a + 2 : (a < pointsCopy.length - 1 ? 0 : 1);

                let point_0 = pointsCopy[a];
                let point_1 = pointsCopy[i1].getCopy();
                let point_2 = pointsCopy[i2].getCopy();

                let rotation = point_1.getRotation(point_0);
                point_1.rotate(-rotation, point_0);
                point_2.rotate(-rotation, point_0);

                if (isClockwise ? (point_2.y > point_0.y) : (point_2.y < point_0.y)) {
                    if (pointsCopy.length == p_points.length) {
                        fill(255, 0, 0);
                        ellipse(pointsCopy[i1].x, pointsCopy[i1].y, 15, 15);
                    }

                    let sideSquareSum = Vector.getDistanceSquared(pointsCopy[a], pointsCopy[i1]) + Vector.getDistanceSquared(pointsCopy[i1], pointsCopy[i2]) + Vector.getDistanceSquared(pointsCopy[i2], pointsCopy[a]);
                    if (bestSideSquareSum == 0 || sideSquareSum < bestSideSquareSum) {
                        bestTriangle = [pointsCopy[a], pointsCopy[i1], pointsCopy[i2]];
                        bestTrianglePointIndex = i1;
                        bestSideSquareSum = sideSquareSum;
                    }
                }
            }

            if (bestTriangle == undefined) {
                break;
            }
            else {
                triangles.push(bestTriangle);
                pointsCopy.splice(bestTrianglePointIndex, 1);
            }
        }
        return triangles;
    }
    return [];
}

function setup() {
    createCanvas(800, 800);

    frameRate(3);
}

// let pointsCopy = [];
// let isClockwise;

// function draw() {
//     background(220);

//     if (points.length > 2) {
//         if (pointsCopy.length < 3) {
//             pointsCopy = new Array(points.length);
//             for (let a = 0; a < points.length; a++) {
//                 pointsCopy[a] = points[a].getCopy();
//             }
//         }

//         let area = 0;
//         for (let a = 0; a < pointsCopy.length; a++) {
//             let nextPoint = a == pointsCopy.length - 1 ? pointsCopy[0] : pointsCopy[a + 1];
//             area += (pointsCopy[a].x - nextPoint.x) * (pointsCopy[a].y + nextPoint.y);
//         }
//         isClockwise = area > 0;
    
//         fill(0);
//         beginShape();
//         for (let a = 0; a < points.length; a++) {
//             vertex(points[a].x, points[a].y);
//         }
//         endShape(CLOSE);
        
//         fill(255);
//         beginShape();
//         for (let a = 0; a < pointsCopy.length; a++) {
//             vertex(pointsCopy[a].x, pointsCopy[a].y);
//         }
//         endShape(CLOSE);

//         let bestTriangle;
//         let bestTrianglePointIndex;
//         let bestSideSquareSum = 0;
//         for (let a = 0; a < pointsCopy.length; a++) {
//             let i1 = a < pointsCopy.length - 1 ? a + 1 : 0;
//             let i2 = a < pointsCopy.length - 2 ? a + 2 : (a < pointsCopy.length - 1 ? 0 : 1);

//             let point_0 = pointsCopy[a];
//             let point_1 = pointsCopy[i1].getCopy();
//             let point_2 = pointsCopy[i2].getCopy();

//             let rotation = point_1.getRotation(point_0);
//             point_1.rotate(-rotation, point_0);
//             point_2.rotate(-rotation, point_0);

//             if (isClockwise ? (point_2.y > point_0.y) : (point_2.y < point_0.y)) {
//                 fill(255, 0, 0);
//                 ellipse(pointsCopy[i1].x, pointsCopy[i1].y, 15, 15);

//                 let sideSquareSum = /*Vector.getDistanceSquared(pointsCopy[a], pointsCopy[i1]) + Vector.getDistanceSquared(pointsCopy[i1], pointsCopy[i2]) + */Vector.getDistanceSquared(pointsCopy[i2], pointsCopy[a]);
//                 if (bestSideSquareSum == 0 || sideSquareSum < bestSideSquareSum) {
//                     bestTriangle = [pointsCopy[a], pointsCopy[i1], pointsCopy[i2]];
//                     bestTrianglePointIndex = i1;
//                     bestSideSquareSum = sideSquareSum;
//                 }
//             }
//         }

//         pointsCopy.splice(bestTrianglePointIndex, 1);
//     }
// }

let i_triangle = 0;
function draw() {
    background(220);

    let triangles = getTrianglesFromPolygon(points);

    noStroke();
    fill(0);
    beginShape();
    for (let a = 0; a < points.length; a++) {
        vertex(points[a].x, points[a].y);
    }
    endShape(CLOSE);

    fill(255);
    stroke(255, 0, 0);
    if (i_triangle == triangles.length) {
        i_triangle = 0;
    }
    else {
        for (let a = i_triangle; a < triangles.length; a++) {
            triangle(
                triangles[a][0].x, triangles[a][0].y,
                triangles[a][1].x, triangles[a][1].y,
                triangles[a][2].x, triangles[a][2].y
            );
        }
        i_triangle++;
    }
}