function Events() {
    this.wasMousePressed = false;
    this.wasEnterPressed = false;

    this.reset = function () {
        this.wasMousePressed = false;
        this.wasEnterPressed = false;
    }
} var events = new Events();

function mousePressed() {
    events.wasMousePressed = true;
}
function keyPressed() {
    if (keyCode == ENTER) {
        events.wasEnterPressed = true;
        return false;
    }
}