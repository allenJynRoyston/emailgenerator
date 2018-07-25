<template lang='pug'>
  #app-layout
    .curtain(v-if='d.tell')
    PixiComponent.bg-canvas.pixi(v-if='!d.tell' v-bind:files='pixiFiles' type='GROW' fullscreen autoplay orderdelay='1')      
    youtube.yt(v-if='d.tell' v-bind:video-id="pickrandom()" :player-vars="{ autoplay: 1 }" @ready="ready" v-bind:player-width="d.width" v-bind:player-height="d.height")
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
      pixiFiles:  ['src/_pixi/bg/script.js'],
      kArray: [],      
      images: [
        test_image
      ],
      d:{
        tell: false,
        width: screen.width,
        height: screen.height 
      }
    }
  },
  created(){
    document.addEventListener('keydown', (e) => {
      if(!this.d.tell){
        this.kArray.push(e.keyCode)        
        if (event.keyCode == 13) {
          let sum = this.kArray.reduce((a, b) => a + b, 0)
          if(sum === 583){
            alert('You discovered a secret!')
            this.d.tell = true
          }
          this.kArray = [];
        }
      }
    })
  },
  mounted(){
    this.store.commit('overlay_on')
    this.imageLoader(this.images, this.finishedLoading)
  },
  methods:{
    pickrandom(){
      const ytid = ['eqzxBHSKVsQ', 'EBYsx1QWF9A', 'AiHyTJsE3AU']
      return ytid[Math.floor(Math.random() * ytid.length)];
    },

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
  
  .pixi
    z-index: -1
    position: fixed
    top: 0
    left: 0
  
  .yt
    z-index: -1; 
    position: fixed 
    top: 0
    left: 5%

  .curtain
    z-index: -2 
    position: fixed 
    width: 100%
    height: 100%
    top: 0 
    left: 0
    background-color: black
</style>
