function Organism() {
    this.string = "";
    this.fitness = 0;
    this.collectedFitness = 0;

    this.calculateFitness = function () {
        var numberOfCorrectCharacters = 0;
        for (var a = 0; a < targetString.length; a++) {
            if (this.string.charAt(a) === targetString.charAt(a)) {
                numberOfCorrectCharacters += 1;
            }
        }

        this.fitness = pow(numberOfCorrectCharacters / targetString.length, 4);
    }
}