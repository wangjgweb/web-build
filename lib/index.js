const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')
const bs = browserSync.create()

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()
// const plugins.sass = require('gulp-sass')
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')

const cwd = process.cwd();
let config = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}
try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({}, config, loadConfig)
} catch (e) {}

const style = () => {
  return src(config.build.paths.styles, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({stream: true}))
}

const script = () => {
  return src(config.build.paths.scripts, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.babel({presets: [require('@babel/preset-env')]}))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  return src(config.build.paths.pages, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.swig({data: config.data, defaults: {cache: false}}))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const extra = () => {
  return src('**', {base: config.build.public, cwd: config.build.public})
    .pipe(dest(config.build.dist))
}

const image = () => {
  return src(config.build.paths.fonts, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}
const font = () => {
  return src(config.build.paths.fonts, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const clean = () => {
  return del([config.build.dist, config.build.temp])
}




const serve = () => {
  watch(config.build.paths.styles,{cwd: config.build.src}, style)
  watch(config.build.paths.scripts,{cwd: config.build.src}, script)
  watch(config.build.paths.pages,{cwd: config.build.src}, page)

  // watch([
  //   'src/assets/images/**', 
  //   'src/assets/fonts/**', 
  //   'public/**'],bs.reload)

  watch([
    config.build.paths.images,
    config.build.paths.fonts
  ], {cwd: config.build.src}, bs.reload)

  watch('**', {cwd: config.build.public}, bs.reload)

  bs.init({
    notify: false,
    port: 2080,
    // files: 'dist/**',
    server: {
      // 资源查找路径
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
const useref = () => {
  return src(config.build.paths.pages, {base: config.build.temp, cwd: config.build.temp})
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist))
}
const complie = parallel(style, script, page)
const develop = series(complie, serve)
const build = series(clean, parallel(series(complie, useref), image, font, extra))

module.exports = {
  clean,
  build,
  develop,
}