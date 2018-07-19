export default {
  data () {
    return {
      store: this.$store,
      pixiFiles:  ['src/_pixi/bg/script.js'],
    }
  },
  methods: {
    
  },
  mounted(){
    this.isReady = true
  },
  destroyed(){

  }
}