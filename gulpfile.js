const gulp = require("gulp");
const gulpSass = require("gulp-sass");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const sassGlob = require("gulp-sass-glob");
const browserSync = require("browser-sync");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssdeclsort = require("css-declaration-sorter");
const mqpacker = require("css-mqpacker");
const gulpEjs = require("gulp-ejs");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const gulpImagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");

const paths = {
  sass: {
    src: "./src/scss/style.scss",
    dist: "./dist/css",
  },
  images: {
    src: "./src/img/*.{png,jpg,gif,svg}",
    dist: "./dist/img",
  },
  ejs: {
    src: ["./src/ejs/**/*.ejs", "!" + "./src/ejs/**/_*.ejs"],
    dist: "./dist",
  },
  js: {
    src: "./src/js/script.js",
    dist: "./dist/js",
  },
};

// Sassのコンパイル
function sass() {
  return gulp
    .src(paths.sass.src, { sourcemaps: true })
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sassGlob())
    .pipe(gulpSass({ outputStyle: "expanded" }))
    .pipe(postcss([mqpacker()]))
    .pipe(postcss([cssdeclsort({ order: "alphabetical" })]))
    .pipe(
      postcss([
        autoprefixer({
          grid: true,
          cascade: false,
        }),
      ])
    )
    .pipe(gulp.dest(paths.sass.dist, { sourcemaps: "./" }));
}

// EJSのコンパイル
function ejs(done) {
  gulp
    .src(paths.ejs.src)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(gulpEjs())
    .pipe(rename({ extname: ".html" }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(gulp.dest(paths.ejs.dist));
  done();
}

// jsファイルのコピー
function copyJs(done) {
  gulp.src("./src/js/*.js").pipe(gulp.dest("./dist/js"));
  done();
}

// ブラウザシンク
function browsersync(done) {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "index.html",
    },
  });
  done();
}
// 保存時のリロード
function bsReload(done) {
  browserSync.reload();
  done();
}

//圧縮率の定義
const imageminOption = [
  pngquant({ quality: [0.7, 0.85] }),
  mozjpeg({ quality: 85 }),
  gulpImagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256,
  }),
  gulpImagemin.mozjpeg(),
  gulpImagemin.optipng(),
  gulpImagemin.svgo(),
];

// 画像の圧縮
function imagemin() {
  return gulp
    .src(paths.images.src)
    .pipe(gulpImagemin(imageminOption))
    .pipe(gulp.dest(paths.images.dist));
}

// 監視
function watch(done) {
  gulp.watch("./src/scss/**/*.scss", sass);
  gulp.watch("./src/scss/**/*.scss", bsReload);
  gulp.watch("./src/ejs/**/*.ejs", ejs);
  gulp.watch("./src/ejs/**/*.ejs", bsReload);
  gulp.watch("./src/js/*.js", copyJs);
  gulp.watch("./src/js/*.js", bsReload);
  done();
}

// exports
exports.default = gulp.series(
  sass,
  ejs,
  copyJs,
  gulp.parallel(browsersync, watch)
);
exports.sass = sass;
exports.ejs = ejs;
exports.copyJs = copyJs;
exports.browsersync = browsersync;
exports.bsReload = bsReload;
exports.imagemin = imagemin;
exports.watch = watch;
