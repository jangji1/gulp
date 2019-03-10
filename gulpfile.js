const gulp = require("gulp");
const browserSync = require("browser-sync");
const htmlLint = require("gulp-htmllint");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const uglifyJS = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const spritesmith = require(`gulp.spritesmith`);
const merge = require("merge-stream");
const imagemin = require("gulp-imagemin");

const webserver = () => {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
};

const html = () => {
  return gulp
    .src("source/**/*.html", { since: gulp.lastRun(html) })
    .pipe(htmlLint())
    .pipe(gulp.dest("dist"));
};

const css = () => {
  return gulp
    .src("source/css/**/*.css", { since: gulp.lastRun(css) })
    .pipe(
      postcss([
        autoprefixer({ browsers: ["last 2 version", "ie >= 9"] }),
        cssnano
      ])
    )
    .pipe(gulp.dest("dist/css"));
};

const scss = () => {
  return gulp
    .src("source/sass/**/*.scss", { since: gulp.lastRun(scss) })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(postcss([autoprefixer]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/css"));
};

const js = () => {
  return gulp
    .src("source/js/**/*.js", { since: gulp.lastRun(js) })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglifyJS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/js"));
};

const image = () => {
  return gulp
    .src(["source/images/**", "!source/images/sprite/**"], {
      since: gulp.lastRun(image)
    })
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"));
};

const sprite = () => {
  const spriteData = gulp
    .src("source/images/sprite/*.{png,jpg,gif}", {
      since: gulp.lastRun(sprite)
    })
    .pipe(
      spritesmith({
        imgName: "sprite.png",
        cssName: "sprite.css",
        imgPath: "../images/sprite.png",
        padding: 8
      })
    );
  const imgStream = spriteData.img.pipe(gulp.dest("dist/images"));
  const cssStream = spriteData.css.pipe(gulp.dest("dist/css"));

  return merge(imgStream, cssStream);
};

const watch = () => {
  gulp.watch("source/**/*.html", html).on("change", browserSync.reload);
  gulp.watch("source/**/*.css", css).on("change", browserSync.reload);
  gulp.watch("source/**/*.scss", scss).on("change", browserSync.reload);
  gulp.watch("source/**/*.js", js).on("change", browserSync.reload);
  gulp.watch(["source/images/**", "!source/images/sprite/**"], image);
};

exports.default = gulp.series(
  gulp.parallel(html, css, scss, sprite, image, js),
  gulp.parallel(webserver, watch)
);
