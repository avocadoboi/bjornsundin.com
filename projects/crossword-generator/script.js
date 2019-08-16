Array.prototype.getLast = function () { return this[this.length - 1]; }

//---------------------------------------------------------------

const MAX_CANVAS_WIDTH = 600;
const CELL_WIDTH = 60;
const CROSSWORD_PADDING = CELL_WIDTH;

//---------------------------------------------------------------

class CharacterGrid {
    constructor() {
        this.width = 0;
        this.height = 0;

        this.cells = [];

        this.horizontalStringPositions = [];
        this.verticalStringPositions = [];
    }

    //---------------------------------------------------------------
    // I put these in their own functions to avoid making
    // a giant algorithm drowning in variable spaghetti.

    addRowsTop(p_numberOfRows) {
        for (let i_column = 0; i_column < this.width; i_column++) {
            Array.prototype.unshift.apply(this.cells[i_column], new Array(p_numberOfRows));
        }

        for (let i_string = 0; i_string < this.horizontalStringPositions.length; i_string++) {
            this.horizontalStringPositions[i_string].y += p_numberOfRows;
        }
        for (let i_string = 0; i_string < this.verticalStringPositions.length; i_string++) {
            this.verticalStringPositions[i_string].y += p_numberOfRows;
        }
    }
    addRowsBottom(p_numberOfRows) {
        for (let i_column = 0; i_column < this.width; i_column++) {
            Array.prototype.push.apply(this.cells[i_column], new Array(p_numberOfRows));
        }
    }

    addColumnsLeft(p_numberOfColumns) {
        let columnsToAdd = new Array(p_numberOfColumns);
        for (let i_column = 0; i_column < p_numberOfColumns; i_column++) {
            columnsToAdd[i_column] = new Array(this.height);
        }
        Array.prototype.unshift.apply(this.cells, columnsToAdd);

        for (let i_string = 0; i_string < this.horizontalStringPositions.length; i_string++) {
            this.horizontalStringPositions[i_string].x += p_numberOfColumns;
        }
        for (let i_string = 0; i_string < this.verticalStringPositions.length; i_string++) {
            this.verticalStringPositions[i_string].x += p_numberOfColumns;
        }
    }
    addColumnsRight(p_numberOfColumns) {
        let columnsToAdd = new Array(p_numberOfColumns);
        for (let i_column = 0; i_column < p_numberOfColumns; i_column++) {
            columnsToAdd[i_column] = new Array(this.height);
        }
        Array.prototype.push.apply(this.cells, columnsToAdd);
    }

    //---------------------------------------------------------------

    // p_string is actually a mutable array of chars
    insertWord(p_string, p_x, p_y, p_isVertical) {
        if (p_isVertical) {
            if (this.width == 0) {
                this.width = 1;
                this.cells.push([]);
            }

            // Add rows at top/bottom that are needed to fit the word.
            if (p_y < 0) {
                let numberOfRowsToAdd = -p_y;

                this.addRowsTop(numberOfRowsToAdd);
                this.height += numberOfRowsToAdd;

                p_y = 0;
            }
            if (p_y + p_string.length >= this.height) {
                let numberOfRowsToAdd = p_y + p_string.length - this.height;

                this.addRowsBottom(numberOfRowsToAdd);
                this.height += numberOfRowsToAdd;
            }

            this.verticalStringPositions.push({ x: p_x, y: p_y });

            // Set characters in grid
            for (let i_character = 0; i_character < p_string.length; i_character++) {
                this.cells[p_x][i_character + p_y] = p_string[i_character];
            }
        }
        else {
            if (this.height == 0) {
                this.height = 1;
                this.cells.push([]);
            }

            // Add columns to the left/right that are needed to fit the word.
            if (p_x < 0) {
                let numberOfColumnsToAdd = -p_x;

                this.addColumnsLeft(numberOfColumnsToAdd);
                this.width += numberOfColumnsToAdd;

                p_x = 0;
            }
            if (p_x + p_string.length >= this.width) {
                let numberOfColumnsToAdd = p_x + p_string.length - this.width;

                this.addColumnsRight(numberOfColumnsToAdd);
                this.width += numberOfColumnsToAdd;
            }

            this.horizontalStringPositions.push({ x: p_x, y: p_y });

            // Set characters in grid
            for (let i_character = 0; i_character < p_string.length; i_character++) {
                this.cells[i_character + p_x][p_y] = p_string[i_character];
            }
        }
    }

    //---------------------------------------------------------------

    getCopy() {
        let copiedCells = new Array(this.width);
        for (let x = 0; x < this.width; x++) {
            copiedCells[x] = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                copiedCells[x][y] = this.cells[x][y];
            }
        }

        let copiedHorizontalStringPositions = new Array(this.horizontalStringPositions.length);
        for (let a = 0; a < copiedHorizontalStringPositions.length; a++) {
            copiedHorizontalStringPositions[a] = { x: this.horizontalStringPositions[a].x, y: this.horizontalStringPositions[a].y };
        }

        let copiedVerticalStringPositions = new Array(this.verticalStringPositions.length);
        for (let a = 0; a < copiedVerticalStringPositions.length; a++) {
            copiedVerticalStringPositions[a] = { x: this.verticalStringPositions[a].x, y: this.verticalStringPositions[a].y };
        }

        let copy = new CharacterGrid();
        copy.cells = copiedCells;
        copy.width = this.width;
        copy.height = this.height;

        copy.horizontalStringPositions = copiedHorizontalStringPositions;
        copy.verticalStringPositions = copiedVerticalStringPositions;

        return copy;
    }
}

//---------------------------------------------------------------
// Result page

(function () {
    // Elements needed for generateCrossword
    let div_result = document.getElementById("div_result");
    let div_wordInput = document.getElementById("div_wordInput");

    let canvas = document.getElementById("canvas");

    let switch_isSolutionShown = document.getElementById("switch_isSolutionShown");
    let switch_areWordsNumbered = document.getElementById("switch_areWordsNumbered");

    let button_download = document.getElementById("button_download");

    let button_back = document.getElementById("button_back");
    button_back.onclick = () => {
        div_result.style.display = "none"
        div_wordInput.style.display = "inline-block";
    }

    let button_regenerate = document.getElementById("button_regenerate");
    button_regenerate.onclick = () => document.getElementById("button_generate").click();

    // Big function...
    window.generateCrossword = function (words, shownStrings) {
        div_result.style.display = "inline-block";
        div_wordInput.style.display = "none";

        //---------------------------------------------------------------
        // Scramble words, and convert them to char arrays

        let unscrambledWords = words;
        let unscrambledShownStrings = shownStrings;
        words = new Array(unscrambledWords.length);
        shownStrings = new Array(unscrambledShownStrings.length);

        let unscrambledWordsLengthSum = 0;
        for (let a = 0; a < unscrambledWords.length; a++) {
            unscrambledWordsLengthSum += unscrambledWords[a].length;
        }
        
        let numberOfWords = unscrambledWords.length;
        for (let a = 0; a < numberOfWords; a++) {
            let accumulatedLength = 0;
            let selectionPoint = Math.random() * unscrambledWordsLengthSum;
            let index = 0;
            for (let b = 0; b < unscrambledWords.length; b++) {
                accumulatedLength += unscrambledWords[b].length;
                if (accumulatedLength >= selectionPoint) {
                    index = b;
                    unscrambledWordsLengthSum -= unscrambledWords[b].length;
                    break;
                }
            }

            words[a] = unscrambledWords[index].toUpperCase().split("");
            unscrambledWords.splice(index, 1);

            shownStrings[a] = unscrambledShownStrings[index];
            shownStrings[a] = shownStrings[a].charAt(0).toUpperCase() + shownStrings[a].substr(1);
            unscrambledShownStrings.splice(index, 1);
        }

        //---------------------------------------------------------------

        let grid = new CharacterGrid();
        let horizontalShownStrings = [];
        let verticalShownStrings = [];
        let stack = [];
        let failed = false;

        function pushStack(p_isFirst) {
            let object = {};
            object.gridBefore = grid.getCopy();
            object.placings = [];
            object.i_placing = 0;
            object.isFirst = p_isFirst;

            if (p_isFirst) {
                for (let i_word = 0; i_word < words.length; i_word++) {
                    for (let isVertical = 0; isVertical <= 1; isVertical++) {
                        object.placings.push({ i_word: i_word, x: 0, y: 0, isVertical: isVertical });
                    }
                }
            }
            else {
                for (let i_word = 0; i_word < words.length; i_word++) {
                    if (words[i_word].isUsed) continue;
                    let word = words[i_word];

                    for (let isVertical = 0; isVertical <= 1; isVertical++) {
                        // Loop through the characters of the grid.
                        for (let x_0 = 0; x_0 < grid.width; x_0++) {
                            for (let y_0 = 0; y_0 < grid.height; y_0++) {
                                if (grid.cells[x_0][y_0] == undefined) continue;

                                // Check every character of the word against the character in the grid, to see if they match
                                characterLoop:
                                for (let i_wordCharacter = 0; i_wordCharacter < word.length; i_wordCharacter++) {
                                    if (word[i_wordCharacter] == grid.cells[x_0][y_0]) {
                                        // Check so it fits, and count number of word intersections.
                                        let numberOfIntersections = 0;
                                        if (isVertical) {
                                            let y = y_0 - i_wordCharacter;
                                            for (let y_1 = Math.max(0, y - 1); y_1 < Math.min(grid.height, y + word.length + 1); y_1++) {
                                                if (y_1 < y || y_1 >= y + word.length) {
                                                    if (grid.cells[x_0][y_1] !== undefined) continue characterLoop;
                                                }
                                                else if (grid.cells[x_0][y_1] != word[y_1 - y] && grid.cells[x_0][y_1] !== undefined) {
                                                    continue characterLoop;
                                                }
                                                else if (grid.cells[x_0][y_1] === undefined && ((x_0 > 0 ? (grid.cells[x_0 - 1][y_1] !== undefined) : false) || (x_0 < grid.width - 1 ? (grid.cells[x_0 + 1][y_1] !== undefined) : false))) {
                                                    continue characterLoop;
                                                }
                                                else if (grid.cells[x_0][y_1] == word[y_1 - y]) {
                                                    numberOfIntersections++;
                                                }
                                            }

                                            object.placings.push({
                                                i_word: i_word,
                                                x: x_0, y: y,
                                                isVertical: isVertical,
                                                numberOfIntersections: numberOfIntersections
                                            });
                                        }
                                        else {
                                            let x = x_0 - i_wordCharacter;
                                            for (let x_1 = Math.max(0, x - 1); x_1 < Math.min(grid.width, x + word.length + 1); x_1++) {
                                                if (x_1 < x || x_1 >= x + word.length) {
                                                    if (grid.cells[x_1][y_0] !== undefined) continue characterLoop;
                                                }
                                                else if (grid.cells[x_1][y_0] != word[x_1 - x] && grid.cells[x_1][y_0] !== undefined) {
                                                    continue characterLoop;
                                                }
                                                else if (grid.cells[x_1][y_0] === undefined && ((y_0 > 0 ? (grid.cells[x_1][y_0 - 1] !== undefined) : false) || (y_0 < grid.height - 1 ? (grid.cells[x_1][y_0 + 1] !== undefined) : false))) {
                                                    continue characterLoop;
                                                }
                                                else if (grid.cells[x_1][y_0] == word[x_1 - x]) {
                                                    numberOfIntersections++;
                                                }
                                            }

                                            object.placings.push({
                                                i_word: i_word,
                                                x: x, y: y_0,
                                                isVertical: isVertical,
                                                numberOfIntersections: numberOfIntersections
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                object.placings.sort((a, b) => {
                    return a.numberOfIntersections > b.numberOfIntersections ? -1 : (a.numberOfIntersections < b.numberOfIntersections ? 1 : 0);
                });
            }

            stack.push(object);
        }

        pushStack(true);

        //---------------------------------------------------------------
        stackLoop:
        while (stack.length > 0) {
            // An object that contains data about this word insertion attempt.
            let stackObject = stack.getLast();

            for (let i_placing = stackObject.i_placing; i_placing < stackObject.placings.length; i_placing++) {
                let placing = stackObject.placings[i_placing];

                words[placing.i_word].isUsed = true;
                stackObject.wasLastInsertedWordVertical = placing.isVertical;
                stackObject.i_placing = i_placing + 1;

                if (placing.isVertical) {
                    grid.insertWord(words[placing.i_word], placing.x, placing.y, true);
                    verticalShownStrings.push(shownStrings[placing.i_word]);
                }
                else {
                    wasInserted = grid.insertWord(words[placing.i_word], placing.x, placing.y, false);
                    horizontalShownStrings.push(shownStrings[placing.i_word]);
                }

                if (stack.length == words.length) {
                    // We solved it!! :^D
                    break stackLoop;
                }
                else {
                    pushStack(false);
                }
                continue stackLoop;
            }

            if (stackObject.isFirst) {
                failed = true;
                break stackLoop;
            }
            else {
                stack.pop();

                // Since the last stack object will try the next solution,
                // reset the grid. Otherwise the last solution is still in the grid.
                let stackObjectToBacktrack = stack.getLast();
                grid = stackObjectToBacktrack.gridBefore.getCopy();
                if (stackObjectToBacktrack.wasLastInsertedWordVertical) {
                    verticalShownStrings.pop();
                }
                else {
                    horizontalShownStrings.pop();
                }
                words[stackObjectToBacktrack.placings[stackObjectToBacktrack.i_placing - 1].i_word].isUsed = false;
            }
        }

        //---------------------------------------------------------------

        let brush = canvas.getContext("2d");

        if (failed) {
            canvas.width = 900;
            canvas.height = 400;
            brush.fillStyle = "#444";
            brush.textAlign = "center";
            brush.font = "45px Arial";
            brush.fillText("I'm so sorry...", canvas.width * 0.5, canvas.height * 0.43);
            brush.fillText("This crossword was impossible... :^(", canvas.width * 0.5, canvas.height * 0.57);

            button_download.disabled = true;
            switch_isSolutionShown.onchange = undefined;
        }
        else {
            function draw() {
                // Set canvas height
                let lineHeight = Math.max(10, Math.min(grid.width, grid.height) * CELL_WIDTH * 0.035);
                let lineHeight_title = lineHeight * 1.13;
                canvas.width = CELL_WIDTH * grid.width + 2 * CROSSWORD_PADDING;
                canvas.height = CELL_WIDTH * grid.height + 4 * CROSSWORD_PADDING + Math.max(lineHeight * verticalShownStrings.length, lineHeight * horizontalShownStrings.length);

                // Draw background
                brush.fillStyle = "#f8f8f8";
                brush.fillRect(0, 0, canvas.width, canvas.height);

                //---------------------------------------------------------------

                // Draw grid
                brush.strokeStyle = "#444";
                brush.lineWidth = Math.max(1, CELL_WIDTH / 40);

                brush.font = (CELL_WIDTH * 0.7).toString() + "px Arial";
                brush.textAlign = "center";

                for (let x = 0; x < grid.width; x++) {
                    for (let y = 0; y < grid.height; y++) {
                        if (grid.cells[x][y] !== undefined) {
                            brush.fillStyle = "white";
                            brush.fillRect(x * CELL_WIDTH + CROSSWORD_PADDING, y * CELL_WIDTH + CROSSWORD_PADDING, CELL_WIDTH, CELL_WIDTH);
                            brush.strokeRect(x * CELL_WIDTH + CROSSWORD_PADDING, y * CELL_WIDTH + CROSSWORD_PADDING, CELL_WIDTH, CELL_WIDTH);

                            if (switch_isSolutionShown.checked) {
                                brush.fillStyle = "#000";
                                brush.fillText(grid.cells[x][y], (x + 0.5) * CELL_WIDTH + CROSSWORD_PADDING, (y + 0.74) * CELL_WIDTH + CROSSWORD_PADDING);
                            }
                        }
                    }
                }

                // Draw numbers
                if (switch_areWordsNumbered.checked) {
                    brush.font = (CELL_WIDTH * 0.24).toString() + "px Arial";
                    brush.textAlign = "left";
                    brush.fillStyle = "#666";

                    for (let a = 0; a < grid.horizontalStringPositions.length; a++) {
                        brush.fillText(
                            a.toString(),
                            (grid.horizontalStringPositions[a].x + 0.1) * CELL_WIDTH + CROSSWORD_PADDING,
                            (grid.horizontalStringPositions[a].y + 0.27) * CELL_WIDTH + CROSSWORD_PADDING
                        )
                    }

                    for (let a = 0; a < grid.verticalStringPositions.length; a++) {
                        let isTaken = false;
                        for (let b = 0; b < grid.horizontalStringPositions.length; b++) {
                            if (grid.verticalStringPositions[a].x == grid.horizontalStringPositions[b].x &&
                                grid.verticalStringPositions[a].y == grid.horizontalStringPositions[b].y) {
                                isTaken = true;
                                break;
                            }
                        }
                        brush.fillText(
                            (isTaken ? ", " : "") + (a + horizontalShownStrings.length).toString(),
                            (grid.verticalStringPositions[a].x + 0.1 + (isTaken ? 0.15 : 0)) * CELL_WIDTH + CROSSWORD_PADDING,
                            (grid.verticalStringPositions[a].y + 0.27) * CELL_WIDTH + CROSSWORD_PADDING
                        )
                    }
                }

                //---------------------------------------------------------------
                // Measure width of the horizontal words text

                brush.font = lineHeight_title.toString() + "px Arial";
                let horizontalWordsWidth = brush.measureText("Horizontal: ").width;

                brush.font = lineHeight.toString() + "px Arial";
                for (let a = 0; a < horizontalShownStrings.length; a++) {
                    horizontalWordsWidth = Math.max(horizontalWordsWidth, brush.measureText(horizontalShownStrings[a]).width);
                }

                // Draw horizontal words
                let textTop = CELL_WIDTH * grid.height + CROSSWORD_PADDING * 3;

                brush.fillStyle = "#555";
                brush.textAlign = "start";
                brush.font = lineHeight_title.toString() + "px Arial";
                brush.fillText("Horizontal:", canvas.width * 0.5 - horizontalWordsWidth - lineHeight * 2, textTop);

                brush.font = lineHeight.toString() + "px Arial";
                for (let a = 0; a < horizontalShownStrings.length; a++) {
                    brush.fillText((switch_areWordsNumbered.checked ? a.toString() + ". " : '') + horizontalShownStrings[a], canvas.width * 0.5 - horizontalWordsWidth - lineHeight * 2, textTop + lineHeight * (a + 1.3));
                }

                // Draw vertical words
                brush.font = lineHeight_title.toString() + "px Arial";
                brush.fillText("Vertical:", canvas.width * 0.5 + lineHeight * 2, textTop);

                brush.font = lineHeight.toString() + "px Arial";
                for (let a = 0; a < verticalShownStrings.length; a++) {
                    brush.fillText((switch_areWordsNumbered.checked ? (a + horizontalShownStrings.length).toString() + ". " : '') + verticalShownStrings[a], canvas.width * 0.5 + lineHeight * 2, textTop + lineHeight * (a + 1.3));
                }

                // Update download onclick event
                button_download.onclick = () => {
                    let link = document.createElement("a");
                    link.download = "crossword.png";
                    link.href = canvas.toDataURL();
                    link.click();
                }
                button_download.disabled = false;
            }

            // Update isSolutionShown switch
            switch_isSolutionShown.parentElement.MaterialSwitch.off();
            switch_isSolutionShown.onchange = draw;

            // Update areWordsNumbered switch
            switch_areWordsNumbered.onchange = draw;

            draw();
        }

        // Update displayed canvas size
        if (canvas.width >= canvas.height) {
            canvas.style.width = MAX_CANVAS_WIDTH.toString() + "px";
            canvas.style.height = "auto";
        }
        else {
            canvas.style.width = "auto";
            canvas.style.height = MAX_CANVAS_WIDTH.toString() + "px";
        }
    }
})();

//---------------------------------------------------------------
// Word input page

(function () {
    let table_words = document.getElementById("table_words");
    table_words.style.display = "none";

    let tbody_words = document.getElementById("tbody_words");
    tbody_words.style.marginBottom = "30px";

    let input_wordToAdd = document.getElementById("input_wordToAdd");
    input_wordToAdd.onkeydown = (event) => {
        if (event.keyCode == 13) {
            if (input_wordToAdd.value.length == 0) {
                button_generate.click();
            }
            else {
                button_addWord.click();
                input_wordToAdd.value = "";
            }
        }
    }

    let button_addWord = document.getElementById("button_addWord");
    button_addWord.onclick = () => {
        if (input_wordToAdd.value.length <= 1) return;
        for (let a = 0; a < tbody_words.children.length; a++) {
            if (input_wordToAdd.value.toLowerCase() == tbody_words.children[a].children[0].innerHTML.toLowerCase()) return;
        }

        //---------------------------------------------------------------

        table_words.style.display = "inline-block";

        //---------------------------------------------------------------

        let tr_addedWord = document.createElement("tr");
        tbody_words.appendChild(tr_addedWord);

        //---------------------------------------------------------------

        let td_word = document.createElement("td");
        td_word.className = "mdl-data-table__cell--non-numeric";
        td_word.innerHTML = input_wordToAdd.value;
        tr_addedWord.appendChild(td_word);

        //---------------------------------------------------------------

        let td_shownText = document.createElement("td");
        td_shownText.className = "mdl-data-table__cell--non-numeric";
        tr_addedWord.appendChild(td_shownText);

        let div_shownTextTextfield = document.createElement("div");
        div_shownTextTextfield.className = "mdl-textfield mdl-js-textfield";
        div_shownTextTextfield.style.padding = "0px";
        div_shownTextTextfield.style.width = "140px";
        td_shownText.appendChild(div_shownTextTextfield);

        let input_shownText = document.createElement("input");
        input_shownText.className = "mdl-textfield__input";
        input_shownText.style.fontSize = "13px";
        input_shownText.defaultValue = input_wordToAdd.value;
        div_shownTextTextfield.appendChild(input_shownText);

        div_shownTextTextfield.innerHTML += `<label class="mdl-textfield__label smallTextfieldLabel" style="top: 2px; font-size: 13px;">Text...</label>`;

        //---------------------------------------------------------------

        let td_removeWord = document.createElement("td");
        td_removeWord.className = "mdl-data-table__cell--non-numeric";
        tr_addedWord.appendChild(td_removeWord);

        let button_removeWord = document.createElement("button");
        button_removeWord.className = "mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect";
        button_removeWord.innerHTML = `<i class="material-icons">remove</i>`;
        button_removeWord.onclick = () => {
            tr_addedWord.remove();
            if (tbody_words.children.length == 0) {
                table_words.style.display = "none";
            }
        }
        td_removeWord.appendChild(button_removeWord);

        componentHandler.upgradeDom();
    };

    //---------------------------------------------------------------

    let button_generate = document.getElementById("button_generate");
    button_generate.onclick = () => {
        let words = new Array(tbody_words.children.length);
        let shownStrings = new Array(tbody_words.children.length);
        for (let a = 0; a < words.length; a++) {
            words[a] = tbody_words.children[a].children[0].innerHTML;
            shownStrings[a] = tbody_words.children[a].children[1].children[0].children[0].value;
        }
        generateCrossword(words, shownStrings);
    };
})();