/*
 Uninstall previous Gulp installation and related packages, if any
 npm rm gulp -g
 npm rm gulp-cli -g
 cd [your-project-dir/]
 npm rm gulp --save-dev
 npm rm gulp --save
 npm rm gulp --save-optional
 npm cache clean
 Install the latest Gulp CLI tools globally
 npm install gulpjs/gulp-cli -g
 Install Gulp 4 into your project as dev dependency
 npm init -y   все параметры по умолчанию
 npm install --save-dev gulp gulp-file-include        // html
 npm install --save-dev gulp-connect gulp-livereload   server
 npm install --save-dev gulp-sass gulp-autoprefixer gulp-clean-css gulp-sourcemaps   // css
 npm install --save-dev gulp-babel @babel/core @babel/preset-env gulp-concat   // js
 npm install --save-dev gulp-rename gulp-uglify   // jsMin
 npm install --save-dev gulp-imagemin   imagemin


 gulp -v
 CLI version 2.0.1
 Local version 4.0.0
 */
"use strict";
const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');
const connect = require('gulp-connect');
const imagemin = require('gulp-imagemin');

const options = {
  src: {
    html: ['src/*.html', '!src/test.html'],
    style: 'src/scss/*.scss',
    js: 'src/js/*.js',
    img: 'src/img/*'
  },
  watch: {
    html: ['src/*.html', 'src/modules/*.html'],
    style: 'src/scss/**/*.scss',
    js: 'src/js/*.js',
    img: 'src/img/*'
  },
  build: {
    html: 'build/',
    style: 'build/css/',
    js: 'build/js/',
    img: 'build/img/'
  }
};

//-----HTML-----
function layout() {
  return gulp.src(options.src.html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(options.build.html))
    .pipe(connect.reload());
}
//-----Style-----
function style() {
  return gulp.src(options.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer({}))
    .pipe(cleanCSS({level:2}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(options.build.style))
    .pipe(connect.reload());
}
//-----JavaScript-----
function script() {
  return gulp.src(options.src.js)
    .pipe(concat('main.js'))
    .pipe(babel({presets:['@babel/env']}))
    .on('error', function(err) {
      console.log('[Compilation Error]');
      console.log(err.fileName + ( err.loc ? `( ${err.loc.line}, ${err.loc.column} ): ` : ': '));
      console.log('error Babel: ' + err.message + '\n');
      console.log(err.codeFrame);
      this.emit('end');
    })
    .pipe(gulp.dest(options.build.js))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({toplevel: true}))
    .pipe(gulp.dest(options.build.js))
    .pipe(connect.reload());
}
//-----img-----
function img() {
  return gulp.src(options.src.img)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true }))
    .pipe(gulp.dest(options.build.img));
}
//-----watch-----
function watch() {
  connect.server({
    root: 'build',
    livereload: true
  });
  gulp.watch(options.watch.html, layout);
  gulp.watch(options.watch.style, style);
  gulp.watch(options.watch.js, script);
}
gulp.task('build', gulp.parallel(layout, style, script));
gulp.task('default', gulp.series('build', watch));