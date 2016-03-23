'use strict';

const fs = require('fs');

// TO RUN: node transform.js Picture.bmp
var bitmap =fs.readFileSync(__dirname + '/' + process.argv[2]);

let bitmapData = {};

bitmapData.headField = bitmap.toString('ascii', 0, 2);
bitmapData.size = bitmap.readUInt32LE(2);
bitmapData.pixelArrayStart = bitmap.readUInt32LE(10);
bitmapData.width = bitmap.readUInt32LE(18);
bitmapData.height = bitmap.readUInt32LE(22);
bitmapData.Depth = bitmap.readUInt16LE(28);
var colorValues = 0;

if (bitmapData.Depth == 24) {
  colorValues = 3;
} else {
  colorValues = 4;
}

bitmapData.imageSize = bitmap.readUInt32LE(34);
bitmapData.paletteColors = bitmap.readUInt32LE(46);
bitmapData.numberOfPixels = bitmapData.width * bitmapData.height;
bitmapData.padding = (4 - (bitmapData.width * colorValues % 4)) % 4;
bitmapData.length = bitmap.length;

console.dir(bitmapData);

// Determine if it is a palette bitmap
if (bitmapData.pixelArrayStart == 54) {
  var paletteBitmap = false;
} else {
  var paletteBitmap = true;
}

// Create an array containging the locations of all padding values
var paddingValues = [];
for (var i=0; i <= bitmapData.padding - 1; i++){
  paddingValues.push(bitmapData.pixelArrayStart + colorValues * bitmapData.width + i);
}
for (var j=1; j<= bitmapData.height -1; j++){
  for (var i = 0; i <= bitmapData.padding - 1; i++){
    var newVal = paddingValues[i] + (colorValues * bitmapData.width + bitmapData.padding) * j;
    paddingValues.push(newVal);
  }
}


// Convert the buffer's PixelArray values to a JavaScript array without padding values 
var val = bitmapData.pixelArrayStart;
var newArray = [];
while (val < bitmap.length){
  if (paddingValues.indexOf(val) == -1){
    newArray.push(bitmap.readUIntLE(val));
  }
  val++;
}


// Convert into array of pixels- [b, g, r] or [a, b, g, r]
var pixelsFromArray = function (arr, colors) {
  var pixArray = [];
  for (i=0; i<=arr.length - 1; i = i + colors){
    var tempArray = [];
    for (j = 0; j < colors; j++){
      tempArray.push(arr[i + j]);
    }
    pixArray.push(tempArray);
  }
  return pixArray;
};


var pixelArray = pixelsFromArray(newArray, colorValues);

// Invert the colors
function invert(arr) {
  for (var j = 0; j < arr.length ; j++) {
    if (colorValues == 4) {
      for (var i = 1; i < 3; i++) {
        var index = arr[0].length - i ;
        arr[j][index] = 255 - arr[j][index];
      }
    } else {
      for (var i = 0; i < 3; i++) {
        arr[j][i] = 255 - arr[j][i];
      }
    }
  }
  return arr;
}


pixelArray = invert(pixelArray);


// Create new file after transformation

// Copy header from bitmap to the outputBitmap
var tempArray = [];
for (i=0; i < bitmapData.pixelArrayStart; i++) {
  tempArray.push(bitmap.readUIntLE(i));
}

// Append pixelArray to the output buffer
var paddingChar = 0;
for (var j = 0; j <= pixelArray.length - 1; j++) {
  for (var i = 0; i <= colorValues  - 1; i++) {
    if (paddingValues.indexOf(tempArray.length) !== -1) {
      tempArray.push(paddingChar);
      i = i - 1;
    } else {
      tempArray.push(pixelArray[j][i]);
    } // if
  } // for i
} // for j


// Push the final padding values onto tempArray
for (var i=1; i<=bitmapData.padding;i++){
  if (paddingValues.indexOf(tempArray.length) !== -1) {
    tempArray.push(paddingChar);
  } // if
} // for i


// Write each value in tempArray to a buffer
var bufOut = new Buffer(tempArray.length);
for (var i=0; i<tempArray.length; i++){
  bufOut[i] = tempArray[i];
}

// Write buffer to a file
fs.writeFileSync(__dirname + '/output.bmp', bufOut);