declare var THREE:any;

class ThreeObject {
    // this properties
    global:any;
    game:any;

    constructor(){
      // accessible in gameObject as _this, accessible in class functions as this (obviously)
      this.game = null;
      this.global = {
        destroyed: false,
        updatePause: false
      };
    }

    init(el:any, parent:any, options:any){
      // declare variables
      let scene = new THREE.Scene(),
          dimensions = {width: options.width, height: options.height},
    			camera = new THREE.PerspectiveCamera( 75, dimensions.width/dimensions.height, 0.1, 1000 ),
          renderer = new THREE.WebGLRenderer(),
          geometry = new THREE.BoxGeometry( 1, 1, 1 ),
          material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
          cube = new THREE.Mesh( geometry, material ),
          _this = this;

      // make game accessible to parent element
      parent.game = this;

      // make accessible to class functions
      this.game = {
        scene: scene,
        camera: camera,
        renderer: renderer
      };

      create();
      animate();
      //-----------------------

      //-----------------------
      function create(){
        renderer.setSize( dimensions.width, dimensions.height );
        el.appendChild( renderer.domElement );
        scene.add( cube );
        camera.position.z = 5;
      }
      //-----------------------

      //-----------------------
      function animate(){

        if(!_this.global.updatePause && !_this.global.destroyed){
          requestAnimationFrame( animate );
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          renderer.render(scene, camera);
        }
      };
      //-----------------------

    }

    destroy(){
      this.global.destroyed = true;
      return true
    }

}

let __three = new ThreeObject();
