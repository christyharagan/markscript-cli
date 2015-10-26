var gulp = require('gulp')
var ts = require('gulp-typescript')
var eol = require('gulp-eol')

gulp.task('default', function(){
  var tsProject = ts.createProject('./tsconfig.json')

  tsProject
    .src()
    .pipe(ts(tsProject))
    .js
    .pipe(eol('\n'))
    .pipe(gulp.dest('.'))
})
