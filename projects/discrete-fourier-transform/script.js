class SignalEditor {
	constructor(p_canvasId, p_signalLength, p_isAbsolute = false) {
		this.canvas = document.getElementById(p_canvasId);
		this.brush = this.canvas.getContext("2d");

		this.isAbsolute = p_isAbsolute;
		this.signal = new Array(p_signalLength);
		for (let a = 0; a < this.signal.length; a++) {
			this.signal[a] = 0;
		}

		//------------------------------------------
		
		this.isDragging = false;
		this.previouslyDraggedSampleIndex = -1;

		this.isShiftDown = false;
		addEventListener("keydown", p_event => { 
			if (p_event.keyCode == 16) {
				this.isShiftDown = true;
			}
		});
		addEventListener("keyup", p_event => { 
			if (p_event.keyCode == 16) {
				this.isShiftDown = false;
			}
		});

		var dragSignal = (p_event) => { 
			if (this.isDragging) {
				let boundingRect = this.canvas.getBoundingClientRect();
				let secondIndex = Math.max(0, Math.min(this.signal.length - 1, Math.floor((p_event.x - boundingRect.x)/this.canvas.width*this.signal.length)));
				let firstIndex = this.previouslyDraggedSampleIndex >= 0 ? this.previouslyDraggedSampleIndex : secondIndex;
				this.previouslyDraggedSampleIndex = secondIndex;

				this.signal[secondIndex] = this.isShiftDown ? 0 : Math.max(0, Math.min(this.canvas.height, p_event.y - boundingRect.y)) - 0.5*(1 + this.isAbsolute)*this.canvas.height;

				let smallestIndex = Math.min(firstIndex, secondIndex);
				let biggestIndex = Math.max(firstIndex, secondIndex);
				for (let a = smallestIndex + 1; a < biggestIndex; a++) {
					this.signal[a] = this.signal[smallestIndex] + (a - smallestIndex)*(this.signal[biggestIndex] - this.signal[smallestIndex])/(biggestIndex - smallestIndex);
				}

				this.handleSignalChange();
				this.draw();
				p_event.preventDefault();
			}
		};
		this.canvas.addEventListener("mousedown", (p_event) => { this.isDragging = true; dragSignal(p_event); });
		addEventListener("mouseup", () => { this.isDragging = false; this.previouslyDraggedSampleIndex = -1; });
		addEventListener("mousemove", dragSignal);

		this.draw();
	}

	draw() {
		this.brush.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.brush.fillStyle = "#5ca";
		for (let a = 0; a < this.signal.length; a++) {
			this.brush.fillRect(a/this.signal.length*this.canvas.width, 0.5*(1 + this.isAbsolute)*this.canvas.height, this.canvas.width/this.signal.length, this.signal[a]);
		}
		
		// Horizontal middle line if signal is bipolar
		if (!this.isAbsolute) {
			this.brush.lineWidth = 1;
			this.brush.strokeStyle = "rgba(0, 0, 0, 1)";
			this.brush.beginPath();
			this.brush.moveTo(0, this.canvas.height*0.5);
			this.brush.lineTo(this.canvas.width, this.canvas.height*0.5);
			this.brush.stroke();
		}
		
		// Vertical lines
		this.brush.lineWidth = 0.5;
		this.brush.strokeStyle = "rgba(0, 0, 0, 0.5)";
		this.brush.beginPath();
		for (let a = 1; a < this.signal.length; a++) {
			this.brush.moveTo(a/this.signal.length*this.canvas.width, 0);	
			this.brush.lineTo(a/this.signal.length*this.canvas.width, this.canvas.height);	
		}
		this.brush.stroke();
	}
}

//------------------------------------------

let numberInput_numberOfSamples = document.getElementById("numberInput_numberOfSamples");
function createSignal() {
	if (isNaN(numberInput_numberOfSamples.value)) {
		return;
	}
	window.numberOfSamples = Number.parseInt(numberInput_numberOfSamples.value);
	
	window.timeDomainSignal = new SignalEditor("canvas_timeDomainSignal", numberOfSamples);
	timeDomainSignal.handleSignalChange = transformFromTimeToFrequency;

	window.frequencyDomainAmplitudeSignal = new SignalEditor("canvas_frequencyDomainAmplitudeSignal", Math.floor(numberOfSamples/2 + 1), true);
	frequencyDomainAmplitudeSignal.handleSignalChange = transformFromFrequencyToTime;

	window.frequencyDomainPhaseSignal = new SignalEditor("canvas_frequencyDomainPhaseSignal", Math.floor(numberOfSamples/2 + 1));
	frequencyDomainPhaseSignal.handleSignalChange = transformFromFrequencyToTime;
}
numberInput_numberOfSamples.addEventListener("input", createSignal);

document.getElementById("button_clear").addEventListener("click", createSignal);

createSignal();

//------------------------------------------

let getIsFrequencyIndexDuplicate = w => (w && (w < Math.floor(numberOfSamples/2) || numberOfSamples & 1));
function transformFromTimeToFrequency() {
	for (let w = 0; w < frequencyDomainAmplitudeSignal.signal.length; w++) {
		let real = 0;
		let imaginary = 0;
		for (let n = 0; n < numberOfSamples; n++) {
			real -= timeDomainSignal.signal[n]*Math.cos(-Math.PI*2/numberOfSamples*w*n);
			imaginary += timeDomainSignal.signal[n]*Math.sin(-Math.PI*2/numberOfSamples*w*n);
		}
		frequencyDomainAmplitudeSignal.signal[w] = -2*Math.sqrt(real*real + imaginary*imaginary)/numberOfSamples;
		if (frequencyDomainAmplitudeSignal.signal[w] > -0.05) {
			frequencyDomainPhaseSignal.signal[w] = 0;
		}
		else {
			frequencyDomainPhaseSignal.signal[w] = -Math.atan2(imaginary, real)/Math.PI*this.canvas.height*0.5;
		}
	}
	frequencyDomainAmplitudeSignal.draw();
	frequencyDomainPhaseSignal.draw();
}

function transformFromFrequencyToTime() {
	for (let w = 0; w < frequencyDomainAmplitudeSignal.signal.length; w++) {
		for (let n = 0; n < numberOfSamples; n++) {
			if (!w) {
				timeDomainSignal.signal[n] = 0;
			}
			timeDomainSignal.signal[n] += (1 + getIsFrequencyIndexDuplicate(w))*Math.cos(Math.PI*2/numberOfSamples*w*n + frequencyDomainPhaseSignal.signal[w]*2/this.canvas.height*Math.PI)*frequencyDomainAmplitudeSignal.signal[w]*0.5;
		}
	}
	timeDomainSignal.draw();
}
