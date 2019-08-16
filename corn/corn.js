var NUMBER_OF_CORNS = 180,
    CORN_SCALE = 0.4;

var World = Matter.World,
    Engine = Matter.Engine,
    Bodies = Matter.Bodies;

var engine = Engine.create();
engine.world.gravity.y = 1;
engine.positionIterations = 10;
engine.velocityIterations = 5;
engine.enableSleeping = true;

var mouseConstraint = Matter.MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);

class Corn {
    constructor() {
        this.imageElement = document.createElement("img");
        this.imageElement.src = "corn.png";
        document.body.appendChild(this.imageElement);

        var that = this;
        this.imageElement.onload = function () {
            that.body = Bodies.rectangle(
                Math.random() * window.innerWidth * 0.5 + window.innerWidth * 0.25,
                Math.random() * window.innerHeight * 0.5,
                that.imageElement.clientWidth * CORN_SCALE,
                that.imageElement.clientHeight * CORN_SCALE,
                {
                    chamfer: { radius: 10 },
                    restitution: 0.6,
                    friction: 0.1
                }
            );
            World.add(engine.world, that.body);
        }
    }
    updateImage() {
        this.imageElement.style.left = this.body.position.x + "px";
        this.imageElement.style.top = this.body.position.y + "px";
        this.imageElement.style.transform = "translateX(-50%) translateY(-50%) rotate(" + this.body.angle + "rad) scale(" + CORN_SCALE + ")";
    }
} var corns = [];
for (var a = 0; a < NUMBER_OF_CORNS; a++) corns.push(new Corn());

mouseConstraint.body = corns[0].body;

function createBoundary(x, y, w, h, rounding) {
    var divElement = document.createElement("div");
    divElement.style.left = x - w * 0.5 + "px", divElement.style.top = y - h * 0.5 + "px", divElement.style.width = w + "px", divElement.style.height = h + "px";
    divElement.style.borderRadius = rounding + "px";
    document.body.appendChild(divElement);
    World.add(engine.world, Bodies.rectangle(x, y, w, h, { isStatic: true, chamfer: { radius: rounding } }));
}

createBoundary(window.innerWidth * 0.5, window.innerHeight, window.innerWidth * 0.7, 100, 0);
createBoundary(window.innerWidth * 0.15, window.innerHeight - 300, 50, 700, 10);
createBoundary(window.innerWidth * 0.85, window.innerHeight - 300, 50, 700, 10);
createBoundary(window.innerWidth * 0.5, window.innerHeight - 300, window.innerWidth*0.3, 50, 20);

function update() {
    Engine.update(engine);
    for (var a = 0; a < corns.length; a++) {
        corns[a].updateImage();
        if (corns[a].body.position.y > window.innerHeight)
            corns.splice(a, 1), a--;
    }
} setInterval(update, 1000 / 60);