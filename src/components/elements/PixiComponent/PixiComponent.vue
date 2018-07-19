<template lang="pug">
    #pixi-example
      div(v-if='isReady')
        div(v-if='!hasAutoplay')
          .start-btn(@click='autostart()')
            .fas.fa-play-circle
        div(v-if='isReady && hasAutoplay')
          .pause-btn(v-if='hasAllowpause' @click='pause()')
            .fas(v-bind:class='element.global.pause ? " fa-play-circle" : " fa-pause-circle"')
          .next-btn(v-if='hasControls' @click='next()')
            .fas.fa-forward
          .back-btn(v-if='hasControls' @click='back()')
            .fas.fa-backward
          .destroy-btn(v-if='hasAllowdestroy' @click='destroy()')
            .fas.fa-times

</template>

<script src='./pixiComponent.js'></script>


<style lang="sass" scoped>
  #pixi-example    
    .start-btn
      position: absolute
      font-size: 50px
      top: calc(50% - 25px)
      left: calc(50%  - 25px)
      cursor: pointer 
        
    .pause-btn
      position: absolute
      bottom: 5px
      left: 5px
      cursor: pointer

    .back-btn
      position: absolute
      bottom: 5px
      right: 25px
      cursor: pointer    

    .next-btn
      position: absolute
      bottom: 5px
      right: 5px
      cursor: pointer      

    .destroy-btn
      position: absolute
      top: 5px
      right: 5px
      cursor: pointer        

    .fas
      color: black
    .fas:hover
      color: #546de5

</style>
