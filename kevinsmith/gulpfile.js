'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');

gulp.task('testing', function(){
  return gulp.src('test/router_test.js', {read:false})
  .pipe(mocha());
});

gulp.task('lint', function (){
  return gulp.src(['*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('watch', function (){
  gulp.watch(['*.js', 'test/*.js'], ['lint']);
  gulp.watch(['test/router_test.js', 'router.js' ], ['testing']);
});

gulp.task('default', ['testing', 'lint', 'watch']);