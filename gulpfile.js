var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');

var p = require('gulp-load-plugins')({
    DEBUG: false,
    pattern: ['gulp-*', 'gulp.*'],
    scope: ['devDependencies'],
    replaceString: /^gulp(-|\.)/,
    camelize: true,
    lazy: true
});

var dir = {
    source: 'parking_tea/static_src',
    build: 'parking_tea/static',
    temp: 'parking_tea/static_src/temp'
};

var logErrorHandler = function (err) {
    console.log(err);
    p.notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);
    this.emit('end');
};

// JavaScript - concat, minify
gulp.task('scripts', function() {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(p.plumber({ errorHandler: logErrorHandler }))
        .pipe(p.addSrc(dir.source + '/js/**/*.js'))
        .pipe(p.concat('bundle.js'))
        .pipe(p.minify({
            compress: {'drop_console': true},
            noSource: true,
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest(dir.build));
});

// CSS - concat, minify, sass, autoprefix, sourcemaps
gulp.task('styles', function() {
    return gulp.src(mainBowerFiles('**/*.css'))
        .pipe(p.plumber({ errorHandler: logErrorHandler }))
        .pipe(p.addSrc(dir.temp + '/css/*'))
        .pipe(p.addSrc(dir.source + '/sass/*.scss'))
        .pipe(p.order(['bower_components/**/*', '*.*', 'main.scss'], {base: '.'}))
        .pipe(p.sourcemaps.init())
        .pipe(p.concat('bundle.min.scss'))
        .pipe(p.sass.sync({outputStyle: 'compressed'}).on('error', p.sass.logError))
        .pipe(p.autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(p.sourcemaps.write('./'))
        .pipe(gulp.dest(dir.build))
        .pipe(browserSync.reload({stream: true}));
});

// // kopirovanie html
// gulp.task('markup', function() {
//     return gulp.src([dir.django + '/**/templates/**/*.html-gulp'])
//         .pipe(p.plumber({ errorHandler: logErrorHandler }))
//         .pipe(p.htmlmin({
//             collapseWhitespace: true,
//             ignoreCustomFragments: [ /\{\%.*\%\}/, /\{#.*#\}/ ],
//             removeComments: true}))
//         .pipe(p.rename(function (path) {
//             path.extname = '.html'
//         }))
//         .pipe(gulp.dest(dir.django));
// });

// // kopirovanie a minifikovanie obrazkov
// gulp.task('images', function() {
//     return gulp.src(dir.source + '/img/**/*')
//         .pipe(p.imagemin({progressive: true}))
//         .pipe(gulp.dest(dir.build + '/img'));
// });

// Static Server from browser-sync
gulp.task('browser-sync', function() {
    browserSync({
        proxy: 'http://localhost:5000'
    });
});

// tasky, ktore zabezpecia, ze sa browser obnovi (reload) az ked sa dokonci prvy task
gulp.task('scripts-watch', ['scripts'], browserSync.reload);
gulp.task('styles-watch', ['styles'], browserSync.reload);
gulp.task('browser-reload', [], browserSync.reload);


// predvolena uloha
gulp.task('default', ['styles', 'scripts', 'browser-sync'], function() {
    gulp.watch([dir.source + '/sass/**/*.scss'], ['styles-watch']);
    gulp.watch([dir.source + '/js/**/*.js'], ['scripts-watch']);
    gulp.watch([dir.source + '/../templates/**/*.html'], ['browser-reload']);
});