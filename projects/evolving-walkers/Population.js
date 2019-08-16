var currentGeneration = 0;
function Population() {
    this.organisms = [];
    this.original = new Organism();

    // Play with these values to get different results!
    this.size = 100;
    this.mutationProbability = 0.01;

    this.timeCounter = 0;
    this.bestFitnessHistory = [0];
    this.recordBestFitness = 0;
    this.bestFitness = 0;
    this.bestOrganismIndex = 0;
    this.generation = 0;
    this.cameraPosition = 0;

    this.initialize = function () {
        while (this.organisms.length < this.size) {
            this.organisms.push(new Organism());
            for (var a = 0; a < this.original.points.length; a++) {
                this.organisms[this.organisms.length - 1].addPoint(this.original.points[a].position.x, this.original.points[a].position.y);
            }
            for (var a = 0; a < this.organisms[this.organisms.length - 1].springs.length; a++) {
                while (this.organisms[this.organisms.length - 1].springs[a].forces.length < numberOfForces) {
                    this.organisms[this.organisms.length - 1].springs[a].forces.push(random(1));
                }
            }
        }
        this.timeCounter = 0;
    }
    this.generateNextGeneration = function () {
        // Calculate the fitnesses and fitness sum
        var fitnessSum = 0;
        for (var a = 0; a < this.organisms.length; a++) {
            this.organisms[a].collectedFitness = fitnessSum;
            fitnessSum += this.organisms[a].fitness;
        }
        this.bestFitnessHistory.push(this.bestFitness);
        if (this.bestFitness > this.recordBestFitness) {
            this.recordBestFitness = this.bestFitness;
        }

        while (this.organisms.length < this.size * 2) {
            // Pick parents!!
            var parentIndexes = [];
            while (parentIndexes.length < 2) {
                var randomNumber = random(fitnessSum);
                for (var a = 0; a < this.organisms.length; a++) {
                    if (randomNumber >= this.organisms[a].collectedFitness &&
                        randomNumber < this.organisms[a].collectedFitness + this.organisms[a].fitness) {
                        parentIndexes.push(a);
                        break;
                    }
                }
            }

            // Crossover, child-making and mutation.
            this.organisms.push(new Organism());
            var child = this.organisms[this.organisms.length - 1];
            for (var a = 0; a < this.original.points.length; a++) {
                child.addPoint(this.original.points[a].position.x, this.original.points[a].position.y);
            }
            var midpoint = floor(random(this.original.springs.length));
            for (var a = 0; a < this.original.springs.length; a++) {
                var mutationNumber = random(1);
                for (var b = 0; b < numberOfForces; b++) {
                    if (mutationNumber <= this.mutationProbability) {
                        child.springs[a].forces.push(random(1));
                    }
                    else {
                        if (a < midpoint) {
                            child.springs[a].forces.push(this.organisms[parentIndexes[0]].springs[a].forces[b]);
                        }
                        else {
                            child.springs[a].forces.push(this.organisms[parentIndexes[1]].springs[a].forces[b]);
                        }
                    }
                }
            }
        }

        // Kill the previous population :c
        this.organisms.splice(0, this.size);

        this.timeCounter = 0;
        this.generation++;
    }
    this.update = function () {
        if (this.timeCounter > 60 * 15) {
            this.generateNextGeneration();
        }
        this.bestOrganismIndex = 0;
        this.bestFitness = 0;
        for (var a = 0; a < this.organisms.length; a++) {
            this.organisms[a].update();
            if (this.organisms[a].fitness > this.bestFitness) {
                this.bestFitness = this.organisms[a].fitness;
                this.bestOrganismIndex = a;
            }
        }
        this.timeCounter++;
    }
    this.draw = function () {
        this.cameraPosition += (this.organisms[this.bestOrganismIndex].position - width / 2 - this.cameraPosition) * 0.03;
        camera(this.cameraPosition, 0);

        // Draw a background graph!!
        stroke(255, 0, 200, 150);
        fill(255);
        for (var a = 1; a <= this.bestFitnessHistory.length; a++) {
            line(this.cameraPosition + width / (this.bestFitnessHistory.length - 1) * (a - 1),
                map(this.bestFitnessHistory[a - 1], 0, this.recordBestFitness, height, 0),
                this.cameraPosition + width / (this.bestFitnessHistory.length - 1) * a,
                map(this.bestFitnessHistory[a], 0, this.recordBestFitness, height, 0));
        }

        // Draw text!
        noStroke();
        textAlign(LEFT);
        fill(255);
        text("This generation's best fitness: " + floor(this.bestFitness).toString(), this.cameraPosition + 50, 60);
        text("Generation: " + this.generation.toString(), this.cameraPosition + 50, 110);

        // Draw numbers every 400 pixels!
        textAlign(CENTER);
        for (var a = 0; a < 100; a++) {
            text(a.toString(), this.original.startPosition + a * 400, groundPosition + 10);
        }

        // Draw the creatures!!
        for (var a = 0; a < this.organisms.length; a++) {
            if (a !== this.bestOrganismIndex) {
                if (this.organisms[a].fitness === 0) {
                    this.organisms[a].m_color = color(255, 0, 0, 100);
                }
                else {
                    this.organisms[a].m_color = color(0, 0, map(this.organisms[a].fitness, 0, 20000, 0, 255), 200);
                }
                this.organisms[a].draw();
            }
        }
        this.organisms[this.bestOrganismIndex].m_color = color(0, 255, 0, 255);
        this.organisms[this.bestOrganismIndex].draw();
    }
}