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
      devBuild: false,
      openModal: false,
      openSaveModal: false,
      openLoadModal: false,
      openPreviewModal: false,
      openSuccessModal: false,
      iframeZoom: 1,
      wittyRetort: null,
      timerId: null,
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
        ]        
      },
      io: {
        saveSelected: 'default',
        filename: 'default',
        loadSelected: 'default',
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
  },
  methods: {
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
      this.jsonFile.partials.splice(index, 1)
    },
    //---------------------------------

    //---------------------------------
    resetBuild(){
      if (confirm("Continuing will reset all partial data.")) {
        this.jsonFile = this.resetFile;
        this.createOutput();
      }       
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
        build = ['default', 'test']
      }      

      // add as property and remove default 
      this.io.currentFiles = build.map(item => {
        return {name: item}
      }).filter(item => {
        if(item.name !== 'default'){
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
          this.htmlPreview = res.data
          this.iframeIsReady = true    
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