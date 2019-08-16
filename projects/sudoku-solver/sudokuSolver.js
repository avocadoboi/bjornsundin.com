/*
* A sudoku solver made by Björn Sundin,
* using a backtracking algorithm.
*/

//General variables
var gridCellSize = 5;
var inputs = [];
var lastInputValues = [];
for (var a = 0; a < 9 * 9; a++) lastInputValues.push("");
var button_solve = document.getElementById("button_solve"),
    button_clear = document.getElementById("button_clear"),
    button_reset = document.getElementById("button_reset"),
    checkbox_isRandom = document.getElementById("checkbox_isRandom"),
    text_info = document.getElementById("text_info");

function setupUI() {
    var div_inputs = document.getElementById("div_inputs");
    div_inputs.style.width = (gridCellSize * 9) + "vmin";
    div_inputs.style.height = (gridCellSize * 9) + "vmin";
    for (var a = 0; a < 9 * 9; a++) {
        inputs.push(document.createElement('input'));
        div_inputs.appendChild(inputs[a]);
        inputs[a].type = "number";
        inputs[a].name = "number";
        inputs[a].min = "1";
        inputs[a].max = "9";
        inputs[a].style.width = gridCellSize + "vmin";
        inputs[a].style.height = gridCellSize + "vmin";
        inputs[a].style.left = (gridCellSize * (a % 9)) + "vmin";
        inputs[a].style.top = (gridCellSize * Math.floor(a / 9)) + "vmin";

        if (a % 3 == 2) {
            inputs[a].style.borderRightColor = "black";
        }
        if (a % 3 == 0) {
            inputs[a].style.borderLeftColor = "black";
        }
        if (Math.floor(a / 9) % 3 == 2) {
            inputs[a].style.borderBottomColor = "black";
        }
        if (Math.floor(a / 9) % 3 == 0) {
            inputs[a].style.borderTopColor = "black";
        }

        inputs[a].oninput = function (event) {
            var number = parseInt(event.target.value.charAt(event.target.value.length - 1));
            if (number == 0 || isNaN(number)) {
                event.target.value = event.target.value.substr(0, event.target.value.length - 1);
            }
            if (event.target.value.length > 1) {
                event.target.value = event.target.value.charAt(1);
            }

            var isGameValid = true;
            for (var b = 0; b < inputs.length; b++) {
                if (!getIsInputValid(b) && inputs[b].value != '') {
                    inputs[b].style.backgroundColor = "#f00";
                    isGameValid = false;
                }
                else inputs[b].style.backgroundColor = "#fff";
            }
            if (isGameValid) text_info.innerText = "";
        }
    }
} setupUI();

// Get an array with the indexes of every input in the box specified with its index.
function getBox(p_index) {
    var result = [];
    for (var a = 0; a < 3; a++) {
        for (var b = 0; b < 3; b++) {
            result.push((3 * (p_index % 3)) + (Math.floor(p_index / 3) * (9 * 3)) + (a * 9) + b);
        }
    }
    return result;
}

// Get an array with the indexes of every input in the column specified with its index.
function getColumn(p_columnIndex) {
    var result = [];
    for (var c = 0; c < 9; c++) {
        result.push((9 * c) + p_columnIndex);
    }
    return result;
}

// Get an array with the indexes of every input in the row specified with its index.
function getRow(p_rowIndex) {
    var result = [];
    for (var c = 0; c < 9; c++) {
        result.push(c + (9 * p_rowIndex));
    }
    return result;
}

// Get the amount of a number in the box specified with its index.
function getNumberAmountInBox(p_number, p_boxArray) {
    var result = 0;
    for (var a = 0; a < 9; a++) {
        if (inputs[p_boxArray[a]].value == p_number) {
            result++;
        }
    }
    return result;
}

// Get the index of the box that contains the input specified with its index.
function getBoxIndex(p_inputIndex) {
    return Math.floor((p_inputIndex % 9) / 3) + (Math.floor(Math.floor(p_inputIndex / 9) / 3) * 3);
}

// Get if the input specified with its index follows the sudoku rules.
function getIsInputValid(p_inputIndex) {
    if (getNumberAmountInBox(inputs[p_inputIndex].value, getBox(getBoxIndex(p_inputIndex))) > 1) {
        return false;
    }
    for (var a = 0; a < 9; a++) {
        if (
            (getRow(Math.floor(p_inputIndex / 9))[a] != p_inputIndex && inputs[getRow(Math.floor(p_inputIndex / 9))[a]].value == inputs[p_inputIndex].value) ||
            (getColumn(p_inputIndex % 9)[a] != p_inputIndex && inputs[getColumn(p_inputIndex % 9)[a]].value == inputs[p_inputIndex].value) ||
            (inputs[p_inputIndex].value == 0)
        ) {
            return false;
        }
    }
    return true;
}

// Get if the number follows the sudoku rules at an input index.
function getIsNumberValid(p_inputIndex, p_number) {
    if (getNumberAmountInBox(p_number, getBox(getBoxIndex(p_inputIndex))) > 0) {
        return false;
    }
    for (var a = 0; a < 9; a++) {
        if (
            (getRow(Math.floor(p_inputIndex / 9))[a] != p_inputIndex && inputs[getRow(Math.floor(p_inputIndex / 9))[a]].value == p_number.toString()) ||
            (getColumn(p_inputIndex % 9)[a] != p_inputIndex && inputs[getColumn(p_inputIndex % 9)[a]].value == p_number.toString()) ||
            (p_number == 0)
        ) {
            return false;
        }
    }
    return true;
}

// Get if the game is valid.
function getIsGameValid() {
    for (var a = 0; a < 9 * 9; a++) {
        if (inputs[a].value != "" && !getIsInputValid(a)) {
            return false;
        }
    }
    return true;
}

// Return the index of the first empty input.
function getFirstEmpty() {
    for (var a = 0; a < 9 * 9; a++) {
        if (inputs[a].value == "") {
            return a;
        }
    }
    return null;
}

// Solve the sudoku.
function solve() {
    if (getFirstEmpty() == null) return true;

    var firstEmpty = getFirstEmpty();
    if (checkbox_isRandom.checked) {
        var numbersLeft = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var nextNumberIndex;
        for (var a = 0; a < 9; a++) {
            nextNumberIndex = Math.floor(Math.random() * numbersLeft.length);
            if (getIsNumberValid(firstEmpty, numbersLeft[nextNumberIndex])) {
                inputs[firstEmpty].value = numbersLeft[nextNumberIndex].toString();
                if (solve()) return true;
            }
            numbersLeft.splice(nextNumberIndex, 1);
        }
    }
    else for (var a = 1; a <= 9; a++) {
        if (getIsNumberValid(firstEmpty, a)) {
            inputs[firstEmpty].value = a.toString();
            if (solve()) return true;
        }
    }
    inputs[firstEmpty].value = "";
    return false;
}
button_solve.onclick = function () {
    if (getIsGameValid()) {
        if (getFirstEmpty() == null) {
            reset();
        }
        else for (var a = 0; a < inputs.length; a++) {
            lastInputValues[a] = inputs[a].value;
        }
        text_info.innerText = "Solving...";
        solve();
        text_info.innerText = "";
    }
    else {
        text_info.innerText = "The game is not valid.";
    }
}

// Clear the grid.
function clear() {
    for (var c = 0; c < inputs.length; c++) {
        inputs[c].value = "";
    }
    text_info.innerText = "";
}
button_clear.onclick = function () { clear(); }

// Reset the grid
function reset() {
    for (var c = 0; c < inputs.length; c++) {
        inputs[c].value = lastInputValues[c];
    }
}
button_reset.onclick = function () { reset(); }