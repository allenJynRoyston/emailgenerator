const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const compression = require('compression');
const app = express()
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser");
const jsonfile = require('jsonfile')
const mkdirp = require('mkdirp');
const multer = require('multer');

// setup compression
app.use(compression())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

// set cache headers / expiration headers
app.use(function (req, res, next) {
  let day = (86400000 / 1000),
      numberOfDays = 7;
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (day * numberOfDays));
  next()
})

// allows server to fetch/read from these folders
app.use('/html', express.static(path.join(__dirname, './html')))
app.use('/src', express.static(path.join(__dirname, './src')))
app.use('/dist', express.static(path.join(__dirname, './dist')))
app.use('/assets', express.static(path.join(__dirname, './assets')))
app.use('/uploads', express.static(path.join(__dirname, './uploads')))
app.use('/output', express.static(path.join(__dirname, './output')))
app.use('/instructions', express.static(path.join(__dirname, './instructions')))
app.use('/node_modules', express.static(path.join(__dirname, './node_modules')))


// UTILITIES  **********************
const copyFile = (src, dest) => {
  let readStream = fs.createReadStream(src);
  readStream.once('error', (err) => {
    console.log(err);
  });
  readStream.once('end', () => {
    console.log('done copying');
  });  
  readStream.pipe(fs.createWriteStream(dest));
}


// POSTS **************************
// save json
app.post('/api/buildJSON', (req, res) => {
  fs.writeFile('./instructions/build.json', JSON.stringify(req.body), 'utf8', () => {  
    res.send(JSON.stringify(req.body))
  });
})

app.post('/api/saveFile', (req, res) => {  
  let target = `/saved/${req.body.filename}/`
  let saveDir = path.join(__dirname, target)
  let templateFile =  path.join(__dirname, '/output/template.html')
  let jsonFile =  path.join(__dirname, '/instructions/build.json')

  if (!fs.existsSync(saveDir)){
    mkdirp(saveDir, (err) => { 
      copyFile(templateFile, `${saveDir}/template.html`);
      copyFile(jsonFile, `${saveDir}/build.json`);
    });
  }
  else{
    copyFile(templateFile, `${saveDir}/template.html`);
    copyFile(jsonFile, `${saveDir}/build.json`);
  }

  res.send({status: true, message: 'Files created'})
})


app.post('/api/loadFile', (req, res) => {    
  let _template_target = `/saved/${req.body.filename}/template.html`
  let templateFile = path.join(__dirname, _template_target)
  let _json_target = `/saved/${req.body.filename}/build.json`
  let jsonFile = path.join(__dirname, _json_target)  
  if( fs.existsSync(templateFile) && fs.existsSync(jsonFile) ){
      copyFile(templateFile, path.join(__dirname, `/output/template.html`));
      copyFile(jsonFile, path.join(__dirname, `/instructions/build.json`));
      res.send({status: true, message: 'Files load successfully'})
  }
  else{
    res.send({status: false, message: 'File or files not found'})
  }
})


app.post('/api/deleteImage', (req, res) => {    
  try{
    let filePath = `./assets/${req.body.filename}`; 
    fs.unlinkSync(filePath);
    res.send({status: true, message: 'Image has been deleted'})
  }
  catch(err){
    res.send({status: false, message: 'Image does not exist'})
  }  
})



// FILE UPLOAD
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets')
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`)
  }
});
let upload = multer({storage: storage});
app.post('/api/upload', upload.any(), (req, res) => {    
  res.send({status: true, message: 'Images uploaded successfully'})
});  


// end POSTS 



// GETS **************************
// for routes / api
app.get('/api/test', (req, res) => {
  res.send("<h1>API TEST</h1>")
})


// saved files
app.get('/api/fetchSavedList', (req, res) => {
  let target = `/saved/`
  let savedFolders = path.join(__dirname, target)

  let list = fs.readdirSync(savedFolders).filter((file) => {
    return fs.statSync(savedFolders).isDirectory();
  });

  res.send({status: true, folders: list})
})

// saved images
app.get('/api/fetchImages', (req, res) => {
  let target = `/assets/`
  let savedFolders = path.join(__dirname, target)

  let list = fs.readdirSync(savedFolders).filter((file) => {
    return fs.statSync(savedFolders).isDirectory();
  });

  res.send({status: true, folders: list})
})



// builds default json out of all available static and partial components
app.get('/api/builddefault', (req, res) => { 
  let fileList;
  let folderList;
  let fileLocations = [];
  let defaultJSON = {
    globals: [],
    static: [],
    partials: []
  }
    
  function* loadInSequence(items){
    for (let i = 0; i < items.length; i++){
      yield items[i]
    }
  }

  const init = () => {
    let folders =  ['partials', 'static'] 
    folderList = loadInSequence(folders.map(name => {      
      return {name, path: path.join(__dirname, `html/${name}`)}
    }))
    folderSequenceLoader()
  }

  const folderSequenceLoader = () => {
    let list = folderList.next();
    if(!list.done){
      fs.readdir(list.value.path, (err, files) => {         
        files = files.map(file => {          
          return {location: `html/${list.value.name}/${file}/defaults.json`, type: list.value.name, html:  `html/${list.value.name}/${file}/${file}.html`}
        })
        fileLocations = [...fileLocations, ...files]
        folderSequenceLoader()        
      })
    }
    else {
      fileList = loadInSequence(fileLocations)
      fileSequenceLoader()
    }    
  }

  const fileSequenceLoader = () => {
    let list = fileList.next(); 
    if(!list.done){
      jsonfile.readFile(list.value.location, (err, obj) => {             
        obj.location = list.value.html
        defaultJSON[list.value.type].push(obj)
        fileSequenceLoader()
      })
    }
    else {
      addGlobals()      
    }
  }

  const addGlobals = () => {
    jsonfile.readFile(path.join(__dirname, `html/globals/globals.json`), (err, obj) => {               
      defaultJSON['globals'] = obj
      createDefaultJson()
    })
  }

  const createDefaultJson = () => {
    fs.writeFile('./instructions/default.json', JSON.stringify(defaultJSON), 'utf8', () => {    
      res.send(defaultJSON)
    });    
  }

  init();
})



// default route
app.get('*', (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, './index.html'), 'utf8'))
})
// end GETS 



// Serve the files on port 3000.
app.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000) + '\n' );
});

