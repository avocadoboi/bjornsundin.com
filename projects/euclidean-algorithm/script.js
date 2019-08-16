let input_numerator = document.getElementById("input_numerator");
let input_denominator = document.getElementById("input_denominator");
let text_greatestCommonDenominator = document.getElementById("text_greatestCommonDenominator");
let text_simplifiedFraction = document.getElementById("text_simplifiedFraction");

function updateGreatestCommonDenominator() {
    let max = input_numerator.value;
    let min = input_denominator.value;
    
    if (!max || !min) {
        text_greatestCommonDenominator.innerHTML = "";
        text_simplifiedFraction.innerHTML = "";
        return;
    }
    
    if (max < min) {
        max = min;
        min = input_numerator.value;
    }

    while (true) {
        remainder = max % min;
        if (remainder) {
            max = min;
            min = remainder;
        }
        else {
            break;
        }
    }
    text_greatestCommonDenominator.innerHTML = min;

    text_simplifiedFraction.innerHTML = (input_numerator.value / min) + "/" + (input_denominator.value / min);
}

input_numerator.addEventListener("input", updateGreatestCommonDenominator);
input_denominator.addEventListener("input", updateGreatestCommonDenominator);
