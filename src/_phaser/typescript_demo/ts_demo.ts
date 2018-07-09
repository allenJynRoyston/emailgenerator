declare var Phaser:any;

class PhaserGameObject {
    // this properties
    global:any;
    game:any;

    constructor(){
      // accessible in gameObject as _this, accessible in class functions as this (obviously)
      this.game = null;
      this.global = {
        updatePause: false
      };
    }

    init(el:any, parent:any, options:any){
      // declare variables
      let isPaused = false,
          dimensions = {width: options.width, height: options.height},
          game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { create: create, update: update }),
          filter = null,
          sprite = null,
          _this = this;

      // make game accessible to parent element
      parent.game = this;

      // make accessible to class functions
      this.game = game;

      function create(){
        //  From http://glslsandbox.com/e#18918.0
        // Tenjix",
        var fragmentSrc = [
          "precision mediump float;",
          "uniform vec2      resolution;",
          "uniform float     time;",

          "void main( void )",
          "{",
              "vec2 p = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;",

              "vec3 c = vec3( 0.0 );",

              "float amplitude = 0.50;",
              "float glowT = sin(time) * 0.5 + 0.5;",
              "float glowFactor = mix( 0.15, 0.25, glowT );",

              "c += vec3(0.02, 0.03, 0.13) * ( glowFactor * abs( 1.0 / sin(p.x + sin( p.y + time ) * amplitude ) ));",
              "c += vec3(0.02, 0.10, 0.03) * ( glowFactor * abs( 1.0 / sin(p.x + cos( p.y + time+1.00 ) * amplitude+0.1 ) ));",
              "c += vec3(0.15, 0.05, 0.20) * ( glowFactor * abs( 1.0 / sin(p.y + sin( p.x + time+1.30 ) * amplitude+0.15 ) ));",
              "c += vec3(0.20, 0.05, 0.05) * ( glowFactor * abs( 1.0 / sin(p.y + cos( p.x + time+3.00 ) * amplitude+0.3 ) ));",
              "c += vec3(0.17, 0.17, 0.05) * ( glowFactor * abs( 1.0 / sin(p.y + cos( p.x + time+5.00 ) * amplitude+0.2 ) ));",

              "gl_FragColor = vec4( c, 1.0 );",
          "}"
        ];

        sprite = game.add.sprite();
        sprite.width = dimensions.width;
        sprite.height = dimensions.height;

        filter = new Phaser.Filter(game, null, fragmentSrc);
        filter.setResolution(dimensions.width, dimensions.height);

        sprite.filters = [ filter ];
      }

      function update(){
        if(!_this.global.updatePause){
          filter.update();
        }
      }

    }

    destroy(){
      this.game.destroy();
    }

}

let __phaser = new PhaserGameObject();
