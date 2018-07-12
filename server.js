const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const compression = require('compression');
const app = express()
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser");
const jsonfile = require('jsonfile')

// setup compression
app.use(compression())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set cache headers / expiration headers
app.use(function (req, res, next) {
  let day = (86400000 / 1000),
      numberOfDays = 7;
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (day * numberOfDays));
  next()
})

// allows server to fetch/read from these folders
app.use('/src', express.static(path.join(__dirname, './src')))
app.use('/dist', express.static(path.join(__dirname, './dist')))
app.use('/output', express.static(path.join(__dirname, './output')))
app.use('/instructions', express.static(path.join(__dirname, './instructions')))
app.use('/node_modules', express.static(path.join(__dirname, './node_modules')))

// for routes / api
app.get('/api/test', (req, res) => {
  res.send("<h1>API TEST</h1>")
})

// save json
app.post('/api/buildJSON', (req, res) => {
  fs.writeFile('./instructions/build.json', JSON.stringify(req.body), 'utf8', () => {    
    res.send(JSON.stringify(req.body))
  });
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

// Serve the files on port 3000.
app.listen(process.env.PORT || 3000, function () {
  console.log('App listening on port ' + (process.env.PORT || 3000) + '\n' );
});

