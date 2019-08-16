const ANIMATION_LENGTH = 0.08;
const INITIAL_TILE_FONT_SIZE = 50;
const TILE_NUMBER_PROPORTION = 0.5;

//--------------------------------------

let div_gameContainer = document.getElementById("div_gameContainer");

//--------------------------------------

let gridWidth = 4;
let tileWidth;

let input_width = document.getElementById("input_width");
input_width.value = gridWidth;

//--------------------------------------

let select_base = document.getElementById("select_base");
let base;

//--------------------------------------

let grid = [];
let tiles = [];

class Tile {
    constructor() {
        this.div = document.createElement("div");
        this.div.className = "tile";
        this.div.style.width = tileWidth.toString() + "px";
        this.div.style.height = tileWidth.toString() + "px";
        this.div.style.position = "absolute";
        this.div.style.transition = ANIMATION_LENGTH.toString() + "s";
        this.div.style.textAlign = "center";
        this.div.style.transform = "scale(0, 0)";
        div_gameContainer.appendChild(this.div);

        this.text = document.createElement("p");
        this.text.style.display = "inline-block";
        this.text.style.lineHeight = (tileWidth).toString() + "px";
        this.text.style.verticalAlign = "middle";
        this.text.style.color = "rgb(250, 250, 250)";
        this.text.innerHTML = base.toString();
        this.div.appendChild(this.text);

        //--------------------------------------

        let positions = new Array(gridWidth * gridWidth - tiles.length);
        let numberOfPositionsAdded = 0;
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridWidth; y++) {
                if (grid[x][y] == undefined) {
                    positions[numberOfPositionsAdded++] = new Vector(x, y);
                }
            }
        }

        let position = positions[Math.floor(Math.random() * positions.length)];
        grid[position.x][position.y] = this;
        this.setPosition(position.getMultiplied(tileWidth));

        //--------------------------------------

        this.index = tiles.length;
        this.value = base;
        this.level = 0;

        this.updateStyle();
    }

    levelUp() {
        this.value *= 2;
        this.level++;
    }

    updateStyle() {
        this.div.style.backgroundColor = "hsl(" + (300 - this.level * 8).toString() + ", 100%, 40%)";

        this.text.innerHTML = this.value.toString();
        this.text.style.fontSize = INITIAL_TILE_FONT_SIZE + "px";
        this.text.style.fontSize = Math.min(tileWidth * TILE_NUMBER_PROPORTION, INITIAL_TILE_FONT_SIZE / this.text.getBoundingClientRect().width * tileWidth * TILE_NUMBER_PROPORTION).toString() + "px";

        setTimeout(() => this.div.style.transform = "scale(1, 1)", 100);
    }

    setPosition(p_a, p_b) {
        if (p_b == undefined) {
            this.div.style.left = p_a.x.toString() + "px";
            this.div.style.top = p_a.y.toString() + "px";
        }
        else {
            this.div.style.left = p_a.toString() + "px";
            this.div.style.top = p_b.toString() + "px";
        }
    }
    setX(p_x) {
        this.div.style.left = p_x.toString() + "px";
    }
    setY(p_y) {
        this.div.style.top = p_y.toString() + "px";
    }
}

onkeydown = (p_event) => {
    let numberOfMovements = 0;
    if (p_event.keyCode == 37) {
        for (let y = 0; y < gridWidth; y++) {
            let right = 0;
            let lastTile = undefined;
            for (let x = 0; x < gridWidth; x++) {
                if (grid[x][y] != undefined) {
                    if (lastTile != undefined && lastTile.value == grid[x][y].value) {
                        let thisLastTile = lastTile;
                        thisLastTile.levelUp();

                        let tile = grid[x][y];
                        tile.setX((right - 1) * tileWidth);
                        grid[x][y] = undefined;

                        setTimeout(() => {
                            tiles.splice(tile.index, 1);
                            div_gameContainer.removeChild(tile.div);
                            for (let i_tile = 0; i_tile < tiles.length; i_tile++) {
                                if (i_tile >= tile.index) {
                                    tiles[i_tile].index--;
                                }
                            }
                            thisLastTile.updateStyle();
                        }, 1000 * ANIMATION_LENGTH);

                        numberOfMovements++;
                    }
                    else {
                        let tile = grid[x][y];

                        if (right != x) {
                            tile.setX(right * tileWidth);
                            grid[x][y] = undefined;
                            grid[right][y] = tile;

                            numberOfMovements++;
                        }

                        right++;
                        lastTile = tile;
                    }
                }
            }
        }
    }
    else if (p_event.keyCode == 39) {
        for (let y = 0; y < gridWidth; y++) {
            let left = gridWidth - 1;
            let lastTile = undefined;
            for (let x = gridWidth - 1; x >= 0; x--) {
                if (grid[x][y] != undefined) {
                    if (lastTile != undefined && lastTile.value == grid[x][y].value) {
                        let thisLastTile = lastTile;
                        thisLastTile.levelUp();

                        let tile = grid[x][y];
                        tile.setX((left + 1) * tileWidth);
                        grid[x][y] = undefined;

                        setTimeout(() => {
                            tiles.splice(tile.index, 1);
                            div_gameContainer.removeChild(tile.div);
                            for (let i_tile = 0; i_tile < tiles.length; i_tile++) {
                                if (i_tile >= tile.index) {
                                    tiles[i_tile].index--;
                                }
                            }
                            thisLastTile.updateStyle();
                        }, 1000 * ANIMATION_LENGTH);

                        numberOfMovements++;
                    }
                    else {
                        let tile = grid[x][y];

                        if (left != x) {
                            tile.setX(left * tileWidth);
                            grid[x][y] = undefined;
                            grid[left][y] = tile;

                            numberOfMovements++;
                        }

                        left--;
                        lastTile = tile;
                    }
                }
            }
        }
    }
    else if (p_event.keyCode == 38) {
        for (let x = 0; x < gridWidth; x++) {
            let bottom = 0;
            let lastTile = undefined;
            for (let y = 0; y < gridWidth; y++) {
                if (grid[x][y] != undefined) {
                    if (lastTile != undefined && lastTile.value == grid[x][y].value) {
                        let thisLastTile = lastTile;
                        thisLastTile.levelUp();

                        let tile = grid[x][y];
                        tile.setY((bottom - 1) * tileWidth);
                        grid[x][y] = undefined;

                        setTimeout(() => {
                            tiles.splice(tile.index, 1);
                            div_gameContainer.removeChild(tile.div);
                            for (let i_tile = 0; i_tile < tiles.length; i_tile++) {
                                if (i_tile >= tile.index) {
                                    tiles[i_tile].index--;
                                }
                            }
                            thisLastTile.updateStyle();
                        }, 1000 * ANIMATION_LENGTH);

                        numberOfMovements++;
                    }
                    else {
                        let tile = grid[x][y];

                        if (bottom != y) {
                            tile.setY(bottom * tileWidth);
                            grid[x][y] = undefined;
                            grid[x][bottom] = tile;

                            numberOfMovements++;
                        }

                        bottom++;
                        lastTile = tile;
                    }
                }
            }
        }
    }
    else if (p_event.keyCode == 40) {
        for (let x = 0; x < gridWidth; x++) {
            let top = gridWidth - 1;
            let lastTile = undefined;
            for (let y = gridWidth - 1; y >= 0; y--) {
                if (grid[x][y] != undefined) {
                    if (lastTile != undefined && lastTile.value == grid[x][y].value) {
                        let thisLastTile = lastTile;
                        thisLastTile.levelUp();

                        let tile = grid[x][y];
                        tile.setY((top + 1) * tileWidth);
                        grid[x][y] = undefined;

                        setTimeout(() => {
                            tiles.splice(tile.index, 1);
                            div_gameContainer.removeChild(tile.div);
                            for (let i_tile = 0; i_tile < tiles.length; i_tile++) {
                                if (i_tile >= tile.index) {
                                    tiles[i_tile].index--;
                                }
                            }
                            thisLastTile.updateStyle();
                        }, 1000 * ANIMATION_LENGTH);

                        numberOfMovements++;
                    }
                    else {
                        let tile = grid[x][y];

                        if (top != y) {
                            tile.setY(top * tileWidth);
                            grid[x][y] = undefined;
                            grid[x][top] = tile;

                            numberOfMovements++;
                        }

                        top--;
                        lastTile = tile;
                    }
                }
            }
        }
    }

    if (numberOfMovements > 0) {
        tiles.push(new Tile());
    }
};

//--------------------------------------

function restart() {
    div_gameContainer.innerHTML = "";

    base = Number.parseInt(select_base.value);

    gridWidth = input_width.value;
    tileWidth = div_gameContainer.getBoundingClientRect().width / gridWidth;

    grid = new Array(gridWidth);
    for (let x = 0; x < gridWidth; x++) {
        grid[x] = new Array(gridWidth);
        for (let y = 0; y < gridWidth; y++) {
            grid[x][y] = undefined;
        }
    }

    tiles = [];
    tiles.push(new Tile());
    tiles.push(new Tile());
}
document.getElementById("button_restart").onclick = restart;
restart();
