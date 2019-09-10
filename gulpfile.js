/* eslint-env node */

const fs = require('fs');
const {/* copyFileSync, */stat, statSync, mkdir } = fs;
const path = require('path');
const uglifyes = require('uglify-es');
const gulp = require('gulp');
const del = require('del');
const { spawn } = require('child_process');
const ext3order = require('gulp-ext3order');
const concat = require('gulp-concat');
const composer = require('gulp-uglify/composer');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
//const replace = require("replace");
const phplint = require('gulp-phplint');
const phpcs = require('gulp-phpcs');
const commandExistsSync = require('command-exists').sync;
const chalk = require('chalk');

const uglify = composer(uglifyes, console);
const pluginName = path.basename(process.cwd());

/*
* A task to clean the build artifacts
*/
const cleanTask = () => del(['dist']);
exports.clean = cleanTask;

/*
* A linter task for the manifest.xml file
* xmllint must be installed to run this task!
*/
const manifestLintTask = (done) => {
	let skipLinting = false;

	if ( !commandExistsSync('xmllint') ) {
		// eslint-disable-next-line no-console
		console.info(chalk.blue('To lint the manifest.xml file please install xmllint. (http://xmlsoft.org/xmllint.html)'));
		skipLinting = true;
	}

	if ( !skipLinting ) {
		try {
			statSync('../../server/manifest.dtd');
		} catch (err) {
			switch (err.code) {
				case 'ENOENT':
					// eslint-disable-next-line no-console
					console.info(chalk.yellow('Could not find manifest.dtd file. To lint the manifest file, make sure to put your plugin in the plugins directory of the WebApp you are targeting!'));
					// Don't error on this one. It should be possible to build a plugin in another directory.
					skipLinting = true;
					break;
				default:
					// eslint-disable-next-line no-console
					console.info(chalk.red('Could not open manifest.dtd file'));
					return done(err.code);
			}
		}
	}

	// Create dist directory if not existing
	stat('dist', (err, stats) => {
		if ( err ) {
			switch (err.code) {
				case 'ENOENT':
					mkdir('dist', (err) => {
						if ( err ) {
							console.error('Failed creating dist directory');
							done(err.code);
						} else {
							// eslint-disable-next-line no-use-before-define
							startLint();
						}

					});
					break;
				default:
					console.error('Error: ', err.message);
					done(err.code);
			}
		} else if ( stats.isDirectory() ) {
			// eslint-disable-next-line no-use-before-define
			startLint();
		} else {
			console.error('dist is not a directory');
			done(1);
		}
	});

	/**
	 * The function that does the actual linting using xmllint
	 */
	const startLint = () => { // eslint-disable-line func-style
		if ( skipLinting ) {
			// eslint-disable-next-line no-console
			console.info(chalk.blue('Skipping linting of manifest file'));
			/*
			copyFileSync('manifest.xml', 'dist/manifest.xml');
			fixManifest();
			*/
			return done(0);
		}

		const xmllint = spawn(
			'xmllint',
			[
				'--valid',
				'--path', '../../server/',
				'--noout',
				'manifest.xml'
			],
			{
				encoding: 'utf-8',
				stdio: 'inherit'
			}
		);
		xmllint.on('close', (code) => {
			//fixManifest();
			done(code);
		});
	};

	/**
	 * Will remove the dist/ and src/ prefixes from the manifest in the dist directory
	 */
	/*
	const fixManifest = () => { // eslint-disable-line func-style
		replace({
			regex: 'dist\\/',
			replacement: '',
			paths: ['dist/manifest.xml'],
			silent: true
		});
		replace({
			regex: 'src\\/php\\/',
			replacement: 'php/',
			paths: ['dist/manifest.xml'],
			silent: true
		});
	};
	*/
};
exports.manifestLint = manifestLintTask;

/*
* A PHP linter task
*/
const phplintTask = () =>
	gulp.src('./php/**/*.php')
	.pipe(phplint());
exports.phplint = phplintTask;

/*
* A PHP Code Sniffer task
* See https://github.com/squizlabs/PHP_CodeSniffer
* TODO(ronald): Fix this task
*/
const phpcsTask = () =>
	gulp.src('./php/**/*.php')
	.pipe(phpcs({
		bin: 'vendor/bin/phpcs',
		standard: 'PSR1',
		warningSeverity: 0,
		exclude: [],
		showSniffCode: true
	}))
	.pipe(phpcs.reporter('log'))
	.pipe(phpcs.reporter('fail', {failOnFirst: false}));
exports.phpcs = phpcsTask;


/*
* A task to reorder and concatenate the javascript files
*/
const jsConcatTask = () =>
	gulp.src(['src/js/**/*.js'])
		.pipe(ext3order())
		.pipe(concat(pluginName + '-debug.js'))
		.pipe(gulp.dest('./dist/'));
exports.jsConcat = jsConcatTask;

/*
* A task to minify the scripts
*/
const jsMinifyTask = gulp.series(jsConcatTask, (cb) => {
	const debugFile = 'dist/' + pluginName + '-debug.js';

	// Check if the file exists in the current directory.
	fs.access(debugFile, fs.constants.F_OK, (err) => {
		if ( !err ) {
			gulp.src(['dist/' + pluginName + '-debug.js'])
				.pipe(sourcemaps.init())
				.pipe(uglify())
				.pipe(rename(pluginName + '.min.js'))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest('./dist/'));
		}

		// Let gulp know that the task has finished
		cb();
	});
});
exports.jsMinify = jsMinifyTask;

/*
* A task to reorder and concatenate the css files
*/
const cssConcatTask = () =>
	gulp.src(['src/resources/css/**/*.css'])
		.pipe(ext3order())
		.pipe(concat(pluginName + '-debug.css'))
		.pipe(gulp.dest('./dist/resources/css'));
exports.cssConcat = cssConcatTask;

/*
* A task to minify the css
*/
const cssMinifyTask = gulp.series(cssConcatTask, (cb) => {
	const debugFile = 'dist/resources/css/' + pluginName + '-debug.css';

	// Check if the file exists in the current directory.
	fs.access(debugFile, fs.constants.F_OK, (err) => {
		if ( !err ) {
			gulp.src(['dist/resources/css/' + pluginName + '-debug.css'])
				.pipe(sourcemaps.init())
				.pipe(cleanCSS({compatibility: 'ie11'}))
				.pipe(rename(pluginName + '.min.css'))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest('./dist/resources/css/'));
		}

		// Let gulp know that the task has finished
		cb();
	});
});
exports.cssMinify = cssMinifyTask;

/*
	* A task to watch changes while developing
	*/
const watchTask = () => {
	gulp.watch('src/js/**/*.js', jsMinifyTask);
	gulp.watch('src/resources/css/**/*.css', cssMinifyTask);
	gulp.watch('manifest.xml', manifestLintTask);
	gulp.watch('php/**/*.php', phplintTask);
};
exports.watch = watchTask;

/*
* The default task that will be run if gulp is run without any additional parameters.
* Make sure to finish the clean task before starting the other tasks!
*/
const defaultTask = gulp.series(cleanTask, gulp.parallel(jsMinifyTask, cssMinifyTask));
exports.default = defaultTask;
