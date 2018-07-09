<template lang="pug">
  div
    a(v-for='demo in demos' @click='loadFile(demo.file)') {{demo.title}} &nbsp;&nbsp;&nbsp;&nbsp;
    br
    br
    #phaser-example
</template>

<script src='./gameComponent.js'></script>


<style lang="sass" scoped>

</style>
