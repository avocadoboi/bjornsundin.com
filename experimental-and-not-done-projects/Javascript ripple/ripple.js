(function(){
    var RIPPLE_SPEED = 0.1;
    var RIPPLE_OPACITY = 0.5;
    var RIPPLE_END_SIZE = 2; // Ratio of max(width, height)

    var rippleElements = document.getElementsByClassName("ripple"); // Change the class name if you want to
    for (var a = 0; a < rippleElements.length; a++) {
        // Ripple parent element
        
        var rippleElement = rippleElements[a];

        rippleElement.style.overflow = "hidden"; // So our circle doesn't show outside of the border
        rippleElement.style.cursor = "pointer";

        // This is so that we can position the rippleCircle relative to the rippleElement (the parent)
        if (rippleElement.style.position != "absolute" && rippleElement.style.position != "relative"){
            rippleElement.style.position = "relative";
        }

        //---------------------
        // Ripple circle element

        var rippleCircle = document.createElement("div");
        rippleElement.appendChild(rippleCircle);

        rippleCircle.style.position = "absolute";
        rippleCircle.style.left = "0px";
        rippleCircle.style.top = "0px";
        rippleCircle.style.width = "0px";
        rippleCircle.style.height = "0px";
        rippleCircle.style.borderRadius = "50%";
        rippleCircle.style.backgroundColor = "white";
        rippleCircle.style.transform = "translateX(-50%) translateY(-50%)";

        //---------------------
        // Ripple animation variables

        var animationProgress = 0;
        var x = 0;
        var y = 0;
        var diameter = 0;
        var updateIntervalHandle;

        //---------------------
        // Ripple animation
        
        function updateRipple(){
            rippleCircle.style.opacity = (1 - Math.pow(Math.min(1, animationProgress + 0.02), 8))*RIPPLE_OPACITY;

            // Update position and size
            var rippleElementRect = rippleElement.getBoundingClientRect();
            var targetDiameter = Math.max(rippleElementRect.width, rippleElementRect.height)*RIPPLE_END_SIZE;

            x += (rippleElementRect.width*0.5 - x)*RIPPLE_SPEED;
            y += (rippleElementRect.height*0.5 - y)*RIPPLE_SPEED;

            diameter = (0.1 + animationProgress*0.9) * targetDiameter;

            rippleCircle.style.left = x + "px";
            rippleCircle.style.top = y + "px";
            rippleCircle.style.width = diameter + "px";
            rippleCircle.style.height = diameter + "px";

            //---------------------
            // Update animation progress

            animationProgress += (1 - animationProgress)*RIPPLE_SPEED;

            if (animationProgress > 0.999 && animationProgress != 1){
                animationProgress = 1;
            }
            else if (animationProgress == 1){
                clearInterval(updateIntervalHandle);
            }
        }

        rippleElement.addEventListener("mousedown", function(p_event) {
            var rippleElementRect = rippleElement.getBoundingClientRect();

            animationProgress = 0;
            x = p_event.clientX - rippleElementRect.left; // Because offsetX and offsetY didn't like me
            y = p_event.clientY - rippleElementRect.top;

            if (updateIntervalHandle != undefined){
                clearInterval(updateIntervalHandle);
            }
            updateIntervalHandle = setInterval(updateRipple, 1000/60);
        });
    }
})()