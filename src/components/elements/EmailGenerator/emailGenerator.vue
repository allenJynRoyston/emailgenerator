<template lang="pug">
  .section
    #successModal(v-bind:class='openSuccessModal ? "show-modal" : "close-modal"')
      .modal-panel(style='text-align: center')  
        h3 {{wittyRetort}}
        i.fas.fa-thumbs-up.fa-5x
    #previewModal(v-bind:class='openPreviewModal ? "show-modal" : "close-modal"')
      .modal-panel  
        h3 HTML Preview        
        .htmlpreview-container
          pre
            code(v-if='iframeIsReady' style='width: 3000px;')
              p {{htmlPreview}}
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openPreviewModal = false')
        br
        .row.flex-row          
          a.button.button-primary(href='/output/template.html' download) Download HTML
          a.button(@click='copyToClipboard()') Copy To Clipboard
          a(href='/output/template.html' target="_blank") View in new window

    #emailmodal(v-bind:class='openModal ? "show-modal" : "close-modal"')
      .modal-panel
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openModal = false')
        .row
          .columns.twelve
            h3 Select a partial        
          .columns.twelve(v-for="option in componentOptions" style='padding: 0px 10px; width: 25%')
            button.button(@click='selectedOption(option)' style='width: 100%' v-bind:class='option.active ? "button-primary" : ""' v-on:mouseover="option.active = true" v-on:mouseout="option.active = false") {{option.name}}                    
          .columns.twelve
            hr
        .row          
          p * Changing a partial will overwrite your existing properties

    #emailGenerator
      .row.devwarning(v-if='devBuild')
        h3.center-text DEV MODE ENABLED         
        p This mode is for developing the UI/UX - PREVIEW WILL NOT BE UPDATED
            
      .row(v-if='!devBuild')
        h2.center-text Email Generator       
      .row        
        .four.columns(v-if='jsonIsReady')
          a.button.tabs(@click='activeTab = 0' v-bind:class='activeTab === 0 ? "button-primary" : ""') Master
          a.button.tabs(@click='activeTab = 1' v-bind:class='activeTab === 1 ? "button-primary" : ""') Partials
          a.button.tabs(@click='activeTab = 2' v-bind:class='activeTab === 2 ? "button-primary" : ""') Options
          

          // MASTER CONTENT EDITOR
          div(v-if='activeTab === 0')             
            .row.flex-row(v-for="content in jsonFile.globals.content")              
              .four.columns 
                p.text-right.is-label {{content.title}}
              .eight.columns 
                input(v-model='content.value')
            hr
          
          // PARTIAL CONTENT EDITOR
          div(v-if='activeTab === 1')             
            div(v-for='(partial, index) in jsonFile.partials')      
              .row.flex-row
                .nine.columns                  
                  button(@click='indexStored = index; openModal = true') 
                    | {{partial.name}} &nbsp;&nbsp;&nbsp;  
                    i.fas.fa-caret-square-down(style='color: orange')                  
                  button(style='margin-left: 10px; float: right' @click='partial.showProps = !partial.showProps') 
                    i(v-bind:class='partial.showProps ? "fas" : "far"').fa-edit
                .two.columns(style='display: flex; justify-content: space-around')                         
                  i.fas.fa-angle-double-up.pointer.green(@click='moveItemUp(index)' v-bind:class='index === 0 ? "disabled" : ""')             
                  i.fas.fa-angle-double-down.pointer.green(@click='moveItemDown(index)' v-bind:class='index === jsonFile.partials.length -1 ? "disabled" : ""')             
                .one.columns
                  i.far.fa-times-circle.pointer.red(@click='removeItem(index)')                     

              .row.flex-row(v-for="field in partial.content" v-show='partial.showProps')   
                .three.columns 
                  p.text-right.is-label {{field.key}}
                .eight.columns 
                  input(v-model='field.value' v-if='field.type === "input"')  
                  textarea(v-bind:class='field.focused ? "textarea-open" : ""' placeholder='Insert HTML here' v-model='field.value' v-if='field.type === "textarea"' @focus='field.focused = true' @blur='field.focused = false')                  
              hr           

            .twelve.columns.minor-padding
              button.full-width.button-primary(@click='addNewSection()') Add More              
            hr               
          
          
          // PARTIAL CONTENT EDITOR
          div(v-if='activeTab === 2')
            .row.flex-row(v-for='option in options' )
              .five.columns
                p.text-right.is-label(v-if='option.viisibleif()') {{option.title}}
              .seven.columns
                  button.button(v-if='option.type === "boolean"' v-bind:class='option.value ? "button-primary" : ""' @click='option.value = !option.value; setUserOptions()') {{option.value}}
                  input(v-if='option.type === "number"' type='number' @change='setUserOptions()' v-model='option.value' v-show='option.viisibleif()') 
            .row
              hr
            .row.flex-row              
              button.button(@click='resetBuild()' style='width: 100%') Reset Partials
                
              
            // .twelve.columns.minor-padding
            //   button.full-width(@click='addNewSection()') Restore Defaults Layout                  
            // hr             
            // .twelve.columns.minor-padding
            //   button.full-width.button-primary(@click='createOutput()') Restore Default Colors  


        // PREVIEW SECTION
        #preview-container.eight.columns
          h5.center-text.no-padding Preview
          button.button.preview-btn(@click='openPreviewModal = true') PREVIEW HTML
          iframe.fullframe(v-if='iframeIsReady' src="/output/template.html")
          div(v-if='!iframeIsReady'  style='text-align: center; margin-top: 40px')            
            h3
              i.fas.fa-spinner.fa-spin 

            

      // BUILD BUTTON
      .autobuild-btn(v-if='!setOptions.autobuild')
        button.full-width(@click='createOutput()') Build


</template>

<script src='./emailGenerator.js'></script>

<style lang="sass" scoped>  
    #successModal
      position: fixed
      top: 0
      height: 100%
      width: 100%
      background-color: rgba(0, 0, 0, .5)
      color: white
      display: flex
      align-items: center
      justify-content: center
      z-index: 15

    #previewModal      
      position: fixed
      top: 0
      height: 100%
      width: 100%
      background-color: rgba(0, 0, 0, .5)
      color: white
      display: flex
      align-items: center
      justify-content: center
      z-index: 10

      .htmlpreview-container
        width: 800px
        height: 800px
        overflow-y: scroll

      .button
        float: right
        margin-left: 20px
      
      a 
        text-decoration: none
        margin-top: -10px

    #emailmodal      
      position: fixed
      top: 0
      height: 100%
      width: 100%
      background-color: rgba(0, 0, 0, .5)
      color: white
      display: flex
      align-items: center
      justify-content: center
      z-index: 10
         
    .modal-panel
      position: relative
      width: auto
      height: auto
      padding: 30px
      background-color: white
      color: black
      border-radius: 10px

      .cancel-btn
        position: absolute
        right: 20px
        top: 20px   
        cursor: pointer
        color: orange        
        
    .show-modal
      pointer-events: auto
      opacity: 1
      transition: 0.25s

    .close-modal
      pointer-events: none
      opacity: 0
      transition: 0.1s      

    #preview-container
      min-height: 1200px
      position: relative
      z-index: 1
      .preview-btn
        position: absolute
        left: 15px
        top: 10px


    #emailGenerator
      padding: 50px!important

      .devwarning
        background-color: orange
        display: flex        
        flex-direction: column
        align-items: center
        justify-content: center
        margin-bottom: 20px
        margin-top: -50px
        h3 
          padding: 20px
          margin: 0px


      .flex-row
        display: flex;
        align-items: center;
        justify-content: left; 
        padding: 10px     
        p
          padding: 0px
          margin: 0px
        button
          margin: 0px

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

      .text-right
        text-align: right
      
      .is-label
        text-transform: uppercase
        color: #0a3d62        


      .autobuild-btn
        position: fixed
        bottom: 0px
        left: 0px
        width: 100%    
        z-index: 1      
        button
          height: 75px
          margin: 0px
          padding: 0px  
          border-radius: 0px  
          background-color: #8395a7
          color: white
          border: none
        button:hover
          background-color: #576574       
          color: white        


</style>
