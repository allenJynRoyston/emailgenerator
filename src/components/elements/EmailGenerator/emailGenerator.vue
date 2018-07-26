<template lang="pug">
  .section
    #loadModal(v-bind:class='openLoadModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
      .modal-panel(style='text-align: center; width: 400px')  
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openLoadModal = false; io.loadSelected = io.filename')      
        h3 Load File
        .row.flex-row
          .columns.two
            label Filename
          .columns.ten
            select(v-model='io.loadSelected')
              option(v-for="file in io.currentFiles") {{file.name}}       
          .twelve.columns
            br
            button.button-primary(@click='loadFile()' v-show='io.loadSelected !== "default"') Load  

    #saveModal(v-bind:class='openSaveModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
      .modal-panel(style='text-align: center; width: 400px')  
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openSaveModal = false')      
        h3 Save As...
        .row.flex-row
          .columns.two
            label Filename
          .columns.ten
            input(v-model='io.saveSelected')        
          .twelve.columns
            br
            button.button-primary(@click='saveFile()' v-show='io.saveSelected !== "default"') Save        
        
    #successModal(v-bind:class='openSuccessModal ? "show-modal" : "close-modal"' )
      .modal-panel(style='text-align: center')  
        h3 {{wittyRetort}}
        i.fas.fa-thumbs-up.fa-5x

    #previewModal(v-bind:class='openPreviewModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
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

    #imageModal(v-bind:class='openImageModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
      .modal-panel  
        h3 Images   
        .row
          span
            a(@click='imageModalType  = 0') Select Images
            | &nbsp;&nbsp;|&nbsp;&nbsp;
            a(@click='imageModalType  = 1') Use URL 
            | &nbsp;&nbsp;|&nbsp;&nbsp;
            a(@click='imageModalType  = 2') Upload New Image
          hr
        .row(v-show='imageModalType === 0')
          p Select an available image: 
          div(style='max-width: 800px; max-height: 600px; overflow: auto')
            a(v-for='image in dropdowns.images' style='position: relative; margin-right: 10px; display: inline-block')
              .deleteimage-btn(@click='deleteImage(image)')
                i.fas.fa-times.fa-2x            
              img.image-selectable(v-bind:src='image.src' @click='imageSelect(image)')  
              a.image-name(@click='imageSelect(image)') {{image.name}}
        .row.flex-row(v-show='imageModalType === 1' style='width: 600px')
          p Enter a valid url:
          input(v-model='imageUrl' placeholder='Enter url:  (i.e. https://picsum.photos/600/300)') 
          span &nbsp;&nbsp;
          button.button(@click='imageSelectUrl(imageUrl)') Enter
        .row.flex-row(v-show='imageModalType === 2' style='width: 600px')     
          p Drag and drop images you wish to upload:
          .dropbox
            div(v-show='!upload.processing')
              input.input-file(type='file', multiple='' name="images" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length" accept="image/*" class="input-file" )
              p(v-show='upload.uploadfiles.length === 0') Upload Images
              ul(v-show='upload.uploadfiles.length > 0') 
                li( v-for='files in upload.uploadfiles') {{files.name}}
            div(v-if='upload.processing'  style='text-align: center; margin-top: 40px')            
              i.fas.fa-spinner.fa-spin                            
          div(v-show='upload.uploadfiles.length > 0 && !upload.hasError && !upload.processing') 
            br
            button.button(@click='upload.uploadfiles = []') Clear
            button.button.button-primary(@click='uploadFiles()' style='float: right') Upload     
          p(v-show='upload.hasError') Cannot upload files right now - please try again.
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openImageModal = false')
      
    #emailmodal(v-bind:class='openModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
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


    #globalColorSelectorModal(v-bind:class='openGlobalColorModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
      .modal-panel  
        h3 Set Global Color
        .row     
          p Enter a HEX (i.e. #f2f2f2), RGB value (i.e. rgb(255, 255, 255)), or string (i.e. red, blue, green, etc):
          input(v-model='colorSelector' style='width: 200px')
          span &nbsp;&nbsp;
          button.button(@click='setGlobalColor(colorSelector)') Enter          
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openGlobalColorModal = false')   

    #colorSelectorModal(v-bind:class='openColorModal ? "show-modal" : "close-modal"' v-if='jsonIsReady')
      .modal-panel  
        h3 Color Selector   
        .row     
          p Select from global colors:             
          .color-block-large(@click='setColor(field)' v-for="(field, index) in jsonFile.globals.content" v-if='field.type === "inputcolor"' v-bind:style="{ 'background-color': field.value }")   
        .row.flex-row  
          hr               
          br
          p Or enter a HEX (i.e. #f2f2f2), RGB value (i.e. rgb(255, 255, 255)), or string (i.e. red, blue, green, etc):
          input(v-model='colorSelector' style='width: 200px')
          span &nbsp;&nbsp;
          button.button(@click='colorSelect(colorSelector)') Enter          
        .cancel-btn
          i.fas.fa-times.fa-2x(@click='openColorModal = false')               

    #emailGenerator
      .row.devwarning(v-if='devBuild')
        h3.center-text DEV MODE ENABLED         
        p This mode is for developing the UI/UX - PREVIEW WILL NOT BE UPDATED
          
      .row        
        .five.columns(v-if='jsonIsReady')          
          a.button.tabs(v-for='(option, index) in menuOptions' @click='activeTab = index; addToUrlParams(option)' v-bind:class='activeTab === index ? "button-primary" : ""') {{option.title}}        
          div(style='max-height: 925px; overflow-y: scroll')
            
            // MASTER CONTENT EDITOR
            div(v-if='activeTab === 0')
              .twelve.columns.minor-padding.center-text
                button.button-primary.button.large-buttons(@click='resetBuild()') New
              .twelve.columns.minor-padding.center-text
                button.large-buttons(@click='fetchSavedFiles(); openLoadModal = true') Load
              .twelve.columns.minor-padding.center-text
                button.large-buttons(@click='openSaveModal = true') Save            

            // MASTER CONTENT EDITOR
            div(v-if='activeTab === 1')             
              .row.flex-row(v-for="field in jsonFile.globals.content")              
                .four.columns 
                  p.text-right.is-label {{field.title}}
                .eight.columns 
                  input(v-model='field.value'  v-if='field.type === "input"') 
                  // INPUTPX
                  input(v-model='field.value' type='number' v-if='field.type === "inputpx"' style='width: 100px')  
                  input(v-if='field.type === "inputpx"' value='px' style='width: 20px' disabled)                                            
                  // INPUT COLOR
                  input.color-inputinput(@click='openGlobalColorModal = true; colorSelected = field' v-model='field.value' v-if='field.type === "inputcolor"' style='width: 88px; cursor: pointer')   
                  .color-block(@click='openGlobalColorModal = true' v-if='field.type === "inputcolor"' v-bind:style="{ 'background-color': field.value }")                
              hr             
              .twelve.columns.minor-padding.center-text
                button.large-buttons(@click='restoreGlobalDefaults()') Restore Global Defaults          
            
            // PARTIAL CONTENT EDITOR
            div(v-if='activeTab === 2')             
              div(v-for='(partial, index) in jsonFile.partials')      
                .row.flex-row
                  .nine.columns                  
                    button(@click='indexStored = index; openModal = true') 
                      | {{partial.name}}             
                    button(style='margin-left: 10px; float: right' @click='partial.showProps = !partial.showProps') 
                      i(v-bind:class='partial.showProps ? "fas" : "far"').fa-edit 
                  .two.columns(style='display: flex; justify-content: space-around')                         
                    i.fas.fa-angle-double-up.pointer.green(@click='moveItemUp(index)' v-bind:class='index === 0 ? "disabled" : ""')             
                    i.fas.fa-angle-double-down.pointer.green(@click='moveItemDown(index)' v-bind:class='index === jsonFile.partials.length -1 ? "disabled" : ""')             
                  .one.columns
                    i.far.fa-times-circle.pointer.red(@click='removeItem(index)')                     

                .row.flex-row(v-for="field in partial.content" v-show='partial.showProps')   
                  .four.columns 
                    p.is-label {{field.title}}
                  .seven.columns 
                    // INPUTIMAGES
                    a(@click='imageSelected = field; openImageModal = true')
                      img.image-thumbnail(v-if='field.type === "inputimage"' v-bind:src='field.value')           
                    // INPUT 
                    input(v-model='field.value' v-if='field.type === "input"')       
                    // INPUT COLOR
                    input.color-inputinput(@click='openColorModal = true; colorSelected = field' v-model='field.value' v-if='field.type === "inputcolor"' style='width: 88px; cursor: pointer')   
                    .color-block(@click='openColorModal = true' v-if='field.type === "inputcolor"' v-bind:style="{ 'background-color': returnColorValue(field.value) }")                                
                    // INPUTFONT
                    select(v-model='field.value' v-if='field.type === "inputfont"')
                      option(v-for='font in dropdowns.fontfamilies') {{font}}
                    // INPUTPX
                    input(v-model='field.value' type='number' v-if='field.type === "inputpx"' style='width: 100px')  
                    input(v-if='field.type === "inputpx"' value='px' style='width: 20px' disabled)  
                    // INPUTFONTWEIGHT
                    select(v-model='field.value' v-if='field.type === "inputfontweight"')
                      option(v-for='weight in dropdowns.fontweight') {{weight}}
                    // INPUTALIGNMENT
                    select(v-model='field.value' v-if='field.type === "dropdownalignment"')
                      option(v-for='weight in dropdowns.alignment') {{weight}}                    
                    p(v-if='field.key === "content"') 
                    // TEXTAREA
                    textarea(v-bind:class='field.focused ? "textarea-open" : ""' placeholder='Insert HTML here' v-model='field.value' v-if='field.type === "textarea"' @focus='field.focused = true' @blur='field.focused = false')                  
                hr           

              .twelve.columns.minor-padding.center-text
                button.button-primary.large-buttons(@click='addNewSection()') Add More              
              hr               
            
            
            // OPTIONS EDITOR
            div(v-if='activeTab === 3')
              .row.flex-row(v-for='option in options' )
                .five.columns
                  p.text-right.is-label(v-if='option.visibleif()') {{option.title}}
                .seven.columns
                    button.button(v-if='option.type === "boolean"' v-bind:class='option.value ? "button-primary" : ""' @click='option.value = !option.value; setUserOptions()') {{option.value}}
                    input(v-if='option.type === "number"' type='number' @change='setUserOptions()' v-model='option.value' v-show='option.visibleif()') 
                
                  
              

        // PREVIEW SECTION
        #preview-container.seven.columns
          h5.center-text.no-padding Preview 
          p.center-text current file: 
            strong {{io.filename}}.html
          button.button.preview-btn(@click='copyToClipboard()') Copy To Clipboard
          a.newwindow-btn(href='/output/template.html' target="_blank") View in new window
          .loading-ctn(v-if='!iframeIsReady')    
            i.fas.fa-spinner.fa-spin 
          #iframecontainer(v-bind:class='iframeZoom === 0 ? "fullframe-xs" : "fullframe-md"')
            iframe(id='iframeContainer' src="./html/iframe.html" style='width: 100%; height: 100%' v-bind:class='iframeZoom === 0 ? "iframe-xs" : ""')



      // BUILD BUTTON
      .autobuild-btn(v-if='!setOptions.autobuild')
        button.full-width(@click='createOutput()') Build


</template>

<script src='./emailGenerator.js'></script>

<style lang="sass" scoped>  
    #saveModal, #loadModal, #successModal, #emailmodal, #imageModal, #colorSelectorModal, #globalColorSelectorModal
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

      .image-selectable
        width: auto
        min-width: 100px
        height: 100px
        padding: 10px 
        border: 1px solid #2980b9
        margin-left: 20px
        margin-bottom: 20px
      
      .image-selectable:hover
        background-color: #2980b9
        border: 1px solid white 

      .dropbox 
        outline: 2px dashed grey
        outline-offset: 0px
        background: lightcyan
        color: dimgray
        padding: 10px 10px;
        min-height: 200px
        position: relative
        cursor: pointer
        
      .input-file 
        opacity: 0
        width: 100%
        height: 200px
        position: absolute
        cursor: pointer
      
      .dropbox:hover 
        background: lightblue
      
      .dropbox li
        font-size: 14px

      .color-block-large
        display: inline-block
        border: 1px solid black
        cursor: pointer
        width: 50px 
        height: 50px     
        margin-left: 10px   
        margin-right: 11px

      .image-name
        color: black; 
        position: absolute
        bottom: 0px 
        left: 20px
        max-width: 120px
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis     

      .deleteimage-btn
        position: absolute
        top: 0px
        left: 10px
        width: 21px
        height: 29px
        background-color: white
        color: black
        margin-left: 10px
        padding: 5px

      .deleteimage-btn:hover
        background-color: red
        color: white


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
         
    .modal-panel
      position: relative
      width: auto
      max-width: 900px
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
      position: relative
      z-index: 1
      .preview-btn
        position: absolute
        left: 15px
        top: 10px
      .newwindow-btn
        position: absolute
        right: 15px
        top: 125px      
        color: white
        background-color: black
        padding: 10px
        text-decoration: none
      .loading-ctn
        position: absolute
        right: 15px
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
        width: 25%
        color: #0a3d62
      
      .full-width
        width: 100%          
      
      .large-buttons
        width: 80%
        max-width: 400px
      
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

      select, input, textarea
        width: 90%
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

      .iframe-xs
        transform: scale(.50)
        margin-top: -750px

      #iframecontainer        
        height: 870px          

      .image-thumbnail
        max-height: 100px
        width: auto

      .color-input
        width: 88px
        cursor: pointer
        background-color: white

      .color-block  
        display: block-inline        
        border: 1px solid black
        cursor: pointer
        width: 30px 
        height: 30px
        float: left  
        margin-right: 5px
 



        

</style>
