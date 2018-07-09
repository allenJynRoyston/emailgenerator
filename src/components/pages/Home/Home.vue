<template lang="pug">
  #email-section.section(style='padding: 50px')  
      .row
        h2 Email Generator
      .row
        .four.columns 

          h5.no-padding Master
          hr          
          div(v-if='jsonIsReady')
            div(v-for="(value, key, index) in jsonFile.master")
              h6.left
                label {{key}} 
                input(v-bind:placeholder='value' v-model='jsonFile.master[key]')
          hr

          h5.no-padding Build Partials
          hr          
          div(v-if='jsonIsReady')
            h6.left(v-for='partial in jsonFile.partials') {{partial.name}}
              br
              div(v-for="(value, key, index) in partial.content")
                label {{key}}
                input(v-bind:placeholder='value' v-model='partial.content[key]')
          hr

          button(@click='createOutput()') Build
        .eight.columns
          h5.no-padding Preview {{iframeIsReady}}
          div
            iframe.fullframe(v-if='iframeIsReady' src="./output/template.html")

        .twelve.columns(style='padding: 10px')
          p {{jsonFile}}


</template>

<script src='./home.js'></script>

<style lang="sass" scoped>  
    .left
      text-align: left
      margin-left: 10px
      font-weight: bold
      text-transform: uppercase

    .no-padding
      padding: 10px
      margin: 0px

    .columns
      border: 1px solid white
      background-color: lightgray
      color: black
      text-align: center
      overflow: hidden
    
    .fullframe
      width: 95%
      height: 1200px
      margin-left: -2px     
      margin-bottom: 20px  
</style>
