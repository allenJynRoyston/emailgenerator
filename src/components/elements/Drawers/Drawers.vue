<template lang="pug">
  #drawers.section   
    .close-panel(@click='closeDrawer()')        
    .slide-1
      a(v-for='route in routes' v-on:click='closeDrawer()')
        router-link(v-bind:to="route.goto") {{route.title}}
        br
      .close-icon(v-on:click='closeDrawer()')
            a
              i.fas.fa-times        
</template>

<script src='./drawers.js'></script>


<style lang="sass" scoped>

  $tablet: "(min-width: 768px) and (max-width: 1023px)"
  $desktop: "(min-width: 1024px)"

  #drawers
    position: fixed
    width: 100%
    height: 100%
    z-index: 99

  #drawers .close-panel
    position: absolute
    top: 0
    width: 100%;
    height: 100%
    background-color: black
    opacity: 0.5

  #drawers .close-icon
    position: absolute
    top: 25px
    right: 0px

  #drawers .slide-1
    position: absolute
    top: 0
    width: 30%;
    min-width: 225px
    max-width: 250px
    height: 100%
    background-color: #2f2f2f
    color: white
    opacity: 1
    transform: translateX(-100%)
    padding: 20px 0px 0px 20px    
    @media only screen and (max-width: 640px) 
      width: 100%;
      max-width: 100%

  #drawers a
    font-size: 1.5em
    text-decoration: none
    margin-right: 30px
    color: white
    cursor: pointer
</style>
