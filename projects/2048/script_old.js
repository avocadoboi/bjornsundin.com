let canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;

let brush = canvas.getContext("2d");
brush.textAlign = "center";
brush.textBaseline = "middle";

//--------------------------------------

let gridWidth = 4;
let tileWidth = canvas.width / gridWidth;

let input_width = document.getElementById("input_width");
input_width.value = gridWidth;

//--------------------------------------

let select_base = document.getElementById("select_base");
let base = Number.parseInt(select_base.value);

//--------------------------------------

let gravityStrength = 8;

//--------------------------------------

let gravity = new Vector();

//--------------------------------------

let tiles = [];

class Tile {
    constructor() {
        let positions = [];
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridWidth; y++) {
                positions.push(new Vector(x, y));
            }
        }
        for (let a = 0; a < tiles.length; a++) {
            positions[gridWidth * Math.round(tiles[a].position.x / tileWidth) + Math.round(tiles[a].position.y / tileWidth)].isOccupied = true;
        }
        for (let a = 0; a < positions.length; a++) {
            if (positions[a].isOccupied) {
                positions.splice(a, 1);
                a--;
            }
        }

        this.position = positions[Math.floor(Math.random() * positions.length)].getMultiplied(tileWidth);
        this.velocity = new Vector();
        this.value = base;
        this.level = 0;
    }

    //--------------------------------------

    getGridPosition() {
        return new Vector(Math.round(this.position.x / gridWidth), Math.round(this.position.y / gridWidth));
    }

    draw() {
        brush.fillStyle = "hsl(" + (100-this.level * 10).toString() + ", 100%, 40%)";
        brush.fillRect(this.position.x, this.position.y, tileWidth, tileWidth);
        brush.fillStyle = "white";
        brush.fillText(this.value.toString(), this.position.x + tileWidth * 0.5, this.position.y + tileWidth * 0.5);
    }
}

//--------------------------------------

onkeydown = (p_event) => {
    for (let a = 0; a < tiles.length; a++) {
        if (tiles[a].velocity.x != 0 || tiles[a].velocity.y != 0) {
            return;
        }
    }
    if (p_event.keyCode == 37) {
        // let willStuffHappen = false;
        // for ()
        gravity.set(-gravityStrength, 0);
        tiles.push(new Tile());
    }
    else if (p_event.keyCode == 39) {
        gravity.set(gravityStrength, 0);
        tiles.push(new Tile());
    }
    else if (p_event.keyCode == 38) {
        gravity.set(0, -gravityStrength);
        tiles.push(new Tile());
    }
    else if (p_event.keyCode == 40) {
        gravity.set(0, gravityStrength);
        tiles.push(new Tile());
    }
};

//--------------------------------------

function restart() {
    gridWidth = input_width.value;
    tileWidth = canvas.width / gridWidth;
    brush.font = (canvas.width / gridWidth * 0.5).toString() + "px Arial";

    tiles = [];
    tiles = [new Tile(), new Tile()];
}
document.getElementById("button_restart").onclick = restart;
restart();

//--------------------------------------

function update() {
    for (let a = 0; a < tiles.length; a++) {
        tiles[a].velocity.add(gravity);
    }

    for (let a = 0; a < tiles.length; a++) {
        let nextPosition = tiles[a].position.getAdded(tiles[a].velocity);
        if (nextPosition.x < 0) {
            tiles[a].position.x = 0;
            tiles[a].velocity.x = 0;
        }
        else if (nextPosition.x + tileWidth > canvas.width) {
            tiles[a].position.x = canvas.width - tileWidth;
            tiles[a].velocity.x = 0;
        }
        if (nextPosition.y < 0) {
            tiles[a].position.y = 0;
            tiles[a].velocity.y = 0;
        }
        else if (nextPosition.y + tileWidth > canvas.height) {
            tiles[a].position.y = canvas.height - tileWidth;
            tiles[a].velocity.y = 0;
        }
    }

    for (let a = 0; a < tiles.length; a++) {
        for (let b = 0; b < tiles.length; b++) {
            if (a == b) continue;

            if (tiles[a].value != tiles[b].value) {
                let nextPosition = tiles[a].position.getAdded(tiles[a].velocity);
                let delta = nextPosition.getAdded(tileWidth * 0.5).getSubtracted(tiles[b].position.getAdded(tileWidth * 0.5));
                if (Math.abs(delta.x) < tileWidth && Math.abs(delta.y) < tileWidth) {
                    if (Math.abs(delta.x) > Math.abs(delta.y)) {
                        if (delta.x < 0) {
                            tiles[a].position.x = tiles[b].position.x - tileWidth;
                        }
                        else {
                            tiles[a].position.x = tiles[b].position.x + tileWidth;
                        }
                        tiles[a].velocity.x = 0;
                    }
                    else {
                        if (delta.y < 0) {
                            tiles[a].position.y = tiles[b].position.y - tileWidth;
                        }
                        else {
                            tiles[a].position.y = tiles[b].position.y + tileWidth;
                        }
                        tiles[a].velocity.y = 0;
                    }
                }
            }
            else {
                if (tiles[a].position.x == tiles[b].position.x && tiles[a].position.y == tiles[b].position.y) {
                    tiles[a].value *= 2;
                    tiles[a].level++;

                    tiles.splice(b, 1);
                    if (a > b) {
                        a--;
                    }
                    b--;

                    gravity.set(0);
                }
            }
        }
    }

    for (let a = 0; a < tiles.length; a++) {
        tiles[a].position.add(tiles[a].velocity);
    }

    brush.clearRect(0, 0, canvas.width, canvas.height);
    for (let a = 0; a < tiles.length; a++) {
        tiles[a].draw();
    }

    requestAnimationFrame(update);
}
update();
