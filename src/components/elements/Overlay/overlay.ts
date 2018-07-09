export default {
  data() {
    return {
      store: this.$store,
      progress: 0,
      isActive: null
    }
  },
  mounted(){
    // watch for isActive
    this.store.watch(this.store.getters._isActive, val => {
      this.isActive = val;
    })
    this.store.watch(this.store.getters._progressBar, val => {
      this.progress = val;
    })
  },
  methods: {

  }
}