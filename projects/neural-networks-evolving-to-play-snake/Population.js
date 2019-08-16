class Population {
    constructor() {
        canvas.width = width.value, canvas.height = width.value;
        obstacleSensorFieldWidth = obstacleSensorRange.value * 2 + 1;

        this.snakes = [];
        for (var a = 0; a < populationSize.value; a++) {
            this.snakes.push(new Snake());
        }
        this.recordLength = 0;
        this.generation = 0;
    }

    //------------------------------------------------------------------------------------------------------

    reproduce() {
        this.generation++;

        //------------------------------------------------------------------------------------------------------
        // Sort and kill :^(

        for (var a = 0; a < this.snakes.length; a++) {
            this.snakes[a].calculateFitness();
        }
        this.snakes.sort(function (a, b) {
            if (a.fitness < b.fitness) {
                return -1;
            }
            else if (b.fitness < a.fitness) {
                return 1;
            }
            return 0;
        });
        if (poolSize.value < populationSize.value) {
            this.snakes.splice(0, populationSize.value - poolSize.value);
        }

        //------------------------------------------------------------------------------------------------------
        // Calculate stuff nessecary for breeding

        var bestFitness = 0, fitnessSum = 0;
        for (var a = 0; a < poolSize.value; a++) {
            this.snakes[a].collectedFitness = fitnessSum;
            fitnessSum += this.snakes[a].fitness;

            if (this.snakes[a].fitness >= bestFitness) {
                bestFitness = this.snakes[a].fitness;
            }
        }

        //------------------------------------------------------------------------------------------------------
        // SNEK CHILDREN! and kill their parents :^( they were good parents tho and they died by natural causes i promise

        var randomNumber_a, randomNumber_b, parent_a, parent_b;
        for (var a = 0; a < populationSize.value; a++) {
            randomNumber_a = Math.floor(Math.random() * fitnessSum);
            randomNumber_b = Math.floor(Math.random() * fitnessSum);

            // Pick parents
            for (var b = 0; b < poolSize.value; b++) {
                if (
                    randomNumber_a >= this.snakes[b].collectedFitness &&
                    randomNumber_a < this.snakes[b].collectedFitness + this.snakes[b].fitness
                ) {
                    parent_a = this.snakes[b];
                }
                if (
                    randomNumber_b >= this.snakes[b].collectedFitness &&
                    randomNumber_b < this.snakes[b].collectedFitness + this.snakes[b].fitness
                ) {
                    parent_b = this.snakes[b];
                }
            }
            this.snakes.push(new Snake(parent_a, parent_b));

            // SNEK BABIES!!!!!!!!!
            //  ______________
            // ~:___________  |
            //              | |
            //           ___| |
            //          |_____|
        }

        // :^(
        this.snakes.splice(0, poolSize.value);

        //------------------------------------------------------------------------------------------------------
        // Update status

        text_status.innerHTML = "Generation: " + this.generation + ". Record length: " + this.recordLength;
    }
    updateAndDraw() {
        var bestSnake = this.snakes[0];
        var numberOfDeadSnakes = 0;
        for (var a = 0; a < this.snakes.length; a++) {
            updateGame(this.snakes[a]);
            if (this.snakes[a].isAlive) {
                this.snakes[a].draw(0);

                this.snakes[a].calculateFitness();
                if (this.snakes[a].fitness > bestSnake.fitness || !bestSnake.isAlive) {
                    bestSnake = this.snakes[a];
                }
                if (this.snakes[a].cells.length > this.recordLength) {
                    this.recordLength = this.snakes[a].cells.length;
                }
            }
            else numberOfDeadSnakes++;
        }
        if (numberOfDeadSnakes == populationSize.value) {
            this.reproduce();
        }
        else {
            bestSnake.draw(1.5);
        }
    }
    update() {
        var numberOfDeadSnakes = 0;
        for (var a = 0; a < this.snakes.length; a++) {
            updateGame(this.snakes[a]);
            if (!this.snakes[a].isAlive) {
                numberOfDeadSnakes++;
            }
        }
        if (numberOfDeadSnakes == populationSize.value) {
            this.reproduce();
        }
    }
}