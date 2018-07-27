import axios from 'axios';

export default {  
  data () {
    return {
      store: this.$store,
      activeTab: 0,
      iframeIsReady: false,
      jsonIsReady: false,
      jsonFile: null,
      resetFile: null,  
      moveIndex: null,
      copyContents: null,  
      copyCheckMatches: [],  
      devBuild: false,
      imageSelected: null,
      imageUrl: 'https://picsum.photos/600/300',
      imageModalType: 0,
      imageFile: null,
      openModal: false,
      openPasteCheckModal: false,
      openMoveModal: false,
      openImageModal: false,
      openSaveModal: false,
      openLoadModal: false,      
      openSuccessModal: false,
      openGlobalColorModal: false,
      openColorModal: false,
      colorSelected: null,
      colorSelector: null,
      iframeZoom: 1,
      wittyRetort: null,
      timerId: null,
      upload: {
        uploadfiles: [],
        hasError: false,
        processing: false,
        formData: null,        
      },
      dropdowns: {
        fontfamilies: [          
          'Georgia, serif',
          'Calibri, Arial, sans-serif',
          '\'Palatino Linotype\', \'Book Antiqua\', Palatino, serif',
          '\'Times New Roman\', Times, serif',
          'Arial, Helvetica, sans-serif',
          '\'Arial Black\', Gadget, sans-serif',
          '\'Comic Sans MS\', cursive, sans-serif',
          '\'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif',
          'Verdana, Geneva, sans-serif',
          '\'Courier New\', Courier, monospace',
          '\'Lucida Console\', Monaco, monospace'
        ],
        fontweight: [
          'normal',
          'bold',
          'light'
        ],
        alignment: [
          'left',
          'center',
          'right',
          'justify'
        ], 
        images: []     
      },
      io: {
        saveSelected: 'new',
        filename: 'new',
        loadSelected: 'new',
        currentFiles: []
      },
      options:[
        {id: 'autobuild', title: 'Auto Build', value: true, type: 'boolean', visibleif: () => {
          return true 
        }}, 
        {id: 'builddelay', title: 'Build Delay', value: 1000, type: 'number', visibleif: () => {
          return this.setOptions.autobuild 
        }},        
      ],
      menuOptions: [
        {title: 'file', index: 0},
        {title: 'globals', index: 1},
        {title: 'partials', index: 2},
        {title: 'options', index: 3},
      ],
      setOptions: {
        autobuild: true,
        buildDelay: null
      },
      error: {
        hasError: false,
        message: null
      },
      indexStored: null,      
      componentOptions: []
    }    
  },
  watch: {
    // whenever question changes, this function will run
    jsonFile:{
      handler(val){     
        if(this.setOptions.autobuild){
          const debounce = this.debounced(this.setOptions.buildDelay, () => {
            this.createOutput()        
          });    
          debounce()          
        }
      },
      deep: true
    }
  },  
  mounted:function(){    
    // check local storage for filename, else default to 'default'
    if(localStorage.getItem("filename") !== null){
      let filename = localStorage.getItem("filename")
      this.io.filename = filename
      this.io.saveSelected = filename
      this.io.loadSelected = filename
    }

    this.getCurrentRoute()
    this.setUserOptions()
    this.fetchDefaultList()
    this.fetchCurrentBuild()    
    this.fetchImages()
  },
  methods: {

    //---------------------------------
    copyPartial(partial){
      this.copyContents = partial
      this.wittyRetort = 'Contents copied'
      this.openSuccessModal = true
      setTimeout( () => {
        this.openSuccessModal = false
      }, 1000)      
    },
    //---------------------------------

    //---------------------------------
    movePartialTo(index:number){
      if(index === -1){ index = 0}
      this.array_move(this.jsonFile.partials, this.moveIndex, index)      
      this.moveIndex = index
      // this.openMoveModal = false
    },
    //---------------------------------

    //---------------------------------
    clonePartial(partial, index){
      this.jsonFile.partials.push(partial)
      this.array_move(this.jsonFile.partials, this.jsonFile.partials.length - 1, index + 1)
      this.wittyRetort = 'Partial duplicated'
      this.openSuccessModal = true
      setTimeout( () => {
        this.openSuccessModal = false
      }, 1000)        
    },
    //---------------------------------

    //---------------------------------
    pastePartialCheck(index){
      this.copyCheckMatches = []
      this.jsonFile.partials[index].content.forEach(item => {
        this.copyContents.content.forEach(_item => {
          if(_item.key === item.key && (_item.value !== item.value)){
            this.copyCheckMatches.push({
                active: true,
                same: (_item.value === item.value),
                current: {key: item.key, value: item.value}, 
                changeto: { key: _item.key, value: _item.value},
                data: item, 
                value: _item.value,
                index
              })
          }  
        })        
      })         
      this.openPasteCheckModal = true      
    },
    //---------------------------------

    //---------------------------------
    pastePartial(){      
      this.openPasteCheckModal = false 
      let index = this.copyCheckMatches[0].index
      this.jsonFile.partials[index].content.forEach(item => {
        this.copyCheckMatches.forEach(_item => {
          if(_item.data.key === item.key && (_item.active && !_item.same)){
            item.value = _item.value
          }  
        })        
      })      

      console.log(this.jsonFile.partials[index])

      this.wittyRetort = 'Matching properties pasted'
      this.openSuccessModal = true
      setTimeout( () => {
        this.openSuccessModal = false
      }, 1000)   
    },
    //---------------------------------

    //---------------------------------
    findBGColor(partial:any){
      let match = partial.content.filter(item => {
        return item.key === 'bgcolor'
      })
      if(match.length > 0){
        return this.returnColorValue(match[0].value)
      }
      return null
    },
    //---------------------------------

    //---------------------------------
    refreshiframe(){
      (document.getElementById('iframeContainer') as any).contentWindow.window.refreshIframe()
    },
    //---------------------------------

    //---------------------------------
    filesChange(fieldName:any, fileList:any){
      const formData = new FormData();

      if (!fileList.length) return;
      
      this.upload.uploadfiles = []

      // append the files to FormData
      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          let {name} = fileList[x]
          this.upload.uploadfiles.push({name})
          formData.append(fieldName, fileList[x], fileList[x].name);
        });

      this.upload.formData = formData;
    },
    //---------------------------------

    //---------------------------------
    imageSelect(image:any){      
      this.imageSelected.value = image.src
      this.openImageModal = false
    },
    //---------------------------------

    //---------------------------------
    imageSelectUrl(url:string){
      this.imageSelected.value = url
      this.openImageModal = false
      this.imageUrl = 'https://picsum.photos/600/300'
    },
    //---------------------------------

    //---------------------------------
    setGlobalColor(color:string){
      this.openGlobalColorModal = false      
      this.colorSelected.value = color
      this.colorSelector = null;
      
    },
    //---------------------------------

    //---------------------------------
    setColor(obj:any, force:string = null){
      if(!!force){
        this.colorSelected.value = force
      }
      else{      
        this.colorSelected.value = `[${obj.key}]`        
      }
      
      this.openColorModal = false      
      this.colorSelector = null;      
    },
    //---------------------------------

    //---------------------------------
    returnColorValue(value:string){
      if(value.includes('g_')){
        value = value.replace(/[\[\]]/g, '');
        let matches = this.jsonFile.globals.content.filter(item => {
          return item.key === value
        })  
        if(matches.length > 0)
        return matches[0].value
      }
      return value
    },
    //---------------------------------

    //---------------------------------
    setFilename(filename){
      localStorage.setItem("filename", filename)
      this.io.filename = filename
      this.io.saveSelected = filename
      this.io.loadSelected = filename
    },
    //---------------------------------

    //---------------------------------
    setZoomLevel(val:number){
      if(val < 0 && this.iframeZoom > 0){
        this.iframeZoom += val
      }
      if(val > 0 && this.iframeZoom < 1){
        this.iframeZoom += val
      }
    },
    //---------------------------------

    //---------------------------------
    getCurrentRoute(){
      let routeMatch = this.menuOptions.filter(option => {
        return option.title === this.$route.query.section
      })
      if(routeMatch.length > 0){
        this.activeTab = routeMatch[0].index
      }      
    },
    //---------------------------------

    //---------------------------------
    addToUrlParams(item:any){      
      this.$router.push({ query: { section: item.title }})
    },
    //---------------------------------

    //---------------------------------
    copyToClipboard(){
      const responses = ['Nice job hero.', 'Got it.', 'No prob.', 'Nailed that button click.', 'Easy peasy.', 'Copied.', 'Paste away.', 'It\'s done son.', 'Nae botha.', 'Success!']
      this.wittyRetort = responses[Math.floor(Math.random() * responses.length)];

      (navigator as any).clipboard.writeText(this.htmlPreview).then(() => {
        this.openSuccessModal = true
        setTimeout( () => {
          this.openSuccessModal = false
        }, 1000)
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });         
    },
    //---------------------------------

    //---------------------------------
    setUserOptions(){
      let autobuild = this.options.filter(item => {
        return item.id === 'autobuild'
      })  

      let delay = this.options.filter(item => {
        return item.id === 'builddelay'
      })    
      
      this.setOptions.autobuild = autobuild[0].value
      this.setOptions.buildDelay = delay[0].value
    },
    //---------------------------------

    //---------------------------------
    debounced(delay:number, fn:any){      
      return (...args) => {
        if (this.timerId) {
          clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(() => {
          fn(...args);
          this.timerId = null;
        }, delay);
      }
    },
    //---------------------------------

    //---------------------------------
    assignJsonFile(data:any){      
      data.partials.map(partial => {
        partial.showProps = false
        partial.content.map(item => {
          if(item.type === 'textarea'){
            item.focused = false
          }
        })
      })     
            
      this.jsonFile = data;         
      console.log(this.jsonFile)
      this.jsonIsReady = true;    
    },
    //---------------------------------

    //---------------------------------
    createComponentList(list:any){
      let partials = JSON.parse(list).partials;
      partials.map(partial => {
        partial.active = false
        this.componentOptions.push(partial)   
      })   
    },
    //---------------------------------

    //---------------------------------
    selectedOption(selected:any){
      this.openModal = false;
      let delinked = JSON.stringify(selected)
      let {content, location, name} = JSON.parse(delinked)

      if(this.indexStored !== 'new'){
        this.jsonFile.partials[this.indexStored].content = content;
        this.jsonFile.partials[this.indexStored].name = name;
        this.jsonFile.partials[this.indexStored].location = location;
      } else {
        let newContent = {content, name, location, showProps: false}
        this.jsonFile.partials.push(newContent)            
      }
    },
    //---------------------------------

    //---------------------------------
    addNewSection(){
      this.indexStored = 'new';
      this.openModal = true;
    },
    //---------------------------------
    
    //---------------------------------
    array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
              arr.push(undefined);
          }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    },
    //---------------------------------

    //---------------------------------
    moveItemUp(index:number){      
      if(index > 0){
        this.array_move(this.jsonFile.partials, index, index-1)        
      }
    },
    //---------------------------------

    //---------------------------------
    moveItemDown(index:number){
      if(index < this.jsonFile.partials.length - 1){
        this.array_move(this.jsonFile.partials, index, index+1)        
      }
    },
    //---------------------------------

    //---------------------------------
    removeItem(index:number){
      if (confirm("Delete this partial?")) {
        this.jsonFile.partials.splice(index, 1)
      }
    },
    //---------------------------------

    //---------------------------------
    resetBuild(){
      if (confirm("Continuing will reset all partial data.")) {
        this.jsonFile = this.resetFile;
        this.setFilename('new')        
        this.jsonFile.partials = []   
      }       
    },
    //---------------------------------    

    //---------------------------------    
    async deleteImage(image:any){
      if (confirm("You want to delete this image?  It will be permanently destroyed.")) {        
        let res = await axios.post('/api/deleteimage', {filename: image.name})
        this.fetchImages()
      }
    },
    //---------------------------------    

    //---------------------------------    
    async restoreGlobalDefaults(){
      if (confirm("Continuing will reset all global data.")) {
        try{
          let res = await axios.get('./html/globals/globals.json')        
          this.jsonFile.globals.content = res.data.content
        }
        catch(err){
          console.log(`Error: ${err}`)
        }      
      }
    },
    //---------------------------------    

    //---------------------------------
    async uploadFiles(){
      this.upload.processing = true
      try{        
        let res = await axios({ 
          method: 'POST',        
          url: '/api/upload', 
          data: this.upload.formData 
        })
        setTimeout(() => {
          this.fetchImages()
          this.imageModalType = 0        
          this.upload.uploadFiles = [];
          this.upload.processing = false      
        }, 1000);        
      }
      catch(err){
        console.log(`Error issue: failed to POST.  Erorr message ${err}`)
        this.upload.hasError = true
        setTimeout(() => {
          this.upload.hasError = false
          this.upload.processing = false   
        }, 2000)
      }
      

    },
    //---------------------------------

    //---------------------------------
    async fetchImages(){
      let build;       
      try{
        let res = await axios.get('/api/fetchImages')
        build = res.data.folders
      }catch(err){
        console.log(`Error issue: failed to GET.  Error message:  ${err}`)
        build = ["B_Logo.jpg", "Image_@2x.jpg", "Image_@2x.jpg"]
      }        
      
      // add as property and remove default 
      build = build.map(item => {
        return {name: `${item}`, src: `/assets/${item}`, selected: false}
      }) 
      this.dropdowns.images = build;
    },
    //---------------------------------    

    //---------------------------------
    async fetchSavedFiles(){
      let build; 
      try{
        let res = await axios.get('/api/fetchSavedList')
        build = res.data.folders        
      }catch(err){
        console.log(`Error issue: failed to GET.  Error message:  ${err}`)
        build = ["new"]
      }      

      // add as property and remove default 
      this.io.currentFiles = build.map(item => {
        return {name: item}
      }).filter(item => {
        if(item.name !== 'new'){
          return item
        }
      })      
    },
    //---------------------------------    

    //---------------------------------
    async loadFile(){    
      let check = confirm('Loading a file will overwrite your current progress.  Proceed?')    
      if(check){
        try{          
          this.iframeIsReady = false;       
          let res = await axios.post('/api/loadFile', {filename: this.io.loadSelected})
          this.openLoadModal = false                                              
          this.setFilename(this.io.loadSelected)          
          this.fetchCurrentBuild()
          setTimeout(() => {
            this.iframeIsReady = true  
            this.wittyRetort = 'File loaded correctly.'
            this.openSuccessModal = true
            setTimeout( () => {
              this.openSuccessModal = false
            }, 1000)                
          }, 500)



        }catch(err){
          this.iframeIsReady = true;     
          console.log(`Error issue: failed to POST.  Error message:  ${err}`)
        }      
      }

    },
    //---------------------------------   

    //---------------------------------
    async saveFile(){
      let matches = this.io.currentFiles.filter(filename => {
        return filename === this.io.saveSelected
      })

      let check = true;
      if(matches.length > 0){
        check = confirm('Are you sure you want to save this thing into the database?')
      }

      if(check){
        try{
          await axios.post('/api/saveFile', {filename: this.io.saveSelected})
          this.setFilename(this.io.saveSelected)
          this.openSaveModal = false

          this.wittyRetort = 'File has been saved.'
          this.openSuccessModal = true
          setTimeout( () => {
            this.openSuccessModal = false
          }, 1000)

        }catch(err){
          console.log(`Error issue: failed to POST.  Error message:  ${err}`)
        }      
      }
      
    },
    //---------------------------------    

    //---------------------------------
    async fetchPreview(){              
      try{
        let res = await axios.get('/output/template.html')
        let match = res.data.includes('<div id="app"></div>')
        if(!match){
          setTimeout(() => {
            this.htmlPreview = res.data
            this.iframeIsReady = true  
            this.refreshiframe()  
          }, 500)
        }
        else{
          // delay between attempts to find template.html
          setTimeout(() => {
            this.fetchPreview()        
          }, 500)
        }
      }
      catch{        
        // delay between attempts to find template.html
        setTimeout(() => {
          this.fetchPreview()        
        }, 500)
      }
    },
    //---------------------------------

    //---------------------------------
    async fetchDefaultList(repurpose:Boolean = false){
      try{
        let res = await axios.get('/api/builddefault')
        this.resetFile = res.data
        res.data.partials.map(partial => {
          // uses default build list if build.json doesn't exists
          if(repurpose){
            this.assignJsonFile(res.data)
          }
        })      
        this.createComponentList(JSON.stringify(res.data))             
      }
      catch{
        this.devBuild = true
        this.fetchDummyData()
      }
    },
    //---------------------------------

    //---------------------------------
    async fetchCurrentBuild(){
      try{
        let res = await axios.get('./instructions/build.json')
        // bind object
        this.assignJsonFile(res.data)
      }
      catch(err){
        this.fetchDefaultList(true)        
      }
    },
    //---------------------------------

    //---------------------------------
    async fetchDummyData(){
      try{
        let res = await axios.get('./instructions/default.json')
        // console.log(res.data)
        this.assignJsonFile(res.data)      
        // // set resetdata
        this.resetFile = res.data
        this.createComponentList(JSON.stringify(res.data))        
      }
      catch(err){
        this.error.hasError = true
        this.error.message = "Dummy data does not exists.  Run $gulp default once to create it."
      }

    },
    //---------------------------------
    
    //---------------------------------
    async createOutput(){     
      this.iframeIsReady = false;       
      const delay = 500 // <!-- 500 seems to be the minimal threshold that will work - do not change
      try{
        await axios.post('/api/buildJSON', this.jsonFile)
      }
      catch(err){
        // will result in error if on dev build - just ignore  
        console.log(err)
      }
      setTimeout(() => {
        this.fetchPreview()
      }, delay)        
      
    },
    //---------------------------------

  },  
}