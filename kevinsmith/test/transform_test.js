'use strict';

process.argv[2] = 'non-palette-bitmap.bmp';
var fs = require('fs')
var chai = require('chai');
var expect =  require('chai').expect;
var transform = require(__dirname + '/../transform');



describe('Testing the transform.js file'), function (){
  before('Clear output file', () =>{
    fs.readdir('./', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    })
  })
  // it('Should return "BM"'), function() {
  //   expect(true).to.equal(false);
  // };
};

