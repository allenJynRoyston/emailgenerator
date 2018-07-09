<template lang="pug">
  #overlay(v-bind:class='isActive ? "visible" : "hidden"')
    .loading-container
      p
        span.fa.fa-spinner.fa-pulse.fa-fw
</template>

<script src='./overlay.js'></script>


<style lang="sass" scoped>
  #overlay
    position: fixed
    width: 100%
    height: 100%
    z-index: 100
    pointer-events: none
    text-align: center
    background-color: white

  .loading-container
    margin-top: 50px

  .visible
    opacity: 1

  .hidden
    opacity: 0

</style>
