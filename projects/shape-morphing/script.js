const NUMBER_OF_SHAPE_POINTS = 400;
const ANIMATION_SPEED = 0.02;
const ANIMATION_STEERING_SPEED = 0.05;
const ANIMATION_BOUNCE_FREQUENCY = 180;

//=============================================================================

var tabBar = document.getElementsByClassName("mdl-tabs__tab-bar")[0];

var frameCount = 0;

//=============================================================================

// (x2, y2) and (x3, y3) is the ray
function getRayLineIntersectionData(a, b, c, d) {
  let rayScalar = ((b.x - c.x) * (b.y - a.y) - (b.y - c.y) * (b.x - a.x)) / ((d.x - c.x) * (b.y - a.y) - (d.y - c.y) * (b.x - a.x));
  let lineScalar = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
  return {
    intersectionPoint: new Vector(c.x + rayScalar * (d.x - c.x), c.y + rayScalar * (d.y - c.y)),
  	isIntersecting: rayScalar > 0 && lineScalar >= 0 && lineScalar <= 1
	};
}

//=============================================================================

class TabPanel {
	constructor (tabID) {
  	this.tabPanelElement = document.getElementById(tabID);
    
    this.canvas = this.tabPanelElement.getElementsByTagName("canvas")[0];
    this.brush = this.canvas.getContext("2d");
    
    this.updateCanvasSize();
    addEventListener("resize", () => this.updateCanvasSize());
    
    this.wasOpenBefore = false;
    this.wasOpened = false;
  }
	
	//=============================================================================

  update () {
    if (this.tabPanelElement.classList.length == 2 && !this.wasOpenBefore){
    	this.wasOpened = true;
    }
    else {
    	this.wasOpened = false;
    }
    this.wasOpenBefore = (this.tabPanelElement.classList.length == 2);
    if (!this.wasOpenBefore) return false;
    
    this.brush.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
  	return true;
  }
  
  updateCanvasSize () {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight - tabBar.clientHeight;
		this.brush.font = "30px arial";
    this.brush.textAlign = "center";
  }
};

//=============================================================================

class ShapeInput extends TabPanel {
  constructor (tabID) {
    super(tabID);
    
		//=============================================================================
    
    this.shape = [];
    this.shape_divided = [];
    
    this.canvas.onclick = (mouse) => this.shape.push(new Vector(mouse.offsetX, mouse.offsetY));
    
		//=============================================================================
    
    this.div_toolbar = document.createElement("div");
    this.div_toolbar.style.display = "inline-block";
    this.div_toolbar.style.position = "relative";
    this.tabPanelElement.appendChild(this.div_toolbar);
    
		//=============================================================================
    
    this.button_clear = document.createElement("button");
    this.button_clear.className = "mdl-button mdl-js-button mdl-button--accent mdl-button--icon mdl-js-ripple-effect";
    this.button_clear.style.display = "inline-block";
    this.button_clear.style.width = "60px";
    this.button_clear.style.height = "60px";
    this.button_clear.style.minWidth = "initial";
    this.button_clear.innerHTML = `<i class="material-icons" style="font-size: 40px;
																																		width: initial; height: initial;
																																		transform: translate(-50%, -50%)">clear</i>`;
    this.div_toolbar.appendChild(this.button_clear);
    componentHandler.upgradeElement(this.button_clear);
    
    this.button_clear.onclick = () => this.shape = [];
    
		//=============================================================================
    
    this.button_undo = document.createElement("button");
    this.button_undo.className = "mdl-button mdl-js-button mdl-button--accent mdl-button--icon mdl-js-ripple-effect";
    this.button_undo.style.display = "inline-block";
		this.button_undo.style.width = "60px";
    this.button_undo.style.height = "60px";
    this.button_undo.style.marginLeft = "10px";
    this.button_undo.style.minWidth = "initial";
    this.button_undo.innerHTML = `<i class="material-icons" style="font-size: 40px;
																																	 width: initial; height: initial;
																																	 transform: translate(-50%, -50%)">undo</i>`;
    this.div_toolbar.appendChild(this.button_undo);
    componentHandler.upgradeElement(this.button_undo);

    this.button_undo.onclick = () => this.shape.pop();
  }
  
	//=============================================================================
  
  update () {
    if (!super.update()) return;
    
		//=============================================================================
    
    this.div_toolbar.style.bottom = (innerHeight - tabBar.clientHeight - 20) + "px";
    
		//=============================================================================
    
    this.brush.fillStyle = "#c5c5c5";
    this.brush.fillText("Click to add shape points.", this.canvas.width*0.5, this.canvas.height*0.5);
    
		//=============================================================================
    
    var center = new Vector();

    this.brush.beginPath();
    for (let a = 0; a < this.shape.length; a++) {
    	center.add(this.shape[a]);

      if (a == 0) {
      	this.brush.moveTo(this.shape[a].x, this.shape[a].y);
      }
      else {
      	this.brush.lineTo(this.shape[a].x, this.shape[a].y);
      }
    }
    this.brush.closePath();
    this.brush.stroke();

    center.divide(this.shape.length);
		this.brush.beginPath();
    this.brush.arc(center.x, center.y, 6, 0, Math.PI*2);
    this.brush.fill();
  }
  
  generateDividedShape () {
    var center = new Vector();
    for (let a = 0; a < this.shape.length; a++) {
    	center.add(this.shape[a]);
    }
    center.divide(this.shape.length);
      
		//=============================================================================
    
    this.shape_divided = [];
    
    for (let a = 0; a < Math.PI*2; a += Math.PI*2 / (NUMBER_OF_SHAPE_POINTS - 1)) {
      let ray = new Vector(Math.cos(a), Math.sin(a));
      for (let b = 0; b < this.shape.length; b++) {
				let intersectionData = getRayLineIntersectionData(this.shape[b], (b == this.shape.length - 1) ? this.shape[0] : this.shape[b+1], center, center.getAdded(ray));
				if (intersectionData.isIntersecting) {
        	this.shape_divided.push(intersectionData.intersectionPoint);
          break;
        }
      }
    }
  }
};

var shapeInput_0 = new ShapeInput("tab_shapeInput_0");
var shapeInput_1 = new ShapeInput("tab_shapeInput_1");

//=============================================================================

class ShapeMorphing extends TabPanel {
	constructor (tabID) {
    super(tabID);
    
		//=============================================================================
    
    this.currentShape = [];
    this.currentTargetShape = [];
  }
  
	//=============================================================================
  
  initializeShapeAnimation() {
		shapeInput_0.generateDividedShape();
    shapeInput_1.generateDividedShape();
      
    this.currentShape = [];
    for (let a = 0; a < shapeInput_0.shape_divided.length; a++) {
      var objectToAdd = shapeInput_0.shape_divided[a].getCopy();
      objectToAdd.velocity = new Vector();
      this.currentShape.push(objectToAdd);
    }
    this.currentTargetShape = shapeInput_1.shape_divided;
    
    frameCount = 1;
  }
  
	//=============================================================================
	
  update () {
    if (!super.update()) return;
    
    if (this.wasOpened) {
    	this.initializeShapeAnimation();
    }

    if (frameCount % ANIMATION_BOUNCE_FREQUENCY == 0) {
    	if (this.currentTargetShape == shapeInput_0.shape_divided) {
      	this.currentTargetShape = shapeInput_1.shape_divided;
      }
      else {
      	this.currentTargetShape = shapeInput_0.shape_divided;
      }
    }
    
    this.brush.beginPath();
    for (let a = 0; a < this.currentShape.length; a++) {
      let point = this.currentShape[a];
      point.velocity.add(this.currentTargetShape[a].getSubtracted(point).getMultiplied(ANIMATION_SPEED).getSubtracted(point.velocity).getMultiplied(ANIMATION_STEERING_SPEED));
      point.add(point.velocity);

      if (a == 0) {
      	this.brush.moveTo(point.x, point.y);
      }
      else {
      	this.brush.lineTo(point.x, point.y);
      }
    }
    this.brush.closePath();
    this.brush.stroke();
  }
};

var shapeMorphing = new ShapeMorphing("tab_shapeMorphing");

//=============================================================================

function update () {
  shapeInput_0.update();
  shapeInput_1.update();
  shapeMorphing.update();
  
	//=============================================================================
	
  frameCount++;
  requestAnimationFrame(update);
} update();