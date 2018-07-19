<template lang="pug">
  .container.game-container
    center
      PixiComponent.bg-canvas(v-bind:files='pixiFiles' width='300' height='300' allowpause allowdestroy allowcontrols orderdelay='1') 
</template>

<script src='./pixi.js'></script>

<style lang="sass" scoped>

</style>
