const MAX_IMAGE_WIDTH = 600;
const LINE_THICKNESS = 2;
const MIN_LINE_LENGTH = 10;
const MAX_LINE_LENGTH = 150;

const POPULATION_SIZE_ROOT = 4;
const POPULATION_SIZE = POPULATION_SIZE_ROOT * POPULATION_SIZE_ROOT;
const POOL_PROPORTION = 0.3;
const MUTATION_RATE = 1 / 2000;

//--------------------------------------------------------

var numberOfGenes = 150 * 4;
var currentImageSize = new Vector();

//--------------------------------------------------------

class Artwork {
    constructor(p_parent_0, p_parent_1) {
        // Array of values that are in the range [0, 1)
        this.DNA = [];
        if (p_parent_0 === undefined) {
            for (let a = 0; a < numberOfGenes; a++) {
                this.DNA.push(Math.random());
            }
        }
        else {
            for (let a = 0; a < p_parent_0.DNA.length; a++) {
                if (Math.random() < MUTATION_RATE) {
                    this.DNA.push(Math.random());
                }
                else {
                    this.DNA.push(Math.random() < 0.5 ? p_parent_0.DNA[a] : p_parent_1.DNA[a]);
                }
            }
        }

        this.imageData = [];
        this.fitness = 0;
    }

    draw(p_brush, p_x, p_y, p_w, p_h) {
        let temporaryCanvas = document.createElement("canvas");
        temporaryCanvas.width = p_w;
        temporaryCanvas.height = p_h;
        let temporaryBrush = temporaryCanvas.getContext("2d");

        for (let a = 0; a < this.DNA.length; a += 4) {
            let position = new Vector(this.DNA[a] * p_w, this.DNA[a + 1] * p_h);
            let angle = this.DNA[a + 2] * Math.PI * 2;
            let length = (this.DNA[a + 3] * (MAX_LINE_LENGTH - MIN_LINE_LENGTH) + MIN_LINE_LENGTH) * p_w / currentImageSize.x;

            temporaryBrush.beginPath();
            temporaryBrush.moveTo(position.x, position.y);
            temporaryBrush.lineTo(position.x + Math.cos(angle) * length, position.y + Math.sin(angle) * length);
            temporaryBrush.lineWidth = LINE_THICKNESS * p_w / currentImageSize.x;
            temporaryBrush.stroke();
        }

        p_brush.drawImage(temporaryCanvas, p_x, p_y);

        this.imageData = temporaryBrush.getImageData(0, 0, p_w, p_h).data;
    }
}

//--------------------------------------------------------

class Population {
    constructor() {
        this.canvas_currentBest = document.getElementById("canvas_currentBest");
        this.brush_currentBest = this.canvas_currentBest.getContext("2d");

        this.canvas_currentPopulation = document.getElementById("canvas_currentPopulation");
        this.brush_currentPopulation = this.canvas_currentPopulation.getContext("2d");

        this.h6_fitness = document.getElementById("h6_fitness");

        this.targetImageData = null;

        this.restart();
    }

    restart() {
        this.artworks = [];
        for (let a = 0; a < POPULATION_SIZE; a++) {
            this.artworks.push(new Artwork());
        }
        this.bestArtwork = this.artworks[0];
    }

    update() {
        this.brush_currentBest.clearRect(0, 0, currentImageSize.x, currentImageSize.y);
        this.bestArtwork.draw(this.brush_currentBest, 0, 0, this.canvas_currentBest.width, this.canvas_currentBest.height);

        this.brush_currentPopulation.clearRect(0, 0, this.canvas_currentPopulation.width, this.canvas_currentPopulation.height)
        for (let a = 0; a < this.artworks.length; a++) {
            this.artworks[a].draw(
                this.brush_currentPopulation,
                a % POPULATION_SIZE_ROOT * this.canvas_currentPopulation.width / POPULATION_SIZE_ROOT,
                Math.floor(a / POPULATION_SIZE_ROOT) * this.canvas_currentPopulation.height / POPULATION_SIZE_ROOT,
                this.canvas_currentPopulation.width / POPULATION_SIZE_ROOT, this.canvas_currentPopulation.height / POPULATION_SIZE_ROOT
            );
        }

        //--------------------------------------------------------

        // Calculate fitnesses
        for (let a = 0; a < this.artworks.length; a++) {
            let error = 0;
            for (let b = 0; b < this.targetImageData.length; b += 4) {
                let brightness_targetImage = Math.min(255, (this.targetImageData[b] + this.targetImageData[b + 1] + this.targetImageData[b + 2]) / 3 + 255 - this.targetImageData[b + 3]);
                let brightness_currentImage = Math.min(255, (this.artworks[a].imageData[b] + this.artworks[a].imageData[b + 1] + this.artworks[a].imageData[b + 2]) / 3 + 255 - this.artworks[a].imageData[b + 3]);

                error += Math.abs(brightness_targetImage - brightness_currentImage);
            }
            this.artworks[a].fitness = Math.pow(1000000 / (error + 0.1), 3);

            if (this.artworks[a].fitness > this.bestArtwork.fitness) {
                this.bestArtwork = this.artworks[a];
                this.h6_fitness.innerHTML = "Best fitness: " + this.bestArtwork.fitness.toFixed(5);
            }
        }

        let pool = this.artworks;
        pool.sort((a, b) => { return a.fitness < b.fitness ? -1 : (a.fitness > b.fitness ? 1 : 0); });
        pool = pool.splice(-Math.max(1, Math.round(POPULATION_SIZE * POOL_PROPORTION)));

        let fitnessSum = 0;
        for (let a = 0; a < pool.length; a++) {
            fitnessSum += pool[a].fitness;
        }

        this.artworks = [];

        // Pick parents
        while (this.artworks.length < POPULATION_SIZE) {
            let pickingNumber_0 = Math.random() * fitnessSum;
            let parent_0 = null;
            let pickingNumber_1 = Math.random() * fitnessSum;
            let parent_1 = null;
            let accumulatedFitness = 0;
            for (let a = 0; a < pool.length; a++) {
                accumulatedFitness += pool[a].fitness;
                if (accumulatedFitness > pickingNumber_0 && parent_0 == null) {
                    parent_0 = pool[a];
                }
                if (accumulatedFitness > pickingNumber_1 && parent_1 == null) {
                    parent_1 = pool[a];
                }
            }
            this.artworks.push(new Artwork(parent_0, parent_1));
        }
    }
};
var population = null;

//--------------------------------------------------------

function update() {
    if (population != null) {
        population.update();
    }
    requestAnimationFrame(update);
}
update();

//--------------------------------------------------------
// "Open image" button.

let input_openImage = document.createElement("input");
input_openImage.type = "file";
input_openImage.onchange = () => {
    if (input_openImage.files.length > 0) {
        let file = input_openImage.files[0];
        if (file.type == "image/png" || file.type == "image/jpeg") {
            let fileReader = new FileReader();
            fileReader.onload = () => {
                let image = document.createElement("img");
                image.src = fileReader.result;

                image.onload = () => {
                    if (image.naturalWidth > image.naturalHeight) {
                        currentImageSize.x = MAX_IMAGE_WIDTH;
                        currentImageSize.y = MAX_IMAGE_WIDTH * image.naturalHeight / image.naturalWidth;
                    }
                    else {
                        currentImageSize.x = MAX_IMAGE_WIDTH * image.naturalWidth / image.naturalHeight;
                        currentImageSize.y = MAX_IMAGE_WIDTH;
                    }

                    let canvas = document.createElement("canvas");
                    canvas.width = currentImageSize.x / POPULATION_SIZE_ROOT;
                    canvas.height = currentImageSize.y / POPULATION_SIZE_ROOT;

                    let brush = canvas.getContext("2d");
                    brush.drawImage(image, 0, 0, currentImageSize.x / POPULATION_SIZE_ROOT, currentImageSize.y / POPULATION_SIZE_ROOT);

                    population = new Population();
                    population.targetImageData = brush.getImageData(0, 0, currentImageSize.x / POPULATION_SIZE_ROOT, currentImageSize.y / POPULATION_SIZE_ROOT).data;

                    population.canvas_currentPopulation.width = currentImageSize.x;
                    population.canvas_currentPopulation.height = currentImageSize.y;
                    population.canvas_currentBest.width = currentImageSize.x;
                    population.canvas_currentBest.height = currentImageSize.y;
                }
            }
            fileReader.readAsDataURL(file);
        }
    }
};

//--------------------------------------------------------

let button_openImage = document.getElementById("button_openImage");
button_openImage.onclick = () => input_openImage.click();

let button_restart = document.getElementById("button_restart");
button_restart.onclick = () => population.restart();

let input_numberOfLines = document.getElementById("input_numberOfLines");
input_numberOfLines.value = numberOfGenes / 4;
input_numberOfLines.onchange = () => {
    numberOfGenes = input_numberOfLines.value * 4;
};