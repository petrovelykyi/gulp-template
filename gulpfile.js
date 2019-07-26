const gulp = require('gulp'),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      include = require('gulp-include'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify-es').default,
      image = require('gulp-image'),
      clean = require('gulp-clean'),
      browserSync = require('browser-sync');

const path = {
    build: {
        html:  'build',
        css:   'build/css/',
        js:    'build/js/',
        fonts: 'build/fonts/',
        img:   'build/img/'
    },
    src: {
        html:  'src/index.html',
        scss:  'src/scss/**/*.scss',
        js:    'src/js/script.js',
        watch: 'src/js/**/*.js',
        fonts: 'src/fonts/**/*',
        img:   'src/img/**/*'
    },
    clean: 'build'
};

// *.html
const htmlBuild = () => {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream())
};

// *.scss
const scssBuild = () => {
    return gulp.src(path.src.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({overrideBrowserslist: ['last 100 versions'], cascade: false}))
        .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream())
};

// Fonts
const fontsBuild = () => {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
};

// *.js
const jsBuild = () => {
    return gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(include()).on('error', console.log)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream())
};

// Images
const imgBuild = () => {
    return gulp.src(path.src.img)
        .pipe(image({
            optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
            pngquant: ['--speed=1', '--force', 256],
            zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
            mozjpeg: ['-optimize', '-progressive'],
            guetzli: ['--quality', 85],
            gifsicle: ['--optimize'],
            svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
        }))
        .pipe(gulp.dest(path.build.img));
};

// clean ./build
const cleanBuild = () => {
    return gulp.src(path.clean, {read: false, allowEmpty: true})
        .pipe(clean())
};

// liveReload
const watcher = () => {
    browserSync.init({
    server:{
        baseDir: './build'
    }
    });
    gulp.watch(path.src.html, htmlBuild).on('change', browserSync.reload);
    gulp.watch(path.src.scss, scssBuild).on('change', browserSync.reload);
    gulp.watch(path.src.watch, jsBuild).on('change', browserSync.reload);
    gulp.watch(path.src.fonts, fontsBuild).on('change', browserSync.reload);
    gulp.watch(path.src.img, imgBuild).on('change', browserSync.reload);
};

/* TASKS*/
gulp.task('clean',  cleanBuild);
gulp.task('html',   htmlBuild);
gulp.task('scss',   scssBuild);
gulp.task('jsProd', jsBuild);
gulp.task('fonts',  fontsBuild);
gulp.task('img',    imgBuild);


const gulpSeries = [
    cleanBuild,
    htmlBuild,
    scssBuild,
    jsBuild,
    fontsBuild,
    imgBuild
];


/* Prod */
gulp.task('build', gulp.series(...gulpSeries));

/* Dev */
gulp.task('default', gulp.series(...gulpSeries, watcher));