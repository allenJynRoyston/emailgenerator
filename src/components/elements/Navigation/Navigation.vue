<template lang="pug">
    #animateme.row.nav-bar    
      a.left-link(@click='setHeader(true)')
        router-link(to="/" )
          img(v-bind:src='logo.default' style='height: 80px; width: auto; margin-top: -30px')
      a(@click='setDrawer(!drawerIsOpen)')
        i.fas.fa-bars               
      a.links(v-for='route in routes' v-on:click='setHeader(route.expand)')
        router-link(v-bind:to="route.goto") {{route.title}}
   
</template>

<script src='./navigation.js'></script>


<style lang="sass" scoped>
  .nav-bar
    padding: 15px
    background-color: #2f2f2f
    text-align: center
    display: flex    
    justify-content: center 

  a
    font-size: 1em
    text-decoration: none   
    color: white
    cursor: pointer
  
  a:not(:last-child)
    margin-right: 30px

  a:hover
    color: darkgray

  a.links
    @media only screen and (max-width: 640px) 
      display: none
    
  .left-link
    position: absolute
    left: 20px
    opacity: 0
    @media only screen and (max-width: 640px) 
      display: none

</style>
