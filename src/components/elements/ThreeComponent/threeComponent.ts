declare var __three: any;

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
      this.loadGame('src/_threeJS/ts_demo.js')
    },
    async loadGame(fileLocation){
      // remove old game first
      if(this.game !== null){
        this.game = null;
      }

      // load threeJS (once)
      if(!this.store.getters._threeJSIsLoaded()){
        await new Promise((resolve, reject) => {
          let js = document.createElement("script");
              js.type = "text/javascript";
              js.src = `/node_modules/three/build/three.min.js`;
              document.body.appendChild(js);
              js.onload = (() => {
                this.store.commit('setThreeJsIsLoaded', true)
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
       __three.init(this.$el, this, {width: 800, height: 600});

    }
  },
  destroyed() {
    this.game = null;
  }
}