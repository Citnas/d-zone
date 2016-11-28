'use strict';
var Map2D = require('map2d');
var Map3D = require('map3d');

var width, height, depth;

addEventListener('message', function(event) {
    var data = event.data;
    if(!width) { // Map size not yet defined, so this must be the init message
        width = data[0];
        height = data[1];
        depth = data[2];
        return;
    }
    console.log('Path worker received job',event.data);
    data.collision = new Map2D(Uint8Array, width, height, depth, data.collision);
    data.startIndex = event.data.collision.indexFromXYZ(data.sx, data.sy, data.sz);
    data.destIndex = event.data.collision.indexFromXYZ(data.dx, data.dy, data.dz);
    postMessage([data.id, data.e, getPath(data)]);
});

// Path data stored in Uint16Array
// Bit  1     : XY distance (0 - 1)
// Bits 2-3   : XY Direction (north, east, south, west)
// Bit  4     : Z direction (down, up)
// Bits 5-10  : Z distance (0 - 63)
// Bits 11-16 : Unused

function getPath(job) {
    var path = new Path();
    var parentMap = new Map3D(Uint32Array, width, height);
    var ghMap = new Map3D(Uint32Array, width, height);
    ghMap.setIndex(job.start, calcH(job.sx, job.sy, job.dx, job.dy));
    var current = { x: job.sx, y: job.sy, z: job.sz, index: job.startIndex };
    
    return path.trim();
}

function calcH(ax, ay, bx, by) {
    var x = Math.abs(ax - bx), y = Math.abs(ay - by);
    return x > y ? 8 * y + 5 * x : 8 * x + 5 * y;
}

function Path() {
    this.pushIndex = 0;
    this.arr = new Uint16Array(4);
}

Path.prototype.push = function(int) {
    if(this.arr.length === this.pushIndex) {
        var newArr = new this.arr.constructor(this.arr.length * 2);
        newArr.set(this.arr);
        this.arr = newArr;
    }
    this.arr[this.pushIndex++] = int;
};

Path.prototype.trim = function() {
    return new this.arr.constructor(this.arr.buffer, 0, this.pushIndex);
};