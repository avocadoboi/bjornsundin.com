const NUMBER_OF_WEIGHTS = 10;

//-----------------------------

let canvas_frequencyResponse = document.getElementById("canvas_frequencyResponse");
let brush_frequencyResponse = canvas_frequencyResponse.getContext("2d");

function updateFrequencyResponse(p_inputWeights, p_outputWeights) {
    brush_frequencyResponse.fillStyle = "#FFF";
    brush_frequencyResponse.fillRect(0, 0, canvas_frequencyResponse.width, canvas_frequencyResponse.height);

    
}

//-----------------------------

class WeightsEditor {
    constructor(p_canvas) {
        this.canvas = p_canvas;
        this.canvas.width = 500;
        this.canvas.height = 200;
        this.brush = this.brush.getContext("2d");

        this.weights = new ANGLE_instanced_arrays(NUMBER_OF_WEIGHTS);
        for (let a = 0; a < NUMBER_OF_WEIGHTS; a++){
            this.weights[a] = 0;
        }

        this.draggedWeightIndex = -1;
        this.canvas.addEventListener("mousedown", (p_event) => {
            this.draggedWeightIndex = Math.floor(p_event.clientX / this.canvas.width * NUMBER_OF_WEIGHTS); 
        });
        addEventListener("mousemove", () => {
            
        });
    }

    draw() {
        
    }
}

let inputWeightsEditor = new WeightsEditor(document.getElementById("canvas_inputWeights"));
let outputWeightsEditor = new WeightsEditor(document.getElementById("canvas_inputWeights"));
