// Global variables
var div_grid = document.getElementById("div_grid"),
    button_restart = document.getElementById("button_restart"),
    input_width = document.getElementById("input_width"),
    input_height = document.getElementById("input_height"),
    input_minePercentage = document.getElementById("input_minePercentage"),
    gridSize = { x: 0, y: 0 },
    minePercentage,
    numberOfMines,
    cells,
    numberOfRevealedCells,
    cellWidth,
    numberSize;

// A cell in the grid
class Cell {
    constructor(row, column) {
        this.isRevealed = false;
        this.isMarked = false;
        this.isMine = false;
        this.shouldBeMarked = false;
        this.row = row, this.column = column;
        this.neighbors = [];

        // Create the div element.
        this.div = document.createElement("div");
        this.div.className = "div_cell";
        this.div.style.width = cellWidth + "vmin";
        this.div.style.height = cellWidth + "vmin";
        this.div.style.fontSize = "0vmin";
        this.div.style.lineHeight = cellWidth + "vmin";
        let that = this;
        this.div.onclick = function () {
            that.click();
        }
        this.div.oncontextmenu = function () {
            if (that.isRevealed) return false;
            if (that.isMarked) that.unmark();
            else that.mark();
            return false;
        }
        div_grid.appendChild(this.div);
    }
    updateNeighborNumbers() {
        let walkableNeighbors, numberOfNearMines;
        for (let a = 0; a < this.neighbors.length; a++) {
            if (this.neighbors[a].isRevealed) {
                walkableNeighbors = [];
                numberOfNearMines = 0;
                for (let b = 0; b < this.neighbors[a].neighbors.length; b++) {
                    if (this.neighbors[a].neighbors[b].isMine) {
                        numberOfNearMines++;
                    }
                    else if (!this.neighbors[a].neighbors[b].isRevealed) {
                        walkableNeighbors.push(this.neighbors[a].neighbors[b]);
                    }
                }
                if (numberOfNearMines === 0) {
                    for (let b = 0; b < walkableNeighbors.length; b++) {
                        walkableNeighbors[b].click();
                    }
                    this.neighbors[a].div.style.fontSize = "0vmin";
                }
                else {
                    this.neighbors[a].div.innerText = numberOfNearMines.toString();
                    this.neighbors[a].div.style.fontSize = numberSize + "vmin";
                }
            }
        }
    }
    reveal() {
        numberOfRevealedCells++;
        this.isRevealed = true;
        this.div.style.cursor = "default";
        this.div.style.backgroundColor = "#eee";
        this.div.style.fontSize = numberSize + "vmin";
    }
    click() {
        // If this is the first cell to be revealed,
        // create the mines and make sure this won't
        // be one. 
        if (numberOfRevealedCells === 0) {
            numberOfMines = Math.max(1, Math.min(gridSize.x * gridSize.y - 1, Math.round(gridSize.x * gridSize.y * minePercentage * 0.01)));
            for (let a = 0; a < numberOfMines; a++) {
                let randomRowIndex, randomColumnIndex;
                do {
                    randomRowIndex = Math.floor(Math.random() * gridSize.y);
                    randomColumnIndex = Math.floor(Math.random() * gridSize.x);
                }
                while (cells[randomRowIndex][randomColumnIndex].isMine || (randomRowIndex === this.row && randomColumnIndex === this.column))
                cells[randomRowIndex][randomColumnIndex].isMine = true;
            }
        }
        else if (this.isRevealed || this.isMarked) return;

        // Count neighbour stuff
        let walkableNeighbors = [],
            nearMines = [];
        for (let a = 0; a < this.neighbors.length; a++) {
            if (this.neighbors[a].isMine) {
                nearMines.push(this.neighbors[a]);
            }
            else if (!this.neighbors[a].isRevealed) {
                walkableNeighbors.push(this.neighbors[a]);
            }
        }

        // If this is a mine and it was impossible
        // to reveal any mines without taking a risk,
        // Move it.
        if (this.isMine) {
            let willMoveMine = true;
            let cell = null;
            for (let row = 0; row < gridSize.y; row++) {
                for (let column = 0; column < gridSize.x; column++) {
                    cell = cells[row][column];
                    if (cell.isRevealed && cell.div.innerText != "" && !(row === this.row && column === this.column)) {
                        let nearMines_0 = [],
                            numberOfNeighborsThatAreNotRevealed = 0;
                        for (let a = 0; a < cell.neighbors.length; a++) {
                            if (cell.neighbors[a].isMine) {
                                nearMines_0.push(cell.neighbors[a]);
                            }
                            if (!cell.neighbors[a].isRevealed) {
                                numberOfNeighborsThatAreNotRevealed++;
                            }
                        }
                        if (numberOfNeighborsThatAreNotRevealed === nearMines_0.length) {
                            for (let a = 0; a < nearMines_0.length; a++) {
                                nearMines_0[a].shouldBeMarked = true;
                            }
                        }
                    }
                }
            }
            for (let row = 0; row < gridSize.y; row++) {
                for (let column = 0; column < gridSize.x; column++) {
                    cell = cells[row][column];
                    if (cell.isRevealed && cell.div.innerText !== "" && !(row === this.row && column === this.column)) {
                        // :^))
                        let numberOfNeighborsThatShouldBeMarked = 0,
                            numberOfWalkableNeighbors = 0;
                        for (let a = 0; a < cell.neighbors.length; a++) {
                            if (cell.neighbors[a].shouldBeMarked) {
                                numberOfNeighborsThatShouldBeMarked++;
                            }
                            else if (!cell.neighbors[a].isMine && !cell.neighbors[a].isRevealed) {
                                numberOfWalkableNeighbors++;
                            }
                        }
                        if (
                            numberOfNeighborsThatShouldBeMarked === parseInt(cell.div.innerText) &&
                            numberOfWalkableNeighbors > 0
                        ) {
                            willMoveMine = false;
                            row = gridSize.y;
                            column = gridSize.x;
                        }
                    }
                }
            }
            for (let row = 0; row < gridSize.y; row++) {
                for (let column = 0; column < gridSize.x; column++) {
                    cells[row][column].shouldBeMarked = false;
                }
            }
            if (willMoveMine) {
                let newMineCell;
                if (walkableNeighbors.length > 0) {
                    newMineCell = walkableNeighbors[Math.floor(Math.random() * walkableNeighbors.length)];
                    console.log("Moved a mine!");
                }
                else {
                    newMineCell = nearMines[Math.floor(Math.random() * nearMines.length)];
                    console.log("Removed a mine!");
                }
                this.isMine = false;
                newMineCell.isMine = true;
                this.reveal();
                this.updateNeighborNumbers();
                newMineCell.updateNeighborNumbers();
                return;
            }
        }

        this.reveal();

        // Win/lose
        if (this.isMine || numberOfRevealedCells === gridSize.x * gridSize.y - numberOfMines) {
            for (let row = 0; row < gridSize.y; row++) {
                for (let column = 0; column < gridSize.x; column++) {
                    cells[row][column].isRevealed = true;
                    cells[row][column].div.style.cursor = "default";
                    if (cells[row][column].isMine) {
                        cells[row][column].div.style.backgroundColor = this.isMine ? "red" : "lightgreen";
                    }
                    else if (cells[row][column].isMarked) {
                        cells[row][column].div.style.color = "red";
                    }
                }
            }
            if (this.isMine) return;
        }

        // Reveal the neighbours too if none
        // of them is a mine.
        if (nearMines.length === 0) {
            for (let a = 0; a < walkableNeighbors.length; a++) {
                walkableNeighbors[a].click();
            }
            return;
        }

        // Set the number.
        this.div.innerText = nearMines.length;
    }
    mark() {
        this.isMarked = true;
        this.div.innerText = "!";
        this.div.style.fontSize = numberSize + "vmin";
    }
    unmark() {
        this.isMarked = false;
        this.div.style.fontSize = "0vmin";
    }
}

function getCorrectedInputValue(input, lastValue) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < input.min || value > input.max) {
        return lastValue;
    }
    return value;
}

// Starts/restarts the game.
function restart() {
    // Reset/calculate/update variables
    gridSize.x = getCorrectedInputValue(input_width, gridSize.x);
    input_width.value = gridSize.x.toString();
    gridSize.y = getCorrectedInputValue(input_height, gridSize.y);
    input_height.value = gridSize.y.toString();
    minePercentage = getCorrectedInputValue(input_minePercentage, minePercentage);
    input_minePercentage.value = minePercentage.toString();
    numberOfRevealedCells = 0;
    cellWidth = 80 / Math.max(gridSize.x, gridSize.y);
    numberSize = cellWidth * 0.8;
    div_grid.innerHTML = "";
    div_grid.style.width = gridSize.x * cellWidth + "vmin";
    div_grid.style.height = gridSize.y * cellWidth + "vmin";

    // Make the cells!
    cells = [];
    for (let row = 0; row < gridSize.y; row++) {
        cells.push([]);
        for (let column = 0; column < gridSize.x; column++) {
            cells.getLast().push(new Cell(row, column));
        }
    }

    // Give them their neighbors!
    let cell = null;
    for (let row_0 = 0; row_0 < gridSize.y; row_0++) {
        for (let column_0 = 0; column_0 < gridSize.x; column_0++) {
            cell = cells[row_0][column_0];
            for (let row_1 = Math.max(0, cell.row - 1); row_1 <= Math.min(gridSize.y - 1, cell.row + 1); row_1++) {
                for (let column_1 = Math.max(0, cell.column - 1); column_1 <= Math.min(gridSize.x - 1, cell.column + 1); column_1++) {
                    if (!(row_1 === row_0 && column_1 === column_0)) cell.neighbors.push(cells[row_1][column_1]);
                }
            }
        }
    }

} restart();

// Handle events
button_restart.onclick = function () {
    restart();
}