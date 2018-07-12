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
const rename = require("gulp-rename");
const wait = require('gulp-wait')
// GLOBALS
let buildJSON = {};
let fileIds = [];



//--------------------------  BUILD CONTENT
//--------------------------  
const buildContent = (rename) => {
  const {partials} = buildJSON;
  const staticFolder = 'html/static'
  // build in order
  const buildOrder = [`${staticFolder}/htmlOpen/htmlOpen.html`, `${staticFolder}/head/head.html`, `${staticFolder}/bodyOpen/bodyOpen.html`,];
  let preIndexCount = buildOrder.length

  // get files from JSON and add
  partials.forEach((file, index ) => {
    
    if(rename){  
      file.alias = `tmp/${fileIds[index + preIndexCount].newname}`
      buildOrder.push(`${file.alias}`)      
    }
    else{
      buildOrder.push(file.location)
    }
  })

  // close in correct order
  buildOrder.push(`${staticFolder}/bodyClose/bodyClose.html`, `${staticFolder}/htmlClose/htmlClose.html`)
  return buildOrder;
}
//--------------------------


//--------------------------
const swapContent = (content, location, applyGlobals = false) => {  

  let static = buildJSON.static.filter((item) => 
    item.location === location
  )  
  let partials = buildJSON.partials.filter((item) => 
    item.alias === location
  )
  let _data = [...static, ...partials]

  // // swap content with partial specific variables
  if(_data.length > 0){
    let _vars = []
    _data.forEach((__data, index) => {        
      __data.content.forEach((obj, index) => {    
        let regex = new RegExp(`\\[${obj.key}]`,"g"); 
        content = content.replace(regex, obj.value)
      })
    })
  }

  // apply master globals
  if(applyGlobals){
    let _globals = []
    buildJSON.globals.content.forEach((obj, index) => {    
      let regex = new RegExp(`\\[${obj.key}]`,"g"); 
      content = content.replace(regex, obj.value)
    })

  }  

  return content;
}
//--------------------------


//--------------------------
const makeid = (len = 8) => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text;
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
  const queue = sequence(100);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK

  /* WATCH FOR CHANGES */
  watch(['src/components/**/*.*', 'src/assets/**/*.*'], {
    emitOnGlob: false
  }, queue.getHandler('rebuild-webpack'));

	/* SERVER */
  watch('server.js', {
    emitOnGlob: false
  }, queue.getHandler('trigger-sync'));

	/* EMAIL */
  watch(['html/**/*.*', 'instructions/build.json'], {
    emitOnGlob: false
  }, queue.getHandler('emails'));  
})
//--------------------------------------

//--------------------------  
gulp.task('server', () =>  {

  runSequence('start-server', () => {  
    // AFTER STARTER HAS BEEN STARTED, START BROWSERSYNC
    browserSync.init(null, {
      proxy: "http://localhost:3000",
          files: ["server.js", "bsync.js"],
          port: 3030,
          reloadDelay: 2000,
    })
    
    const queue = sequence(100);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK
      
    watch('server.js', {
      emitOnGlob: false
    }, queue.getHandler('trigger-sync'));

  })

})
//--------------------------




//--------------------------  
gulp.task('test', () =>  {
  var queue = sequence(100);  // SMALL DELAY SO CLEARHTML DOESN'T BREAK
  watch(['html/**/*.*', 'instructions/build.json'], {
    emitOnGlob: false
  }, queue.getHandler('emails'));  

});
//--------------------------

//--------------------------  
gulp.task('emails', () =>  {
  loadJsonFile('./instructions/build.json').then(json => {
    buildJSON = json; 
    runSequence('clean', 'copy', 'delay', 'build', 'applyglobals', 'cleantmp', () => {                
      // reset globals after build
      buildJSON = {};
      fileIds = [];
    });    
  })
});
//--------------------------

//--------------------------  
gulp.task('copy', () => {
  let files = buildContent(false);
  let dest = './tmp';
  
  return files.forEach((file, index) => {
    let newId = makeid();
    let newFile = `${newId}.html`;    
    fileIds.push({oldname: file, newname: newFile, index})
    gulp.src(file)   
      .pipe(rename(newFile))   
      .pipe(gulp.dest(dest))      
  })
});
//--------------------------

//--------------------------  
gulp.task('delay', () => {
  let files = buildContent(false);
  // delay needed for files to created - the more files, the slightly longer the delay required 
  return gulp.src('')
    .pipe(wait(files.length * 2))  
});
//--------------------------

//--------------------------  
gulp.task('clean', () => {
  return gulp.src(['./output/template.html'], {read: false})
      .pipe(clean());
});
//--------------------------

//--------------------------  
gulp.task('cleantmp', () => {
  return gulp.src('./tmp', {read: false})
      .pipe(clean());
});
//--------------------------

//--------------------------
gulp.task('build', () =>  {
  let files = buildContent(true);
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


//--------------------------
gulp.task('applyglobals', () =>  {  
  return gulp.src('./output/template.html')
    .pipe(each((content, file, callback) => {            
      let newContent = swapContent(content, './output/template.html', true)
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
