//--------------
__three = {

    self: null,
    global:{
      destroyed: false,
      isPaused: false
    },

    //-------------------
    main:{

      //-------------------
      init(el, parent, options){

        //-----------------------
        var scene = new THREE.Scene();
        var dimensions = {width: options.width, height: options.height}
  			var camera = new THREE.PerspectiveCamera( 75, dimensions.width/dimensions.height, 0.1, 1000 );
        var renderer = new THREE.WebGLRenderer();
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        this.self = {
          scene: scene,
          camera: camera,
          renderer: renderer
        }

        __three.self = self;
        parent.game = __three;

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
          if(!__three.global.isPaused && !__three.global.destroyed){
    				requestAnimationFrame( animate );
    				cube.rotation.x += 0.01;
    				cube.rotation.y += 0.01;
    				renderer.render(scene, camera);
          }
  			};
        //-----------------------


      },
    },
    //-------------------


    //-------------------
    destroy(){
      this.global.destroyed = true;
      return true
    }
    //-------------------


}
//--------------
