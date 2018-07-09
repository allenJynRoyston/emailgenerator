// REQUIREMENTS
const gulp = require('gulp');
const watch = require('gulp-watch');
const sequence = require('gulp-watch-sequence');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const nodemon = require('nodemon');
const inject = require('gulp-inject-string');
const shell = require('gulp-shell')
const clean = require('gulp-clean');
const each = require('gulp-each');
const loadJsonFile = require('load-json-file');
const runSequence = require('run-sequence');

// GLOBALS
let buildJSON = {};





//--------------------------  BUILD CONTENT
//--------------------------  
const buildContent = () => {
  const {partials} = buildJSON;
  const staticFolder = 'html/static'
  // build in order
  const buildOrder = [`${staticFolder}/htmlOpen.html`, `${staticFolder}/head.html`, `${staticFolder}/bodyOpen.html`,];

  // get files from JSON and add
  partials.forEach((file) => {
    buildOrder.push(file.location)
  })

  // close in correct order
  buildOrder.push(`${staticFolder}/bodyClose.html`, `${staticFolder}/htmlClose.html`)
  return buildOrder;
}
//--------------------------
//--------------------------
const swapContent = (content, location) => {  
  let static = buildJSON.static.filter((item) => 
    item.location === location
  )  
  let partials = buildJSON.partials.filter((item) => 
    item.location === location
  )
  let _data = [...static, ...partials]

  // // swap content
  if(_data.length > 0){
    let {m_width, m_bgcolor, m_links} = buildJSON.master
    let {bgcolor, color, text, width} = _data[0].content

    content = content
      .replace(/\[m_width]/g, m_width)
      .replace(/\[m_bgcolor]/g, m_bgcolor)
      .replace(/\[m_links]/g, m_links)

      .replace(/\[width]/g, width)
      .replace(/\[bgcolor]/g, bgcolor)
      .replace(/\[color]/g, color)
      .replace(/\[text]/g, text)
  }

  return content;
}
//--------------------------





//--------------------------------------
gulp.task('start-server', (cb) => {
	var started = false;
	return nodemon({
		script: 'server.js'
	}).on('start', function () {
		if (!started) {
			cb();
			started = true;
		}
	});
});
//--------------------------------------


//--------------------------------------
gulp.task('rebuild-webpack', shell.task([
  'npm run build'
]))
//--------------------------------------

//--------------------------------------
gulp.task('trigger-sync', () => {
    gulp.src('./bsync.js')
        .pipe(inject.append('//reload'))
        .pipe(gulp.dest('./'));
});
//--------------------------------------


//--------------------------------------
gulp.task('browser-sync', ['start-server'], () => {

  // AFTER STARTER HAS BEEN STARTED, START BROWSERSYNC
  browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: ["server.js", "bsync.js"],
        port: 3030,
        reloadDelay: 2000,
	})

  // IF ANY OF THESE FILES HAVE BEEN CHANGED, COMPILE THEN START TRIGGER-SYNC, WHICH KICKS OFF BROWSERSYNC
  var queue = sequence(100);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK

  /* WATCH FOR CHANGES */
  watch('src/**/*.*', {
    emitOnGlob: false
  }, queue.getHandler('rebuild-webpack'));

	/* SERVER */
  watch('dist/server.js', {
    emitOnGlob: false
  }, queue.getHandler('trigger-sync'));

	/* EMAIL */
  watch(['html/**/*.*', 'instructions/build.json'], {
    emitOnGlob: false
  }, queue.getHandler('emails'));  
})
//--------------------------------------

//--------------------------  GULP TASKS
gulp.task('emails', () =>  {
  loadJsonFile('./instructions/build.json').then(json => {
    buildJSON = json; 
    runSequence('clean', 'build', () => {      
      
    });
  })
});
//--------------------------

//--------------------------  
gulp.task('clean', () => {
  return gulp.src('./output/template.html', {read: false})
      .pipe(clean());
});
//--------------------------

//--------------------------
gulp.task('build', () =>  {
  let files = buildContent();
  let i = 0;
  
  return gulp.src(files)
    .pipe(each((content, file, callback) => {            
      let newContent = swapContent(content, files[i])
      i++;
      callback(null, newContent);
    }))
    .pipe(concat('template.html'))
    .pipe(gulp.dest('./output/'));
    
});
//--------------------------

//--------------------------------------
gulp.task('rebuild', ['rebuild-webpack'], () => {});
//--------------------------------------

//--------------------------------------
gulp.task('default', ['browser-sync'], () => {});
//--------------------------------------
