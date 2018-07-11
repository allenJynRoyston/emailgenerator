<template lang="pug">
  .section
    #emailGenerator
      .row
        h2.center-text Email Generator       
      .row        
        .four.columns(v-if='jsonIsReady')
          a.button.tabs(@click='activeTab = 0' v-bind:class='activeTab === 0 ? "button-primary" : ""') Master
          a.button.tabs(@click='activeTab = 1' v-bind:class='activeTab === 1 ? "button-primary" : ""') Partials
          a.button.tabs(@click='activeTab = 2' v-bind:class='activeTab === 2 ? "button-primary" : ""') Reset
          

          // MASTER CONTENT EDITOR
          div(v-if='activeTab === 0')
            .row(v-for="global in jsonFile.globals")
              .four.columns 
                label.left {{global.title}}
              .eight.columns 
                input(v-model='global.value')
            hr
          
          // PARTIAL CONTENT EDITOR
          div(v-if='activeTab === 1')
            div(v-for='(partial, index) in jsonFile.partials')
              .row.flex-row
                .nine.columns
                  select(v-model="partial.name" v-on:change="onChange()" style='width: 100%; margin: 0px')
                    option(v-for="option in componentOptions" v-bind:value="option.name")
                      p {{ option.name }}
                .two.columns(style='display: flex; justify-content: space-around')                         
                  i.fas.fa-angle-double-up.pointer.green(@click='moveItemUp(index)' v-bind:class='index === 0 ? "disabled" : ""')             
                  i.fas.fa-angle-double-down.pointer.green(@click='moveItemDown(index)' v-bind:class='index === jsonFile.partials.length -1 ? "disabled" : ""')             
                .one.columns
                  i.far.fa-times-circle.pointer.red(@click='removeItem(index)')                     


              .row(v-for="field in partial.content")   
                .three.columns 
                  label.left {{field.key}}
                .eight.columns 
                  input(v-model='field.value' v-if='field.type === "input"')  
                  textarea(v-bind:class='field.focused ? "textarea-open" : ""' placeholder='Insert HTML here' v-model='field.value' v-if='field.type === "textarea"' @focus='field.focused = true' @blur='field.focused = false')                  
              hr           

            .twelve.columns.minor-padding
              button.full-width.button-primary(@click='addNewSection()') Add More              
            hr               
          
          
          // BUILD BUTTON
          div(v-if='activeTab < 2')

            div
            .twelve.columns.minor-padding
                button.full-width(@click='createOutput()') Build


          // PARTIAL CONTENT EDITOR
          div(v-if='activeTab === 2')
            .twelve.columns.minor-padding
              button.full-width(@click='addNewSection()') Restore Defaults Layout                  
            hr 
            div
            .twelve.columns.minor-padding
              button.full-width.button-primary(@click='createOutput()') Restore Default Colors  


        // PREVIEW SECTION
        .eight.columns
          h5.center-text.no-padding Preview
          div
            iframe.fullframe(v-if='iframeIsReady && templateExists' src="./output/template.html")

      .row   
        br
        .twelve.columns(style='padding: 10px')
          p {{this.jsonFile}}


</template>

<script src='./emailGenerator.js'></script>

<style lang="sass" scoped>  
    #emailGenerator
      padding: 50px!important

      .flex-row
        display: flex;
        align-items: center;
        justify-content: left; 
        padding: 10px     

      .tabs
        border-radius: 0px!important
        width: 33.334%
        color: #0a3d62
      
      .full-width
        width: 100%

      .minor-padding
        padding: 10px 10px

      .left
        text-align: left
        margin-left: 10px
        color: #0a3d62        
        text-transform: uppercase
        font-size: 12px
        margin-top: 7px

      .no-padding
        padding: 10px
        margin: 0px

      .columns
        background-color: #dcdde1
        color: #2f3640
        overflow: hidden
      
      .fullframe
        width: 95%
        height: 1200px
        margin-left: 15px     
        margin-bottom: 20px  
      
      .center-text
        text-align: center
      
      .section-text
        padding: 10px
        margin: 0px
        text-align: center
        color: blue

      .subsection-text
        color: white
        font-size: 14px
        margin-left: 10px
        text-transform: uppercase
        font-weight: bold

      .select
        width: 100%
        margin: 0px

</style>
