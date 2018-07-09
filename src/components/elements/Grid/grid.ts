declare var style:any;

export default {
  props: ['data', 'columns', 'rows', 'blocksize', 'padding'],
  data() {
    return {
      store: this.$store,
      props: this.$props,
      gridConfig: null
    }
  },
  mounted(){
    // // get props/prop defaults
    let {columns = 0, rows = 0, blocksize = 0, padding = 0, data = []} = this.props;

    // // define screen breakpoints
    let breakpoints = {desktop: 1600, tablet: 1024, mobile: 600}

    // // set grid size
    let gridSize = {
      columns,
      rows,      
      blocksize
    }

    // programatically create stylesheet for grid system
    let blockStyles = (() => {
      let randomId = Math.floor(Math.random() * Math.floor(1000));
      let classes = {
        randomId,
        wrapper: `${randomId}_grid-wrapper`,
        container: `__${randomId}_grid-container`,
        box: `__${randomId}_grid-box`,
        inside: `__${randomId}_grid-inside`,
      }

    // Create the <style> tag
    let style = document.createElement('style');      
    
    // WebKit hack :(
    let rtStylesheet = `
        .${classes.wrapper}{
          display: grid;
          width: 100%;
          height: auto
        }

        /* destkop grid */
        .${classes.container} {
          display: grid;
          row-gap: ${padding}px;
          column-gap: ${padding}px;
          grid-template-columns: repeat(${gridSize.columns}, ${(100 / gridSize.columns)}%);
          grid-template-rows: repeat(${gridSize.rows}, ${blocksize}px);          
        }  

        /* tablet grid */
        @media only screen and (max-width: ${breakpoints.tablet}px) {
          .${classes.container} {
            display: grid;
            grid-template-columns: 50% 50%;
            grid-template-rows: repeat(auto, ${blocksize}px);             
          }  
        }  

        /* mobile grid */
        @media only screen and (max-width: ${breakpoints.mobile}px) {
          .${classes.container} {
            display: grid;
            grid-template-columns: 100%;
            grid-template-rows: repeat(auto,${blocksize}px);            
          }  
        }          

        .${classes.box} {          
          font-size: 150%;
          overflow: hidden
        }

        .${classes.inside} {
          width: 100%;
          height: 100%;
          background-color: #444;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;          
        }        
      ` 

      // add to DOM
      style.appendChild(document.createTextNode(rtStylesheet));      
      document.head.appendChild(style);     
      (<any>style.sheet).classes = classes;
        
      return style.sheet;
    })();

    this.gridConfig = {blockStyles, data, breakpoints, gridSize}
    console.log(this.gridConfig)
  },
  methods: {
    setGridSize(ele, index){     
      let {data, blockStyles, breakpoints, gridSize} = this.gridConfig;
      
      let styleName = `__${this.gridConfig.blockStyles.classes.randomId}_block_${index}`;
      let style; 

      // for desktop
      style = `
        .${styleName} { 
          grid-column: ${ele.location.column}/ ${(ele.location.column + ele.size)};  
          grid-row: ${ele.location.row}/ ${(ele.location.row + ele.size)}; 
        }
      `
      blockStyles.insertRule(`${style}`, blockStyles.cssRules.length);
      
      // for tablet
      style = `
        @media only screen and (max-width: ${breakpoints.tablet}px) {
          .${styleName} { 
            grid-column: auto;
            grid-row: auto;
            height: ${gridSize.blocksize}px
          }
        }
      `
      blockStyles.insertRule(`${style}`, blockStyles.cssRules.length);
      
      // for mobile
      style = `
      @media only screen and (max-width: ${breakpoints.mobile}px) {
        .${styleName} { 
          grid-column: auto;
          grid-row: auto;
          height: ${gridSize.blocksize}px
        }
      }
      `
      blockStyles.insertRule(`${style}`, blockStyles.cssRules.length);

 
      return `${blockStyles.classes.box} ${styleName}`;

    }
  }
}