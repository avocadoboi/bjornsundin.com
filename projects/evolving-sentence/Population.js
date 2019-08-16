function Population() {
    this.organisms = [];
    this.size = 200;
    this.mutationProbability = 0.01;
    this.bestFitnessHistory = [];
    this.bestOrganismIndex = 0;
    this.generation = 0;
    this.isDone = false;

    this.getRandomChar = function () {
        return possibleCharacters.charAt(floor(random(possibleCharacters.length)));
    }
    this.start = function () {
        this.organisms.length = 0;
        for (var a = 0; a < this.size; a++) {
            this.organisms.push(new Organism());
            for (var b = 0; b < targetString.length; b++) {
                this.organisms[a].string += this.getRandomChar();
            }
        }
    }
    this.getIsDone = function () {
        if (this.organisms[this.bestOrganismIndex].string === targetString)
            return true;
        return false;
    }
    this.update = function () {
        if (!this.isDone)
            this.generation++;

        // Calculate the fitnesses, the sum and previous sum for every organism
        var bestFitness = 0;
        var fitnessSum = 0;
        for (var a = 0; a < this.size; a++) {
            this.organisms[a].collectedFitness = fitnessSum;
            this.organisms[a].calculateFitness();
            if (this.organisms[a].fitness > bestFitness) {
                bestFitness = this.organisms[a].fitness;
                this.bestOrganismIndex = a;
            }
            fitnessSum += this.organisms[a].fitness;
        }

        for (var a = 0; a < this.size; a++) {
            // Choose parents
            var parentIndex_0 = undefined;
            var parentIndex_1 = undefined;
            while (parentIndex_1 == undefined) {
                var randomNumber = random(fitnessSum);
                for (var b = 0; b < this.size; b++) {
                    if (randomNumber >= this.organisms[b].collectedFitness &&
                        randomNumber < this.organisms[b].collectedFitness + this.organisms[b].fitness) {
                        if (parentIndex_0 == undefined) {
                            parentIndex_0 = b;
                        }
                        else if (parentIndex_0 !== b) {
                            parentIndex_1 = b;
                        }
                        break;
                    }
                }
            }

            // crossover, mutation
            this.organisms.push(new Organism());
            var child = this.organisms[this.organisms.length - 1];
            var midpoint = floor(random(targetString.length));
            for (var b = 0; b < targetString.length; b++) {
                var mutationNumber = random(1);
                if (mutationNumber <= this.mutationProbability) {
                    child.string += this.getRandomChar();
                }
                else {
                    if (b < midpoint)
                        child.string += this.organisms[parentIndex_0].string.charAt(b);
                    else
                        child.string += this.organisms[parentIndex_1].string.charAt(b);
                }
            }
        }
        // Kill previous population :^(
        this.organisms.splice(0, this.size);
    }
    this.draw = function () {
        textAlign(CENTER);
        for (var a = 0; a < this.size; a++) {
            if (a === this.bestOrganismIndex)
                fill(0, 0, 0, 255);
            else
                fill(0, 0, 0, 2);
            text(this.organisms[a].string, width / 2, height / 2);
        }
        textAlign(LEFT, TOP);
        fill(0, 0, 0, 100);
        text("Generation: " + this.generation.toString(), 10, 10);

    }
}
/*
function Population() {
    this.organisms = [];
    this.size = 200;
    this.mutationProbability = 0.01;
    this.bestOrganismIndex = 0;
    this.generation = 0;
    this.isDone = false;

    this.getRandomChar = function () {
        return possibleCharacters.charAt(floor(random(possibleCharacters.length)));
    }
    this.start = function () {
        this.organisms.length = 0;
        for (var a = 0; a < this.size; a++) {
            this.organisms.push(new Organism());
            for (var b = 0; b < targetString.length; b++) {
                this.organisms[a].string += this.getRandomChar();
            }
        }
    }
    this.getIsDone = function () {
        return (this.organisms[this.bestOrganismIndex].string === targetString);
    }
    this.update = function () {
        if (!this.isDone) this.generation++;

        // Calculate the fitnesses, the sum and previous sum for every organism
        var bestFitness = 0;
        var fitnessSum = 0;
        for (var a = 0; a < this.size; a++) {
            this.organisms[a].collectedFitness = fitnessSum;
            this.organisms[a].calculateFitness();
            if (this.organisms[a].fitness > bestFitness) {
                bestFitness = this.organisms[a].fitness;
                this.bestOrganismIndex = a;
            }
            fitnessSum += this.organisms[a].fitness;
        }

        // Make new generation
        for (var a = 0; a < this.size; a++) {
            // Choose parents
            var parentIndex_0;
            var parentIndex_1;
            while (parentIndex_1 === undefined) {
                var randomNumber = random(fitnessSum);
                for (var b = 0; b < this.size; b++) {
                    if (randomNumber >= this.organisms[b].collectedFitness &&
                        randomNumber < this.organisms[b].collectedFitness + this.organisms[b].fitness) {
                        if (parentIndex_0 === undefined) {
                            parentIndex_0 = b;
                        }
                        else if (parentIndex_0 !== b) {
                            parentIndex_1 = b;
                        }
                        break;
                    }
                }
            }

            // crossover, mutation
            this.organisms.push(new Organism());
            var child = this.organisms[this.organisms.length - 1];
            var midpoint = floor(random(targetString.length));
            for (var b = 0; b < targetString.length; b++) {
                var mutationNumber = random(1);
                if (mutationNumber <= this.mutationProbability) {
                    child.string += this.getRandomChar();
                }
                else {
                    if (b < midpoint) {
                        child.string += this.organisms[parentIndex_0].string.charAt(b);
                    }
                    else {
                        child.string += this.organisms[parentIndex_1].string.charAt(b);
                    }
                }
            }
        }
        // Kill previous population :^(
        this.organisms.splice(0, this.size);
    }
    this.draw = function () {
        textAlign(CENTER);
        for (var a = 0; a < this.size; a++) {
            if (a === this.bestOrganismIndex) {
                fill(0, 0, 0, 255);
            }
            else {
                fill(0, 0, 0, 2);
            }
            text(this.organisms[a].string, width / 2, height / 2);
        }
        textAlign(LEFT, TOP);
        fill(0, 0, 0, 100);
        text("Generation: " + this.generation.toString(), 10, 10);
    }
}
*/