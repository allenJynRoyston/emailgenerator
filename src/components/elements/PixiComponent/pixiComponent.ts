declare var __pixi: any;

export default {
  props: [],
  data () {
    return {
      game: null,
      store: this.$store,
    }
  },
  mounted(){
    this.init()
  },
  methods: {
    init(){
      this.loadGame('src/_pixi/pixi_demo.js')
    },
    async loadGame(fileLocation){

      // remove old game first
      if(this.game !== null){
        this.game = null;
      }
      
      // load threeJS (once)
      if(!this.store.getters._pixiJSIsLoaded()){
        await new Promise((resolve, reject) => {
          let js = document.createElement("script");
              js.type = "text/javascript";
              js.src = `/node_modules/pixi.js/dist/pixi.min.js`;
              document.body.appendChild(js);
              js.onload = (() => {                
                this.store.commit('setPixiIsLoaded', true)
                this.store.commit('setPhaserIsLoaded', false)
                resolve()              
              })
        })
      }      

      // load game file
      await new Promise((resolve, reject) => {
        let js = document.createElement("script");
            js.type = "text/javascript";
            js.src = `${fileLocation}`;
            document.body.appendChild(js);
            js.onload = (() => {
              resolve()              
            })
      })

      // load new one
       __pixi.init(this.$el, this, {width: 800, height: 600});
     
    }
  },
  destroyed() {
    //function PixiObject() {};
    
    this.game = null;
  }
}