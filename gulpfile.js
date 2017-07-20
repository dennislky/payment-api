const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const clean = require('gulp-clean')
const gutil = require('gulp-util')
const nodemon = require('gulp-nodemon')
const changed = require('gulp-changed')

const files = {
	config: path.resolve(__dirname, 'config/default.js'),
	gulpfile: path.resolve(__dirname, 'gulpfile.js'),
	src: `${path.resolve(__dirname, 'src')}/**/*.js`,
	handlebars: `${path.resolve(__dirname)}/views/**/*.handlebars`,
	css: `${path.resolve(__dirname)}/css/*.css`,
	png: `${path.resolve(__dirname)}/img/*.png`,
	dist: path.resolve(__dirname, 'dist')
}

gulp.task('dist:clean', () => {
	return gulp.src(files.dist, { read: false })
	.pipe(clean())
})

gulp.task('dist:config', () => {
	return gulp.src(files.config)
	.pipe(babel())
	.pipe(gulp.dest(path.resolve(files.dist, 'config')))
})

gulp.task('dist:handlebars', () => {
	return gulp.src(files.handlebars)
	.pipe(gulp.dest(path.resolve(files.dist, 'views')))
})
gulp.task('dist:css', () => {
	return gulp.src(files.css)
	.pipe(gulp.dest(path.resolve(files.dist, 'css')))
})
gulp.task('dist:png', () => {
	return gulp.src(files.png)
	.pipe(gulp.dest(path.resolve(files.dist, 'img')))
})

gulp.task('dist:build', ['dist:config', 'dist:handlebars', 'dist:css', 'dist:png'], () => {
	return gulp.src(files.src)
  .pipe(changed(files.dist))
	.pipe(babel())
	.pipe(gulp.dest(files.dist))
})

gulp.task('watch:dist', () => {
	gulp.watch(files.src, ['dist:build'])
})

gulp.task('server', ['dist:build', 'watch:dist'], () => {
	nodemon({
		script: 'dist/index.js',
		ext: 'js',
		env: process.env
	})
})

gulp.task('default', ['server'])
