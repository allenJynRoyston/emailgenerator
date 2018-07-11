import axios from 'axios';

export default {  
  data () {
    return {
      store: this.$store,
      activeTab: 0,
      iframeIsReady: true,
      jsonIsReady: false,
      jsonFile: null,
      templateExists: false,
      componentOptions: [
        {name: 'Open In Browser', location: "html/partials/0_openInBrowser.html"},
        {name: 'Security Panel', location: "html/partials/1_securityPanel.html"},
        {name: 'Disclosure', location: "html/partials/9_disclosure.html"},
      ]
    }
  },
  mounted:function(){
    this.refreshIframe();
    
    

    axios.get('./instructions/build.json')
      .then((response) => {    
        
        
        // add focus property to textareas
        response.data.partials.map(partial => {
          partial.content.map(item => {
            if(item.type === 'textarea'){
              item.focused = false
            }
          })
        })                

        // bind object
        this.jsonFile = response.data;   
        this.jsonIsReady = true;                 
      })
      .catch((error) => {
        console.log(error);
      });  
      
      this.checkForTemplate()
  },
  methods: {

    focusTest(item){
      item.focused = true
    },

    addNewSection(){
      let newSection = {
        content: {
          bgcolor: "#f2f2f2",
          color: "#e056fd"
        },
        location: this.componentOptions[0].location,
        name: this.componentOptions[0].name
      }

      this.jsonFile.partials.push(newSection)
    },

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


    moveItemUp(index:number){      
      if(index > 0){
        this.array_move(this.jsonFile.partials, index, index-1)        
      }
    },

    moveItemDown(index:number){
      if(index < this.jsonFile.partials.length - 1){
        this.array_move(this.jsonFile.partials, index, index+1)        
      }
    },

    removeItem(index:number){

    },

    onChange(){
      this.jsonFile.partials.map((partial) => {
        let match = this.componentOptions.find(option => {
          return partial.name === option.name
        })
        partial.location = match.location
        partial.name = match.name
      })
    },

    async checkForTemplate(){
      await axios.get('./output/template.html')
        .then((response) => {                      
          this.templateExists = true        
        })
        .catch((error) => {
          this.templateExists = false
        });  
    },

    refreshIframe(){
      // setInterval(() => {    
      //   setTimeout(() => {              
      //     this.iframeIsReady = true
      //   })
      // }, 1000)
    },


    async createOutput(){     
      this.iframeIsReady = false;       
      await axios.post('/api/buildJSON', this.jsonFile)
        .then((response) => {          
          console.log(response);          
        })
        .catch((error) => {
          console.log(error);
        });
    },



    checkFieldText(name:string){
      switch(name.toLowerCase()) {
        case 'm_width':
          return 'width'          
        case 'm_bgcolor':
          return 'bgcolor'           
        case 'm_links':
          return 'links'                     
        default: 
          return name          
      }      
    }

  },  
}