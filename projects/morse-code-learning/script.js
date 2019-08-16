const RED_CROSS_ELEMENT_STRING = `<i class="material-icons" style="position: relative; color: red; width: 24px; margin-right: 10px; vertical-align: top;">close</i>`;
const GREEN_CHECKMARK_ELEMENT_STRING = `<i class="material-icons" style="position: relative; color: green; width: 24px; margin-right: 10px; vertical-align: top;">checkmark</i>`;
const MORSE_CODE_TYPING_INFO_ELEMENT_STRING = `<p style="color: #ccc; font-size: 18px; margin: 0px 0px; line-height: 19px;">Use the - and . keys<br>or the buttons below.</p>`;
const LETTER_WEIGHT_CHANGE_UP = 15;
const LETTER_WEIGHT_CHANGE_DOWN = 4;

//----------------------------------------------------------------------------------

var states = {
    letterToMorseCode: 0,
    morseCodeToLetter: 1
};
var state = states.letterToMorseCode;

var weights_letterToMorseCode = [];
for (let a = 0; a < 26; a++) {
    weights_letterToMorseCode.push(1);
}

var weights_morseCodeToLetter = [];
for (let a = 0; a < 26; a++) {
    weights_morseCodeToLetter.push(1);
}

//----------------------------------------------------------------------------------

function getNewMorseCodeDash(p_isLong) {
    let element = document.createElement("div");
    element.setAttribute("isLong", p_isLong ? "true" : "false");

    element.style.display = "inline-block";
    element.style.width = p_isLong ? "40px" : "15px";
    element.style.height = "10px";
    element.style.margin = "11.5px 2px";
    element.style.borderRadius = "4px";
    element.style.backgroundColor = "black";

    return element;
}

function getMorseCodeFromLetter(p_letter) {
    p_letter = p_letter.toUpperCase();
    switch (p_letter) {
        case 'A': return ".-";
        case 'B': return "-...";
        case 'C': return "-.-.";
        case 'D': return "-..";
        case 'E': return ".";
        case 'F': return "..-.";
        case 'G': return "--.";
        case 'H': return "....";
        case 'I': return "..";
        case 'J': return ".---";
        case 'K': return "-.-";
        case 'L': return ".-..";
        case 'M': return "--";
        case 'N': return "-.";
        case 'O': return "---";
        case 'P': return ".--.";
        case 'Q': return "--.-";
        case 'R': return ".-.";
        case 'S': return "...";
        case 'T': return "-";
        case 'U': return "..-";
        case 'V': return "...-";
        case 'W': return ".--";
        case 'X': return "-..-";
        case 'Y': return "-.--";
        case 'Z': return "--..";
    }
    return '';
}
function getLetterFromMorseCode(p_morseCode) {
    switch (p_morseCode) {
        case ".-": return 'A';
        case "-...": return 'B';
        case "-.-.": return 'C';
        case "-..": return 'D';
        case ".": return 'E';
        case "..-.": return 'F';
        case "--.": return 'G';
        case "....": return 'H';
        case "..": return 'I';
        case ".---": return 'J';
        case "-.-": return 'K';
        case ".-..": return 'L';
        case "--": return 'M';
        case "-.": return 'N';
        case "---": return 'O';
        case ".--.": return 'P';
        case "--.-": return 'Q';
        case ".-.": return 'R';
        case "...": return 'S';
        case "-": return 'T';
        case "..-": return 'U';
        case "...-": return 'V';
        case ".--": return 'W';
        case "-..-": return 'X';
        case "-.--": return 'Y';
        case "--..": return 'Z';
    }
    return '';
}

//----------------------------------------------------------------------------------

(function () {
    // Only for letter to morse code translation
    let div_state_letterToMorseCode = document.getElementById("div_state_letterToMorseCode");
    let div_morseCode = document.getElementById("div_morseCode");

    let p_letterToTranslate = document.getElementById("p_letterToTranslate");

    // Button that inserts a short signal
    let button_short = document.getElementById("button_short");
    button_short.onclick = () => {
        div_morseCode.appendChild(getNewMorseCodeDash(false));
        if (div_morseCode.children.length == 5) {
            div_morseCode.removeChild(div_morseCode.firstChild);
        }
        if (div_morseCode.firstChild.nodeName == "P") {
            div_morseCode.removeChild(div_morseCode.firstChild);
        }
    };

    // Button that inserts a long signal
    let button_long = document.getElementById("button_long");
    button_long.onclick = () => {
        div_morseCode.appendChild(getNewMorseCodeDash(true));
        if (div_morseCode.children.length == 5) {
            div_morseCode.removeChild(div_morseCode.firstChild);
        }
        if (div_morseCode.firstChild.nodeName == "P") {
            div_morseCode.removeChild(div_morseCode.firstChild);
        }
    };

    // Button that removes the last signal
    let button_backspace = document.getElementById("button_backspace");
    button_backspace.onclick = () => {
        if (div_morseCode.children.length > 0 && div_morseCode.lastChild.nodeName == "DIV") {
            div_morseCode.removeChild(div_morseCode.lastChild);
            if (div_morseCode.children.length == 0) {
                div_morseCode.innerHTML = MORSE_CODE_TYPING_INFO_ELEMENT_STRING;
            }
        }
    };

    //----------------------------------------------------------------------------------

    let div_state_morseCodeToLetter = document.getElementById("div_state_morseCodeToLetter");
    let div_morseCodeToTranslate = document.getElementById("div_morseCodeToTranslate");
    let div_letterInput = document.getElementById("div_letterInput");

    let input_letter = document.getElementById("input_letter");
    input_letter.oninput = (e) => {
        if (e.data == null) return;
        let letter = e.data.toUpperCase();
        if (button_continue.innerText == "CONTINUE" || letter.charCodeAt(0) < 65 || letter.charCodeAt(0) > 90) {
            input_letter.value = input_letter.value.substr(0, input_letter.value.length - 1);
        }
        else {
            input_letter.value = letter;
        }
    };

    let p_correctLetter = document.getElementById("p_correctLetter");

    //----------------------------------------------------------------------------------

    function generateNextTask() {
        // Find min
        let min;
        for (let a = 0; a < 52; a++) {
            if (a < 26) {
                if (min == undefined || weights_letterToMorseCode[a] < min) {
                    min = weights_letterToMorseCode[a];
                }
            }
            else {
                if (min == undefined || weights_morseCodeToLetter[a - 26] < min) {
                    min = weights_morseCodeToLetter[a - 26];
                }
            }
        }

        // Find sum
        let sum = 0;
        for (let a = 0; a < 52; a++) {
            sum += (a < 26 ? weights_letterToMorseCode[a] : weights_morseCodeToLetter[a - 26]) - min + 1;
        }

        // Choose letter or morse code from probability.
        let chosenString;
        let randomNumber = Math.random() * sum;
        sum = 0;
        for (let a = 0; a < 52; a++) {
            if (a < 26) {
                sum += weights_letterToMorseCode[a] - min + 1;
                if (sum > randomNumber) {
                    chosenString = String.fromCharCode(65 + a);
                    state = states.letterToMorseCode;
                    break;
                }
            }
            else {
                sum += weights_morseCodeToLetter[a - 26] - min + 1;
                if (sum > randomNumber) {
                    chosenString = getMorseCodeFromLetter(String.fromCharCode(65 - 26 + a));
                    state = states.morseCodeToLetter;
                    break;
                }
            }
        }

        // Update elements
        if (state == states.letterToMorseCode) {
            div_state_letterToMorseCode.style.display = "inline-block";
            div_state_morseCodeToLetter.style.display = "none";

            button_long.disabled = false;
            button_long.children[0].style.backgroundColor = "black";
            button_short.disabled = false;
            button_short.children[0].style.backgroundColor = "black";
            button_backspace.disabled = false;

            p_letterToTranslate.innerText = chosenString;
            div_morseCode.innerHTML = MORSE_CODE_TYPING_INFO_ELEMENT_STRING;
        }
        else {
            div_state_morseCodeToLetter.style.display = "inline-block";
            div_state_letterToMorseCode.style.display = "none";

            div_morseCodeToTranslate.innerHTML = "";
            for (let a = 0; a < chosenString.length; a++) {
                div_morseCodeToTranslate.appendChild(getNewMorseCodeDash(chosenString[a] == '-'));
            }

            p_correctLetter.innerText = "";

            input_letter.style.color = "black";
            input_letter.value = '';
            input_letter.focus();
        }
    } generateNextTask();

    // Button that either shows feedback or continues to the next task.
    let button_continue = document.getElementById("button_continue");
    button_continue.onclick = () => {
        if (state == states.letterToMorseCode) {
            // This means the user hasn't entered any morse code
            if (div_morseCode.firstChild.nodeName == "P") return;

            // Show feedback
            if (button_continue.innerText == "CHECK") {
                // Find morse code string
                let morseCodeString = "";
                for (let a = 0; a < div_morseCode.children.length; a++) {
                    morseCodeString += div_morseCode.children[a].getAttribute("isLong") == "true" ? '-' : '.';
                }

                // If it's correct
                if (getLetterFromMorseCode(morseCodeString) == p_letterToTranslate.innerText) {
                    weights_letterToMorseCode[p_letterToTranslate.innerText.charCodeAt(0) - 65] /= LETTER_WEIGHT_CHANGE_DOWN;

                    div_morseCode.innerHTML = GREEN_CHECKMARK_ELEMENT_STRING + div_morseCode.innerHTML;
                }
                else { // If it's not correct
                    weights_letterToMorseCode[p_letterToTranslate.innerText.charCodeAt(0) - 65] *= LETTER_WEIGHT_CHANGE_UP;

                    div_morseCode.innerHTML = RED_CROSS_ELEMENT_STRING + div_morseCode.innerHTML + "<br>" + GREEN_CHECKMARK_ELEMENT_STRING;
                    morseCodeString = getMorseCodeFromLetter(p_letterToTranslate.innerText);
                    for (let a = 0; a < morseCodeString.length; a++) {
                        div_morseCode.appendChild(getNewMorseCodeDash(morseCodeString[a][0] == '-'));
                    }
                }

                // Disable buttons
                button_long.disabled = true;
                button_long.children[0].style.backgroundColor = "rgba(0,0,0,.26)";
                button_short.disabled = true;
                button_short.children[0].style.backgroundColor = "rgba(0,0,0,.26)";
                button_backspace.disabled = true;

                button_continue.childNodes[0].nodeValue = "CONTINUE";
            }
            else { // Continue to next task.
                button_continue.childNodes[0].nodeValue = "CHECK";
                generateNextTask();
            }
        }
        else {
            // This means the user hasn't entered any morse code
            if (input_letter.value == '') return;

            // Show feedback
            if (button_continue.innerText == "CHECK") {
                // Find morse code string
                let morseCodeString = "";
                for (let a = 0; a < div_morseCodeToTranslate.children.length; a++) {
                    morseCodeString += div_morseCodeToTranslate.children[a].getAttribute("isLong") == "true" ? '-' : '.';
                }

                // If it's correct
                let correctLetter = getLetterFromMorseCode(morseCodeString);
                if (input_letter.value == correctLetter) {
                    weights_morseCodeToLetter[correctLetter.charCodeAt(0) - 65] /= LETTER_WEIGHT_CHANGE_DOWN;

                    input_letter.style.color = "green";
                }
                else { // If it's not correct
                    weights_morseCodeToLetter[correctLetter.charCodeAt(0) - 65] *= LETTER_WEIGHT_CHANGE_UP;

                    input_letter.style.color = "red";
                    p_correctLetter.innerText = correctLetter;
                }

                button_continue.childNodes[0].nodeValue = "CONTINUE";
            }
            else { // Continue to next task.
                button_continue.childNodes[0].nodeValue = "CHECK";
                generateNextTask();
            }

        }
    };

    addEventListener("keydown", (p_event) => {
        switch (p_event.keyCode) {
            case 190: // .
                if (state == states.morseCodeToLetter || button_short.disabled) return;
                button_short.onclick();
                break;
            case 189: // -
                if (state == states.morseCodeToLetter || button_long.disabled) return;
                button_long.onclick();
                break;
            case 8: // Backspace
                if (state == states.morseCodeToLetter || button_backspace.disabled) return;
                button_backspace.onclick();
                break;
            case 13: // Enter
                button_continue.onclick();
                break;
        }
    });
})()