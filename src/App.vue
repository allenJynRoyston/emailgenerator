<template lang='pug'>
  #app-layout    
    SiteOverlay
    DrawerComponent
    SiteHeader
    SiteNavigation
    router-view#site-layout
    SiteFooter
</template>

<script>
import './assets/js/global.js'

import test_image from "./assets/images/misc/ninja-icon.png"

export default {
  name: 'app',
  data() {
    return {
      store: this.$store,
      images: [
        test_image
      ]
    }
  },
  mounted(){
    this.store.commit('overlay_on')
    this.imageLoader(this.images, this.finishedLoading)
  },
  methods:{
    imageLoader(Images, Callback){
        let store = this.store;
        let allLoaded = 0;
        let _log = {
            success: [],
            error: []
        };
        let verifier = function(){
            allLoaded++;
            if(allLoaded == Images.length){
              store.commit('setProgressBar', 100);
              Callback.call(undefined, _log);
            }
        };
        for (let index = 0; index < Images.length; index++) {
            (function(i){
                let imgSource = Images[i];
                let img = new Image();
                img.addEventListener("load", function(){
                    store.commit('setProgressBar', (index/Images.length * 100).toFixed(0));
                    _log.success.push(imgSource);
                    verifier();
                }, false);
                img.addEventListener("error", function(){
                    _log.error.push(imgSource);
                    verifier();
                }, false);
                img.src = imgSource;
            })(index);
        }
    },
    finishedLoading(res){
      // toggle off overlay
      this.store.commit('setAppState', true)
      this.store.commit('overlay_off')
    }
  }
}
</script>

<style lang="scss">
  @import './assets/css/global.css';
</style>

<style lang="sass" scoped>
  #site-layout
    min-height: 1200px
</style>
