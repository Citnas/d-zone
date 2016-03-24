'use strict';
var EventEmitter = require('events').EventEmitter;
var Canvas = require('./../common/canvas');

var canvases, backgroundColor, scale;

var events = new EventEmitter();

var canvasManager = {
    init: function(options) {
        backgroundColor = options.backgroundColor;
        canvases = [];
        for(var s = 1; s < 5; s++) {
            var newCanvas = new Canvas(1,1);
            newCanvas.canvas.canvasID = options.canvasID + s;
            document.body.appendChild(newCanvas.canvas);
            newCanvas.canvas.style.transform = 'scale(' + s + ', ' + s + ')';
            newCanvas.context.mozImageSmoothingEnabled = false;
            newCanvas.context.imageSmoothingEnabled = false;
            newCanvas.canvas.addEventListener("contextmenu", function(e) {
                e.preventDefault();
            });
            canvases.push(newCanvas);
        }
        setScale(options.initialScale);
    },
    events: events
};

function setScale(sc) {
    scale = sc;
    for(var s = 0; s < canvases.length; s++) {
        if(s+1 == scale) {
            canvases[s].canvas.style.zIndex = 5;
            canvasManager.canvas = canvases[s];
        } else {
            canvases[s].canvas.style.zIndex = 1;
        }
    }
    resize();
}

function resize() {
    canvasManager.canvas.setSize(Math.ceil(window.innerWidth / scale), Math.ceil(window.innerHeight / scale));
    events.emit('canvas-update',canvasManager.canvas);
}

module.exports = canvasManager;