class Cell {
    constructor(maze, column, row) {
        this.maze = maze;
        this.column = column, this.row = row;
        this.isVisited = false;
        this.isHistory = false;
    }
    draw() {
        noStroke();
        if (this.isHistory)
            fill(200, 20, 100);
        else if (this.isVisited)
            fill(10, 10, 10);
        else
            fill(170, 40, 70);
        rect(this.column * this.maze.cellWidth, this.row * this.maze.cellWidth, (this.column + 1) * this.maze.cellWidth, (this.row + 1) * this.maze.cellWidth);

        stroke(180, 180, 180);
        strokeWeight(this.maze.wallThickness);
        if (this.maze.walls_horizontal[this.row][this.column])
            if (this.row == 0)
                line(this.column * this.maze.cellWidth, this.maze.wallThickness * 0.5, (this.column + 1) * this.maze.cellWidth, this.maze.wallThickness * 0.5);
            else
                line(this.column * this.maze.cellWidth, this.row * this.maze.cellWidth, (this.column + 1) * this.maze.cellWidth, this.row * this.maze.cellWidth);
        if (this.row == this.maze.width - 1 && this.maze.walls_horizontal[this.maze.width][this.column])
            line(this.column * this.maze.cellWidth, this.maze.width * this.maze.cellWidth - this.maze.wallThickness * 0.5, (this.column + 1) * this.maze.cellWidth, this.maze.width * this.maze.cellWidth - this.maze.wallThickness * 0.5);

        if (this.maze.walls_vertical[this.row][this.column])
            if (this.column == 0)
                line(this.maze.wallThickness * 0.5, this.row * this.maze.cellWidth, this.maze.wallThickness * 0.5, (this.row + 1) * this.maze.cellWidth);
            else
                line(this.column * this.maze.cellWidth, this.row * this.maze.cellWidth, this.column * this.maze.cellWidth, (this.row + 1) * this.maze.cellWidth);
        if (this.column == this.maze.width - 1 && this.maze.walls_vertical[this.row][this.maze.width])
            line(this.maze.width * this.maze.cellWidth - this.maze.wallThickness * 0.5, this.row * this.maze.cellWidth, this.maze.width * this.maze.cellWidth - this.maze.wallThickness * 0.5, (this.row + 1) * this.maze.cellWidth);
    }
}

class Maze {
    constructor() {
        // Playable variables
        this.cellWidth = 50;
        this.width = 20;
        this.wallThickness = 4;
        this.startCellPosition = { x: 0, y: 0 };
        this.endCellPosition = { x: this.width - 1, y: this.width - 1 };

        this.walls_horizontal = [];
        this.walls_vertical = [];
        this.cells = [];
        for (var row = 0; row < this.width + 1; row++) {
            this.walls_horizontal.push([]);
            this.walls_vertical.push([]);
            if (row < this.width)
                this.cells.push([]);
            for (var column = 0; column < this.width + 1; column++) {
                this.walls_horizontal.getLast().push(true);
                this.walls_vertical.getLast().push(true);
                if (column < this.width && row < this.width)
                    this.cells.getLast().push(new Cell(this, column, row));
            }
        }
        this.startCell = this.cells[this.startCellPosition.y][this.startCellPosition.x];
        this.endCell = this.cells[this.endCellPosition.y][this.endCellPosition.x];
        if (this.startCellPosition.x == 0)
            this.walls_vertical[this.startCellPosition.y][0] = false;
        else if (this.startCellPosition.x == this.width - 1)
            this.walls_vertical[this.startCellPosition.y][this.width] = false;
        if (this.startCellPosition.y == 0)
            this.walls_horizontal[0][this.startCellPosition.x] = false;
        else if (this.startCellPosition.y == this.width - 1)
            this.walls_horizontal[this.width][this.startCellPosition.x] = false;
        if (this.endCellPosition.x == 0)
            this.walls_vertical[this.endCellPosition.y][0] = false;
        else if (this.endCellPosition.x == this.width - 1)
            this.walls_vertical[this.endCellPosition.y][this.width] = false;
        if (this.endCellPosition.y == 0)
            this.walls_horizontal[0][this.endCellPosition.x] = false;
        else if (this.endCellPosition.y == this.width - 1)
            this.walls_horizontal[this.width][this.endCellPosition.x] = false;
        this.currentCell = this.startCell;
        this.currentCell.isHistory = true;
        this.currentCell.isVisited = true;
        this.history = [this.currentCell];
    }
    update() {
        var openCells = [];
        if (this.currentCell.column > 0)
            if (!this.cells[this.currentCell.row][this.currentCell.column - 1].isVisited)
                openCells.push(this.cells[this.currentCell.row][this.currentCell.column - 1]);
        if (this.currentCell.column < this.width - 1)
            if (!this.cells[this.currentCell.row][this.currentCell.column + 1].isVisited)
                openCells.push(this.cells[this.currentCell.row][this.currentCell.column + 1]);
        if (this.currentCell.row > 0)
            if (!this.cells[this.currentCell.row - 1][this.currentCell.column].isVisited)
                openCells.push(this.cells[this.currentCell.row - 1][this.currentCell.column]);
        if (this.currentCell.row < this.width - 1)
            if (!this.cells[this.currentCell.row + 1][this.currentCell.column].isVisited)
                openCells.push(this.cells[this.currentCell.row + 1][this.currentCell.column]);
        if (openCells.length > 0) {
            var nextCell = random(openCells);
            if (nextCell.column < this.currentCell.column)
                this.walls_vertical[this.currentCell.row][this.currentCell.column] = false;
            else if (nextCell.column > this.currentCell.column)
                this.walls_vertical[this.currentCell.row][this.currentCell.column + 1] = false;
            else if (nextCell.row < this.currentCell.row)
                this.walls_horizontal[this.currentCell.row][this.currentCell.column] = false;
            else if (nextCell.row > this.currentCell.row)
                this.walls_horizontal[this.currentCell.row + 1][this.currentCell.column] = false;

            this.currentCell = nextCell;
            this.history.push(this.currentCell);
            this.currentCell.isHistory = true;
            this.currentCell.isVisited = true;
        }
        else if (this.history.length > 1) {
            this.currentCell.isHistory = false;
            this.history.pop();
            this.currentCell = this.history.getLast();
        }
        else {
            this.currentCell.isHistory = false;
            this.currentCell = null;
            this.history.pop();
            noLoop();
        }

        for (var row = 0; row < this.width; row++)
            for (var column = 0; column < this.width; column++)
                this.cells[row][column].draw();
    }
}