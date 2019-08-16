function setup() {
    createCanvas(1600, 1600);

    var padding = 50;

    background(255, 150, 190);

    noStroke();
    fill(0);

    rectMode(CENTER);
    for (var a = 0; a < 100; a++) {
        push();
        translate((width*2) / 45 * a - 900, height / 2);
        rotate(HALF_PI*0.55);
        rect(0, 0, 5, height*2);
        pop();

        push();
        translate((width*2) / 45 * a - 900, height / 2);
        rotate(-HALF_PI*0.55);
        rect(0, 0, 5, height*2);
        pop();
    }

    fill(255, 150, 190);

    textAlign(CENTER);
    textSize(340);
    textStyle(BOLD);
    for(var a = 0; a < 5; a++)
        text("TOENAIL", width*0.5, 320 + 300*a);
    
    rectMode(CORNER);
    rect(0, 0, width, padding);
    rect(0, 0, padding, height);
    rect(0, height - padding, width, padding);
    rect(width - padding, 0, padding, height);
}