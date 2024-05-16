/*
document.getElementById("clearButton").onclick = function() {
    food = [];
}

document.getElementById("centerButton").onclick = function() {
    target.x = window.innerWidth / 2;
    target.y = window.innerHeight / 2;
}
*/
var chainLength = 200;
var facingDir = 0;
var targetDir = 0;
var speed = 0;
var targetSpeed = 0;
var speedChangeInterval = 0;
var food = [];
var nomCounter=0;
var nomSound = new Audio('res/nom2.mp3');
var sound=true;
var start=true;
var secondsAlive=0;
var trail=[];
var maxtrail=10000;
function updateSecondsAlive() {
    secondsAlive++;
}
setInterval(updateSecondsAlive, 1000);
function toggleConnectome() {
    document.getElementById("nodeHolder").style.opacity = document.getElementById("connectomeCheckbox").checked ? "1" : "0";
}

function toggleSound() {
    sound = document.getElementById("soundCheckbox").checked;
}
BRAIN.setup();
for (var ps in BRAIN.connectome) {
    var nameBox = document.createElement('span');
    nameBox.innerHTML = ps;
    nameBox.style.color = "white";
    nameBox.style.fontSize = "10px"; // Set font size
    if (["RIML", "RIMR", "RICL", "RICR"].includes(ps)) {
        nameBox.style.color = "red"; // Change the color of innerHTML
    }
    if (["PVDL", "PVDR"].includes(ps)) {
        nameBox.style.color = "yellow"; // Change the color of innerHTML
    }
    if (["ASEL", "ASER"].includes(ps)) {
        nameBox.style.color = "green"; // Change the color of innerHTML
    }

    //nameBox.id = ps;
    //nameBox.className = "brainNodeName";
    nameBox.cols = 3;
    nameBox.rows = 1;
    nameBox.id = ps;
    nameBox.className = "brainNode";
    document.getElementById("nodeHolder").appendChild(nameBox);

    //var newBox = document.createElement('span');
    //newBox.cols = 3;
    //newBox.rows = 1;
    //newBox.id = ps;
    //newBox.className = "brainNode";
    //document.getElementById("nodeHolder").appendChild(newBox);
}

function updateBrain() {
    BRAIN.update();
    for (var ps in BRAIN.connectome) {
        var psBox = document.getElementById(ps);
        var neuron = BRAIN.postSynaptic[ps][BRAIN.thisState];

        psBox.style.backgroundColor = "rgba(85, 255, 85, " + Math.min(1, neuron / 50) + ")";
        psBox.style.opacity = 1;
    }
    let scalingFactor = 20;
    let newDir = ((BRAIN.accumleft - BRAIN.accumright) / scalingFactor);
    targetDir = facingDir + (newDir * Math.PI);
    //targetDir = facingDir + calculateFinalDirection(BRAIN.accumleft/200, BRAIN.accumright/200);
    targetSpeed = (Math.abs(BRAIN.accumleft) + Math.abs(BRAIN.accumright)) / (scalingFactor*5);
    speedChangeInterval = (targetSpeed - speed) / (scalingFactor*1.5);
}

BRAIN.randExcite();
setInterval(updateBrain, 500);

function calculateFinalDirection(leftPercentage, rightPercentage) {
    const maxTurnAngle = Math.PI / 2; // 90 degrees in radians
    const leftTurnAngle = leftPercentage * maxTurnAngle;
    const rightTurnAngle = rightPercentage * maxTurnAngle;
    
    const finalDirection = rightTurnAngle - leftTurnAngle;
    
    return finalDirection;
  }

//http://jsfiddle.net/user/ARTsinn/fiddles/

/* IK Segment */

var IKSegment = function(size, head, tail) {

    this.size = size;
    this.head = head || {
        x: 0.0,
        y: 0.0
    };
    this.tail = tail || {
        x: this.head.x + size,
        y: this.head.y + size
    };

    this.update = function() {

        // Position derivitives
        var dx = this.head.x - this.tail.x;
        var dy = this.head.y - this.tail.y;

        var dist = Math.sqrt(dx * dx + dy * dy);
        var force = 0.5 - this.size / dist * 0.5;
        var strength = 0.998; // No springiness

        force *= 0.99;

        var fx = force * dx;
        var fy = force * dy;

        this.tail.x += fx * strength * 2.0;
        this.tail.y += fy * strength * 2.0;
        this.head.x -= fx * (1.0 - strength) * 2.0;
        this.head.y -= fy * (1.0 - strength) * 2.0;
    };
};

/* IK Chain */

var IKChain = function(size, interval) {

    this.links = new Array(size);

    this.update = function(target) {

        var link = this.links[0];

        link.head.x = target.x;
        link.head.y = target.y;

        for (var i = 0, n = this.links.length; i < n; ++i) {
            this.links[i].update();
        }
    };

    var point = {
        x: 0,
        y: 0
    };

    for (var i = 0, n = this.links.length; i < n; ++i) {
        var link = this.links[i] = new IKSegment(interval, point);
        link.head.x = Math.random() * 500;
        link.head.y = Math.random() * 500;
        link.tail.x = Math.random() * 500;
        link.tail.y = Math.random() * 500;
        point = link.tail;
    }
};

/* Test */

function circle(ctx, x, y, r, c) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    if (c) {
        ctx.fillStyle = c;
        ctx.fill();
    } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
    }
}

function line(ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(255,182,193,0.5)';
    ctx.stroke();
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", addFood, false);

function addFood(event) {
    var x = event.x;
    var y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    food.push({ "x": x, "y": y ,"size": 1});
}
function randomFood(){
    if (food.length == 0) {
        var x = Math.random()*canvas.width;
        var y = Math.random()*canvas.height;
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        food.push({ "x": x, "y": y,"size": 1});

    }
    if (Math.random() < 0.1)  {
        
        var mother = food[Math.floor(Math.random()*food.length)];
        var x = mother.x;
        var y = mother.y;
        x += Math.random()*100-50;
        y += Math.random()*100-50;
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        food.push({ "x": x, "y": y,"size": 1});
    }
    if (food.length > 1000) {
        food.splice(0, 1);
    }
   
}
setInterval(randomFood, 100);

function drawFood() {
    for (var i = 0; i < food.length; i++) {
        if (food[i].size < 10) {
            food[i].size += 0.5;
        }
        circle(ctx, food[i].x, food[i].y, food[i].size, 'rgba(251,192,45,0.5)');
    }
}

var target = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};

var chain = new IKChain(chainLength, 1);

function update() {

    speed += speedChangeInterval;

    var facingMinusTarget = facingDir - targetDir;
    var angleDiff = facingMinusTarget;

    if (Math.abs(facingMinusTarget) > 180) {
        if (facingDir > targetDir) {
            angleDiff = -1 * ((360 - facingDir) + targetDir);
        } else {
            angleDiff = (360 - targetDir) + facingDir;
        }
    }

    if (angleDiff > 0) {
        facingDir -= 0.1;
    } else if (angleDiff < 0) {
        facingDir += 0.1;
    }

    target.x += (Math.cos(facingDir) * speed);
    target.y -= (Math.sin(facingDir) * speed);

    // Prevent x from going off the screen
    if (target.x < 0) {
        target.x = 0;
        BRAIN.stimulateNoseTouchNeurons = true;
    } else if (target.x > window.innerWidth) {
        target.x = window.innerWidth;
        BRAIN.stimulateNoseTouchNeurons = true;
    }

    // Prevent y from going off the screen
    if (target.y < 0) {
        target.y = 0;
        BRAIN.stimulateNoseTouchNeurons = true;
    } else if (target.y > window.innerHeight) {
        target.y = window.innerHeight;
        BRAIN.stimulateNoseTouchNeurons = true;
    }

    for (var i = 0; i < food.length; i++) {
        if (Math.hypot(Math.round(target.x) - food[i].x, Math.round(target.y) - food[i].y) <= 50) {
            // simulate food sense if food nearby
            BRAIN.stimulateFoodSenseNeurons = true;

            if (Math.hypot(Math.round(target.x) - food[i].x, Math.round(target.y) - food[i].y) <= 20) {
                // eat food if close enough
                food.splice(i, 1);
                nomCounter++;
                if (sound) {
                    nomSound.play();
                    
                }
            }
        }
    }

    setTimeout(function() {
        BRAIN.stimulateHungerNeurons = true;
        BRAIN.stimulateNoseTouchNeurons = false;
        BRAIN.stimulateFoodSenseNeurons = false;
    }, 2000);

    // Update IK chain
    chain.update(target);
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawTrail();
    circle(ctx, target.x, target.y, 5, 'rgba(255,182,193,0.1)');

    var link = chain.links[0];
    var p1 = link.head,
        p2 = link.tail;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.strokeStyle = "rgb(255,182,193)";
    ctx.lineWidth = 20;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    var x=p1.x;
    var y=p1.y;

    for (var i = 0, n = chain.links.length; i < n; ++i) {
        link = chain.links[i];
        p1 = link.head;
        p2 = link.tail;
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();



    // Draw the bow emoji at coordinates (p1.x, p1.y)
    ctx.font = '20px sans-serif'; // Set font size and family
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);
    ctx.fillText('🎀', x, y);

    
    // Save the current state of the canvas context
    ctx.save();

    // Set the text style
    ctx.fillStyle = "rgba(128, 128, 128, 0.5)"; // Gray color with reduced opacity
    ctx.font = "50px sans-serif"; // Set font size and family

    // Determine the position to center the text
    //var text = "noms: " + nomCounter;
    //var textWidth = ctx.measureText(text).width;
    //var centerX = canvas.width / 2 - textWidth / 2;
    //var centerY = canvas.height / 2;

    // Draw the number at the calculated position
    //ctx.fillText(text, centerX, centerY);

    var nomValueElement = document.getElementById("nomValue");
    nomValueElement.textContent = nomCounter; // Change "5" to whatever number you want to display

    // Restore the canvas context to its original state
    ctx.restore();

}


(function resize() {
    var mx = window.innerWidth/canvas.width;
    var my = window.innerHeight/canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.onresize = resize;
    for (var i = 0; i < food.length; i++) {
        food[i].x *= mx;
        food[i].y *= my;
    }
    if (start == false) {//error when "resizing" first time as it is opening the page, this way it doesn't run on start
        target.x *= mx;
        target.y *= my;
        
    }else {
        start = false;
    }


}());


setInterval(function() {
    update();
    draw();
}, 1e3 / 60);

// Function to update age
// Function to update age
// Function to update age
function updateAge() {
    var ageElement = document.getElementById("ageValue");
    var now = new Date();
    var ageInSeconds = secondsAlive;

    var years = Math.floor(ageInSeconds / (365 * 24 * 60 * 60));
    var days = Math.floor(ageInSeconds % (365 * 24 * 60 * 60) / (24 * 60 * 60));
    var hours = Math.floor(ageInSeconds % (24 * 60 * 60) / (60 * 60));
    var minutes = Math.floor(ageInSeconds % (60 * 60) / 60);
    var seconds = Math.floor(ageInSeconds % 60);

    var ageString = "";

    if (years === 1) {
        ageString += "1 year ";
    } else if (years > 1) {
        ageString += years + " years ";
    }

    if (days === 1) {
        ageString += "1 day ";
    } else if (days > 1) {
        ageString += days + " days ";
    }

    if (hours === 1) {
        ageString += "1 hour ";
    } else if (hours > 1) {
        ageString += hours + " hours ";
    }

    if (minutes === 1) {
        ageString += "1 minute ";
    } else if (minutes > 1) {
        ageString += minutes + " minutes ";
    }

    if (seconds === 1 ) {
        ageString += "1 second";
    } else if (seconds > 1) {
        ageString += seconds + " seconds";
    }

    ageElement.textContent = ageString;



}



updateAge();

// Update age every second
setInterval(updateAge, 1000);

function updateTrail() {
    if (food.length > 0) {
    trail.push({ x: chain.links[chain.links.length - 1].tail.x, y: chain.links[chain.links.length - 1].tail.y });
    }
    if (trail.length > maxtrail) {
        trail.shift();
    }
}
updateTrail();
setInterval(updateTrail, 10);
function drawTrail() {
    
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 20;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.moveTo(trail[0].x, trail[0].y);
    for (var i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
        
    }
    ctx.stroke();
    ctx.closePath();
}
