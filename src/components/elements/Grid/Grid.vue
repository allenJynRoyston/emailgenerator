<template lang="pug">
  .section(v-if='gridConfig !== null')
    div(v-bind:class='gridConfig.blockStyles.classes.wrapper')
      div(v-bind:class='gridConfig.blockStyles.classes.container')        
        div(v-for='(item, index) in gridConfig.data' v-bind:class='setGridSize(item, index)')
          div(v-bind:class='gridConfig.blockStyles.classes.inside')
            p {{index + 1}}
</template>


<script src='./grid.js'></script>


<style lang="sass" scoped>


</style>
