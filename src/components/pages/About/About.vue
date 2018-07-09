<template lang="pug">
  .section
    .container
      .row
        h1 ABOUT
      .row
        .twelve.columns
          GridComponent(:columns=3 :rows=3 :blocksize=300 :padding=1 :data='gridData_1')        
      .row
        .twelve.columns
          img(v-bind:src='testimage.default')
      .row
        .twelve.columns
          GridComponent(:columns=4 :rows=3 :blocksize=300 :padding=1 :data='gridData_2')
</template>

<script src='./about.js'></script>

<style lang="sass" scoped>
  .row
    margin-top: 10px
</style>
