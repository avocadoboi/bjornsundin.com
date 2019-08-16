// Playable variables
var cellWidth = 10,
    triangleHeight = 60,
    // the hue of the first cell, from 0 to 100
    triangleHue = 13,
    // 0 to 100
    hueRange = 90,
    something_0 = 1,
    something_1 = 1;

var triangleWidth = 1 + (triangleHeight - 1) * 2,
    middleCellPosition = Math.floor(triangleWidth / 2);

function getPascalsTriangle() {
    var pascalsTriangle = [[]];

    while (pascalsTriangle[0].length < triangleWidth)
        pascalsTriangle[0].push(0);
    pascalsTriangle[0][middleCellPosition] = 1;

    var lastLayerIndex;
    for (var y = 0; y < triangleHeight - 1; y++) {
        lastLayerIndex = pascalsTriangle.length - 1;
        pascalsTriangle.push([]);
        for (var x = 0; x < triangleWidth; x++)
            pascalsTriangle[lastLayerIndex + 1].push(
                (((x > 0) ? pascalsTriangle[lastLayerIndex][x - 1] : 0) * something_0) +
                    (((x < triangleWidth - 1) ? pascalsTriangle[lastLayerIndex][x + 1] : 0) * something_1)
            );
    }
    return pascalsTriangle;
}

function setup() {
    createCanvas(cellWidth * triangleWidth, cellWidth * triangleHeight);
    colorMode(HSB, 100, 1, 1);
    noStroke();

    var pascalsTriangle = getPascalsTriangle();
    var biggestValue = pascalsTriangle[triangleHeight - 1][middleCellPosition];
    if (biggestValue === 0)
        biggestValue = pascalsTriangle[triangleHeight - 1][middleCellPosition - 1];

    for (var y = 0; y < triangleHeight; y++) {
        for (var x = 0; x < triangleWidth; x++) {
            fill(triangleHue + pascalsTriangle[y][x] / biggestValue * hueRange, 1, 1);
            rect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        }
    }
}