declare var __phaser: any;

export default {
  props: [],
  data () {
    return {
      game: null,
      store: this.$store,
      demos: [
        {title: 'Sprite Class Manager', file: 'boilerplate/spriteManagerDemo.min.js'},
        {title: 'Controller Class Manager', file: 'boilerplate/controllerManagerDemo.min.js'},
        {title: 'Bitmapdata Layer Demo', file: 'boilerplate/bitmapLayerDemo.min.js'},
        {title: 'Bitmapdata Fill Demo', file: 'boilerplate/bitmapFillDemo.min.js'},
      ]
    }
  },
  mounted(){
    this.init()
  },
  methods: {
    init(){      
      this.loadGame('boilerplate/spriteManagerDemo.min.js')
    },
    async loadGame(fileName){
      // remove old game first
      if(this.game !== null){
        this.game.destroy()
      }
      
      // load phaser (once)
      if(!this.store.getters._phaserIsLoaded()){
        await new Promise((resolve, reject) => {
          let js = document.createElement("script");
              js.type = "text/javascript";
              js.src = `/node_modules/phaser-ce/build/phaser.min.js`;
              document.body.appendChild(js);
              js.onload = (() => {
                this.store.commit('setPixiIsLoaded', false)
                this.store.commit('setPhaserIsLoaded', true)
                resolve()              
              })
        })
      }

      // load game file
      await new Promise((resolve, reject) => {
        let js = document.createElement("script");
            js.type = "text/javascript";
            js.src = `src/_phaser/${fileName}`;
            document.body.appendChild(js);
            js.onload = (() => {
              resolve()              
            })
      })

      __phaser.init(this.$el, this, {width: 640, height: 640});


    },
    loadFile(file){
      this.loadGame(file)
    }
  },
  destroyed() {
    this.game.destroy();
  }
}