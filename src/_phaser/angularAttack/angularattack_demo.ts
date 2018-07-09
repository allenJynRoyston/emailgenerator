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
      // declare variables BOILERPLATE
      let isPaused = false,
          dimensions = {width: options.width, height: options.height},
          game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update }),
          _this = this;

      let text,
          index = 0,
          line = '',
          distance = 300,
          speed = 4,
          stars = null,
          max = 200,
          xx = [],
          yy = [],
          zz = [],
          buttonDelay, leftKey, rightKey, upKey, downKey, enterKey, enterA, enterB, enterX, enterY,
          clickSound, selectSound,
          style, loadingtext, loadingPercentage,
          splashDelay, splashScreen,
          gametitleart, pressStartTextDelay, pressStartText,
          content, zwearth, zwcity, zwoperator1, zwoperator2, zwoperator3, zwcats1, zwcats2, skiptext, pureblack;

      let assets = {
          app: null,
          preloader: {

          },
          ready:{
              music:{
                  main: null,
                  intro: null,
                  gameplay: null
              }
          },
          gameSelection: 0,
          disableInput: true,
          keybufferLR:[],
          keybufferUD:[],
          keybufferStart:[],
          keybufferA:[],
          keybufferB:[],
          keybufferX:[],
          keybufferY:[],
          state: "boot"
      }

      function preload(){

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('star', 'src/assets/game/demo1/images/star.png')
        game.load.image('winners', 'src/assets/game/demo1/images/winners.jpg')
        game.load.image('ship', 'src/assets/game/demo1/images/ship.png')
        game.load.image('gametitle', 'src/assets/game/demo1/titles/angular-attack-title.png')
        game.load.image('purewhite', 'src/assets/game/demo1/images/purewhite.png')
        game.load.image('pureblack', 'src/assets/game/demo1/images/pureblack.png')

        game.load.image('zwcats1', 'src/assets/game/demo1/zerowing/zw-cats.jpg')
        game.load.image('zwcats2', 'src/assets/game/demo1/zerowing/zw-cats2.jpg')
        game.load.image('zwoperator1', 'src/assets/game/demo1/zerowing/zw-operator1.jpg')
        game.load.image('zwoperator2', 'src/assets/game/demo1/zerowing/zw-operator2.jpg')
        game.load.image('zwoperator3', 'src/assets/game/demo1/zerowing/zw-operator3.jpg')
        game.load.image('zwearth', 'src/assets/game/demo1/zerowing/earth.jpg')
        game.load.image('zwcity', 'src/assets/game/demo1/zerowing/city.png')

        game.load.image('cyberglow', 'src/assets/game/demo1/images/cyberglow.png');
        game.load.image('bullet', 'src/assets/game/demo1/images/bullet.png');

        // load music into buffer
        assets.ready.music.main = game.load.audio('music-main', ['src/assets/game/demo1/music/random-encounter.ogg']);
        assets.ready.music.intro = game.load.audio('intro-music', ['src/assets/game/demo1/music/far-sight.ogg']);
        assets.ready.music.gameplay = game.load.audio('gameplay-music', ['src/assets/game/demo1/music/zombies-in-space.ogg']);
        game.load.audio('click', ['src/assets/game/demo1/sound/Powerup4.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);

        //	You can listen for each of these events from Phaser.Loader
        game.load.onLoadStart.add(loadStart, this);
        game.load.onFileComplete.add(fileComplete, this);
        game.load.onLoadComplete.add(loadComplete, this);
        game.load.enableParallel = true;

        // scripts
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        (<any>window).WebFontConfig = {
            active(){
              // do something once font is loaded
            },
            google: {
              families: ['Press Start 2P']
            }
        };



      }


      function create(){
        // establish controls
        buttonDelay = game.time.now,
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP),
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        // establish buttons
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER),
        enterA = game.input.keyboard.addKey(Phaser.Keyboard.A),
        enterB = game.input.keyboard.addKey(Phaser.Keyboard.S),
        enterX = game.input.keyboard.addKey(Phaser.Keyboard.D),
        enterY = game.input.keyboard.addKey(Phaser.Keyboard.F);


        // keypress goes into buffer
        leftKey.onDown.add(function(){
            assets.keybufferLR[0] = 0
        }, this);
        rightKey.onDown.add(function(){
            assets.keybufferLR[0] = 1
        }, this);
        upKey.onDown.add(function(){
            assets.keybufferUD[0] = 0
        }, this);
        downKey.onDown.add(function(){
            assets.keybufferUD[0] = 1
        }, this);

        enterKey.onDown.add(function(){
            assets.keybufferStart[0] = true
        }, this);
        enterA.onDown.add(function(){
            assets.keybufferA[0] = true
        }, this);
        enterB.onDown.add(function(){
            assets.keybufferB[0] = true
        }, this);
        enterX.onDown.add(function(){
            assets.keybufferX[0] = true
        }, this);
        enterY.onDown.add(function(){
            assets.keybufferY[0] = true
        }, this);


        game.input.keyboard.onUpCallback = function(e){
            let buttonDelay = game.time.now;
            if(e.code == "ArrowLeft" || e.code == "ArrowRight"){
                assets.keybufferLR.shift();
            }
            if(e.code == "ArrowUp" || e.code == "ArrowDown"){
                assets.keybufferUD.shift();
            }
            if(e.code == "Enter"){
                assets.keybufferStart.shift();
            }
            if(e.code == "SPACE"){
                assets.keybufferA.shift();
            }
            if(e.code == "KeyA"){
                assets.keybufferB.shift();
            }
            if(e.code == "KeyS"){
                assets.keybufferX.shift();
            }
            if(e.code == "KeyD"){
                assets.keybufferY.shift();
            }
        }


        if (game.renderType === Phaser.WEBGL){
            max = 250;
        }

        var sprites = game.add.spriteBatch();

        stars = [];

        for (let i = 0; i < max; i++)
        {
            xx[i] = Math.floor(Math.random() * 800) - 400;
            yy[i] = Math.floor(Math.random() * 600) - 300;
            zz[i] = Math.floor(Math.random() * 1700) - 100;

            var star = game.make.sprite(0, 0, 'star');
            star.anchor.set(0.5);

            sprites.addChild(star);

            stars.push(star);
        }


        clickSound = game.add.audio('click');
        clickSound.allowMultiple = true;
        selectSound = game.add.audio('select');
      }



      //-----------------------
      function start() {

          // start
          game.load.start();

      }
      //-----------------------


      //-----------------------
      function loadStart() {

          // text
          loadingtext = game.add.text(game.world.centerX, game.world.centerY/2, "", { font: "18px Impact", fill: "#fff", align: "center" });
          loadingtext.anchor.set(0.5)

          loadingPercentage = game.add.text(game.world.centerX, game.world.centerY, "", { font: "32px Impact", fill: "#fff", align: "center" });
          loadingPercentage.anchor.set(0.5);

          // change state
          assets.state = "preload";

      }
      //-----------------------

      //-----------------------
      function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
          // change text
        loadingtext.setText("Please wait...");
        loadingPercentage.setText(progress + "%")
      }
      //-----------------------

      //-----------------------
      function loadComplete() {
          loadingtext.setText("File loaded!");
          loadingPercentage.setText("")

          // start game after slight delay
          setTimeout(() => {
              clearPreloader();

              // render game code
              assets.state = "ready";
              game.stage.backgroundColor = '#000';

              splashDelay = game.time.now + 2000;
              splashScreen = game.add.sprite(game.world.centerX - 15, game.world.centerY, 'winners');
              splashScreen.anchor.set(0.5);
              splashScreen.scale.setTo(1.1, 1.1)
              splashScreen.alpha = 1

              assets.ready.music.main = game.add.audio('music-main')
              setTimeout(function(){
                  assets.ready.music.main.loopFull(0.75)
              }, 2000)

          }, 2000)
      }
      //-----------------------

      //-----------------------
      function clearPreloader(){
        loadingtext.destroy();
        loadingPercentage.destroy();
      }
      //-----------------------

      //-----------------------
      function clearReady(){
          splashScreen.destroy();
          assets.state = "gamemenu"

          // game title
          gametitleart = game.add.sprite(game.world.centerX, game.world.centerY - 50, 'gametitle');
          gametitleart.anchor.set(.5)
          gametitleart.scale.setTo(5, 5)
          game.add.tween(gametitleart.scale).to( { x: 2, y: 2}, 2000, Phaser.Easing.Bounce.Out, true)

          // text
          pressStartTextDelay = game.time.now + 1500;
          pressStartText = game.add.text(game.world.centerX, game.world.centerY + 250, "Press Enter to Start", { font: "24px Press Start 2P", fill: "#fff", align: "center" });
          pressStartText.anchor.set(0.5);
          pressStartText.alpha = 0;
          game.add.tween(pressStartText).to( { alpha: 1,  y: game.world.centerY + 200 }, 350, "Linear", true, 1500);
          assets.disableInput = false;
      }
      //-----------------------

      //-----------------------
      function startGameIntro(){
          // disable input
          assets.disableInput = true;

          // fade to black
          pureblack = game.add.sprite(game.world.centerX, game.world.centerY, 'pureblack');
          pureblack.anchor.set(0.5);
          pureblack.alpha = 0;
          game.add.tween(pureblack).to( { alpha: 1 }, 1500, Phaser.Easing.Linear.In, true, 500);

          // destroy text
          pressStartText.destroy();

          // fade music
          assets.ready.music.main.fadeOut(1000)

          // wait for fade
          setTimeout(function(){
              // destroy stars
              for (let i = 0; i < max; i++){
                  stars[i].destroy();
              }

              // destroy titles
              gametitleart.destroy()
              assets.state = "gameIntro"

              setTimeout(function(){
                  assets.ready.music.intro = game.add.audio('intro-music')
                  assets.ready.music.intro.loopFull(0.75)


                  content = [
                      "      ",
                      "The year was 20XX.",
                      "The world was experience a wave of great change.",
                      "",
                      "",
                      "When all of a sudden.",
                      "...",
                      "...",
                      " ",
                      "Google: \"How are you gentlemen?\"",
                      "Google: \"All your code are belong to us.\"",
                      "Google: \"You have no chance to revert make your time.\"",
                      "Google: \"Ha ha ha ha...\"",
                      "",
                      "PM: \"Take off every dev.\"",
                      "PM: \"You know what you doing.\"",
                      " ",
                      "PM: \"For great justice.\"",
                      " ",
                      " ",
                      " ",
                  ];
                  text = game.add.text(15, game.world.centerY + 200, '', { font: "14px Press Start 2P", fill: "#fff" });

                  nextLine();

                  zwearth = game.add.sprite(game.world.centerX, game.world.centerY, 'zwearth');
                  zwearth.anchor.set(.5)
                  zwearth.scale.setTo(1.75, 1.75)
                  zwearth.visible = false;

                  zwcity = game.add.sprite(game.world.centerX - 50, game.world.centerY, 'zwcity');
                  zwcity.anchor.set(.5)
                  zwcity.scale.setTo(2, 2)
                  zwcity.visible = false;

                  zwcats1 = game.add.sprite(game.world.centerX, game.world.centerY, 'zwcats1');
                  zwcats1.anchor.set(.5)
                  zwcats1.scale.setTo(2, 2)
                  zwcats1.visible = false;

                  zwcats2 = game.add.sprite(game.world.centerX, game.world.centerY, 'zwcats2');
                  zwcats2.anchor.set(.5)
                  zwcats2.scale.setTo(2, 2)
                  zwcats2.visible = false;

                  zwoperator1 = game.add.sprite(game.world.centerX, game.world.centerY, 'zwoperator1');
                  zwoperator1.anchor.set(.5)
                  zwoperator1.scale.setTo(2, 2)
                  zwoperator1.visible = false;

                  zwoperator2 = game.add.sprite(game.world.centerX, game.world.centerY, 'zwoperator2');
                  zwoperator2.anchor.set(.5)
                  zwoperator2.scale.setTo(2, 2)
                  zwoperator2.visible = false;

                  zwoperator3 = game.add.sprite(game.world.centerX, game.world.centerY, 'zwoperator3');
                  zwoperator3.anchor.set(.5)
                  zwoperator3.scale.setTo(2, 2)
                  zwoperator3.visible = false;

                  skiptext = game.add.text(30, 30, 'Press Enter to skip intro', { font: "10px Press Start 2P", fill: "#fff", align: "left" });
                  skiptext.visible = false;

                  game.time.events.add(Phaser.Timer.SECOND * 0, function(){
                      zwearth.visible = true;
                      game.add.tween(zwearth.scale).to( { x: 2.5, y: 2.5 }, 20000, Phaser.Easing.Linear.In, true);
                      text.bringToTop()
                  }, this);

                  game.time.events.add(Phaser.Timer.SECOND * 3, function(){
                      assets.disableInput = false;
                      skiptext.visible = true;
                  })

                  game.time.events.add(Phaser.Timer.SECOND * 9, function(){
                      zwearth.visible = false;
                      zwcity.visible = true;
                      game.add.tween(zwcity).to( { x: game.world.centerX + 50 }, 20000, Phaser.Easing.Linear.In, true);
                      text.bringToTop()
                      skiptext.bringToTop()
                  }, this);

                  game.time.events.add(Phaser.Timer.SECOND * 26, function(){
                      zwcity.visible = false;
                      zwcats1.visible = true;
                      text.bringToTop()
                      skiptext.bringToTop()
                  }, this);

                  game.time.events.add(Phaser.Timer.SECOND * 39, function(){
                      zwcats1.visible = false;
                      zwcats2.visible = true;
                      text.bringToTop()
                      skiptext.bringToTop()
                  }, this);

                  game.time.events.add(Phaser.Timer.SECOND * 51, function(){
                      zwcats2.visible = false;
                      zwoperator1.visible = true;
                      text.bringToTop()
                      skiptext.bringToTop()
                  }, this);


                  game.time.events.add(Phaser.Timer.SECOND * 62, function(){
                      zwoperator1.visible = false;
                      zwoperator2.visible = true;
                      text.bringToTop()
                      skiptext.bringToTop()
                  }, this);

                  game.time.events.add(Phaser.Timer.SECOND * 67, function(){
                      startGameplay()
                  }, this);

              }, 1000)


          }, 2000)


      }

      function updateLine() {
          if(line.length != undefined){
              if (line.length < content[index].length)
              {
                  line = content[index].substr(0, line.length + 1);
                  // text.text = line;
                  text.setText(line);
              }
              else{
                  //  Wait 2 seconds then start a new line
                  game.time.events.add(Phaser.Timer.SECOND * 2, nextLine, this);
              }
          }
      }

      function nextLine() {
          index++;
          if (index < content.length){
              line = '';
              game.time.events.repeat(80, content[index].length + 1, updateLine, this);
          }
      }
      //-----------------------


      //-----------------------
      function startGameplay(){
          assets.disableInput = true;

          zwearth.destroy()
          zwcity.destroy()
          zwcats1.destroy()
          zwcats2.destroy()
          zwoperator1.destroy()
          zwoperator2.destroy()
          zwoperator3.destroy();
          skiptext.destroy()
          text.destroy();

          //game.add.tween(zwoperator3).to( { alpha: 0 }, 1500, Phaser.Easing.Linear.In, true);
          assets.ready.music.intro.fadeOut(1500)
          game.time.events.add(Phaser.Timer.SECOND * 1, function(){
              //vueComponent.loadGame('angularattack_2.js')
          }, this)

      };
      //-----------------------

      //-----------------------
      function update() {
        if(!__phaser.global.isPaused){
          //-----------------
          if(assets.state == "preload"){
              //filter.update();
          }
          //-----------------

          //-----------------
          if(assets.state == "ready"){
              if(game.time.now > splashDelay){
                  clearReady();
              }
          }
          //-----------------

          //-----------------
          if(assets.state == "gamemenu"){

              //----------- starfield
              for (var i = 0; i < max; i++){
                  stars[i].perspective = distance / (distance - zz[i]);
                  stars[i].x = game.world.centerX + xx[i] * stars[i].perspective;
                  stars[i].y = game.world.centerY + yy[i] * stars[i].perspective;
                  zz[i] += speed;
                  if (zz[i] > 290)
                  {
                      zz[i] -= 600;
                  }
                  stars[i].alpha = Math.min(stars[i].perspective / 2, 1);
                  stars[i].scale.set(stars[i].perspective / 2);
                  stars[i].rotation += 0.1;

              }
              //-----------

              //----------- flashing text
              if(game.time.now > pressStartTextDelay){
                  pressStartText.visible = !pressStartText.visible
                  pressStartTextDelay = game.time.now + 700;
              }
              //-----------

              //----------- wait for keypress
              if(game.time.now > buttonDelay && !assets.disableInput){
                  if(assets.keybufferStart[0]){
                      selectSound.play()
                      startGameIntro();
                      buttonDelay = game.time.now + 250;
                  }
              }
              //-----------
            }
          }
          //-----------------
      }


      parent.game = this; // make game accessible to parent element
      this.game = game; // make accessible to class functions
    }

    destroy(){
      this.game.destroy();
    }

}

let __phaser = new PhaserGameObject();
