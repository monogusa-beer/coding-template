const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sassGlob = require('gulp-sass-glob');
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");

// scssのコンパイル
gulp.task('sass', function () {
	return gulp
		.src('./src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(sassGlob())
		.pipe(sass({
			outputStyle: 'expanded'
		}))
		.pipe(postcss([autoprefixer()]))
		.pipe(postcss([cssdeclsort({ order: 'alphabetical' })]))
		.pipe(gulp.dest('./src/css'))
		.pipe(sourcemaps.write('./src/css'));
});

// 保存時のリロード
gulp.task('browser-sync', function (done) {
	browserSync.init({
		server: {
			baseDir: "./",
			index: "index.html"
		}
	});
	done();
});

gulp.task('bs-reload', function (done) {
	browserSync.reload();
	done();
});

gulp.task("ejs", (done) => {
	gulp
		.src(["ejs/**/*.ejs", "!" + "ejs/**/_*.ejs"])
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(rename({ extname: ".html" }))
		.pipe(gulp.dest("./"));
	done();
});

// 監視
gulp.task('watch', function (done) {
	gulp.watch('./*.html', gulp.task('bs-reload'));
	gulp.watch('./src/scss/**/*.scss', gulp.task('sass'));
	gulp.watch('./src/scss/**/*.scss', gulp.task('bs-reload'));
	gulp.watch('./src/js/*.js', gulp.task('bs-reload'));
	gulp.watch('./ejs/**/*.ejs', gulp.task('ejs'));
	gulp.watch('./ejs/**/*.ejs', gulp.task('bs-reload'));
});

// default
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));

//圧縮率の定義
const imageminOption = [
	pngquant({ quality: [70 - 85], }),
	mozjpeg({ quality: 85 }),
	imagemin.gifsicle({
		interlaced: false,
		optimizationLevel: 1,
		colors: 256
	}),
	imagemin.mozjpeg(),
	imagemin.optipng(),
	imagemin.svgo()
];

// 画像の圧縮
gulp.task('imagemin', function () {
	return gulp
		.src('./src/img/base/*.{png,jpg,gif,svg}')
		.pipe(imagemin(imageminOption))
		.pipe(gulp.dest('./src/img'));
});