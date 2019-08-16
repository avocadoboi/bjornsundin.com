var possibleCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!'#¤%&/()=?*^~+1234567890@£$€{[]}";
var length = 20;
var result = "";
var input_possibleCharacters;
var input_length;
var text_result;

function generate() {
    result = "";
    for (var a = 0; a < length; a++)
        result += possibleCharacters.charAt(floor(random(possibleCharacters.length)));
    text_result.html(result);
}

function updatePossibleCharacters() {
    possibleCharacters = input_possibleCharacters.value();
}
function updateLength() {
    length = input_length.value();
}

function setup() {
    noCanvas();

    var text_title = createElement("h1");
    text_title.html("Password generator");
    text_title.style("text-align: center");
    text_title.style("font-size: 5vmin");
    text_title.style("margin-top: 5vmin");

    var text_characters = createElement("p");
    text_characters.html("Characters:");
    text_characters.style("text-align", "center");
    text_characters.style("font-size", "4vmin");
    text_characters.style("margin-top", "5vmin");
    text_characters.style("margin-bottom", "2vmin");

    input_possibleCharacters = createElement("input");
    input_possibleCharacters.input(updatePossibleCharacters);
    input_possibleCharacters.value(possibleCharacters);
    input_possibleCharacters.attribute("spellcheck", "false");
    input_possibleCharacters.style("width: 55vmin; height: 3vmin;");
    input_possibleCharacters.style("font-size", "3vmin");
    input_possibleCharacters.style("display", "block");
    input_possibleCharacters.style("margin", "auto");

    var text_length = createElement("p");
    text_length.html("Length:");
    text_length.style("font-family", "arial");
    text_length.style("text-align", "center");
    text_length.style("font-size: 4vmin");
    text_length.style("margin-top", "5vmin");
    text_length.style("margin-bottom", "2vmin");

    input_length = createElement("input");
    input_length.input(updateLength);
    input_length.attribute("type", "number");
    input_length.attribute("min", "1");
    input_length.attribute("max", "100");
    input_length.value(length);
    input_length.style("width: 6vmin; height: 3vmin");
    input_length.style("font-size", "3vmin");
    input_length.style("display", "block");
    input_length.style("margin", "auto");

    var button_generate = createElement("button");
    button_generate.html("Generate!");
    button_generate.style("display", "block");
    button_generate.style("margin", "auto");
    button_generate.style("margin-top", "5vmin");
    button_generate.style("font-size", "5vmin");
    button_generate.mouseClicked(generate);
    button_generate.touchEnded(generate);

    text_result = createElement("p");
    text_result.style("font-family", "arial");
    text_result.style("text-align", "center");
    text_result.style("font-size", "6vmin");
    text_result.style("margin-top", "10vmin");
}