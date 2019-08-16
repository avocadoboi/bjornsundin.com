var maze;
Array.prototype.getLast = function () {
    return this[this.length - 1];
}
var canvas;

function setup() {
    maze = new Maze();

    canvas = createCanvas(maze.width * maze.cellWidth, maze.width * maze.cellWidth);
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.appendChild(canvas.canvas);
    canvas.canvas.style.position = "absolute";
    canvas.canvas.style.margin = "auto";
    canvas.canvas.style.left = "0px";
    canvas.canvas.style.right = "0px";
    canvas.canvas.style.top = "0px";
    canvas.canvas.style.bottom = "0px";
    canvas.canvas.style.width = "95vmin";
    canvas.canvas.style.height = "95vmin";
    canvas.canvas.style.imageRendering = "pixelated";

    frameRate(10);
}
function draw() {
    maze.update();
}