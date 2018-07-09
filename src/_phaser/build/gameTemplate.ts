declare var Phaser:any;

class IO_CONTROLS {

  /* HOW TO USE */
  // 1.) In your games init(), after game is declared, insert the following code:
  //      --------------------------------------
  /*
       init(el:any, parent:any, options:any){
         const game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update});
         const _IO_CONTROLS = new IO_CONTROLS();
         let IO:any;
         ...
       }
  */
  //      --------------------------------------
  // 2.) in the create(), place this line of code:
  //      --------------------------------------
  /*
       function create(){
         IO = _IO_CONTROLS.assignButtons(game)  // must be called at the create() function to set everything up
         ...
       }
  */
  //      --------------------------------------

  // 2.) anywhere after create(), all the public methods will be available
  //      --------------------------------------
  //      _IO_CONTROLS.isReady()                            | returns boolean   | returns a [true/false] if all the controls have been mapped and the class is ready
  //      _IO_CONTROLS.isDebuggerEnabled()                  | returns boolean   | retuns if a [true/false] based off if the debugger is visible
  //      _IO_CONTROLS.updateDebugger()                     |                   | if the debugger is visible, will update the values.  Best to place in the update() function
  //      _IO_CONTROLS.disableAllInput()                    |                   | will disable all controller inputs
  //      _IO_CONTROLS.enableAllInput()                     |                   | will enable all controller inputs
  //      _IO_CONTROLS.disableAllDirectionalButtons()       |                   | will enable all directional inputs (UP/DOWN/LEFT/RIGHT)
  //      _IO_CONTROLS.disableAllTriggerButtons()           |                   | will enable all trigger inputs (L1/R1/L2/R2)
  //      _IO_CONTROLS.enableAllTriggerButtons()            |                   | will enable all trigger inputs (L1/R1/L2/R2)
  //      _IO_CONTROLS.disableAllActionButtons()            |                   | will enable all trigger inputs (A/B/X/Y)
  //      _IO_CONTROLS.enableAllActionButtons()             |                   | will enable all trigger inputs (A/B/X/Y)
  //      _IO_CONTROLS.disableAllSystemButtons()            |                   | will enable all trigger inputs (START/BACK)
  //      _IO_CONTROLS.enableAllSystemButtons()             |                   | will enable all trigger inputs (START/BACK)
  //      _IO_CONTROLS.setDisableKeyProperty('A', true)     |                   | pass the button name ['UP/B/L1/START'] and the boolean value [true/false] to enable/disable the button)
  //      _IO_CONTROLS.getKeyDisabledValue('A')             | return boolean    | pass the button name ['UP/B/L1/START'] and it will return the value
  //      _IO_CONTROLS.clearAllControlIntervals()           |                   | clear all setInterval timers involved with controls.  Useful in cases where a key is disabled programatically
  //      _IO_CONTROLS.read('A')                            | return object     | returns the current state of the button: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}
  //      _IO_CONTROLS.readMulti(['A', 'X'], 'OBJECT')      | return object     | returns as an object with multiple button states:
  //                                                                              {X: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}, A: {active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}}
  //      _IO_CONTROLS.readMulti(['A', 'X'], 'ARRAY')       | return array      | returns an an array with multiple button states:
  //                                                                              [{key: 'X', active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}, {key: 'A', active: [boolean], duration: [number], state: [number], type: [text], disabled: [boolean]}]
  //      --------------------------------------

  // ***** GETTING FEEDBACK: ************
  // In your update() loop
  //
  /*
      function update() {

          // CREATE DELAY BETWEN INPUT PRESSES
          if(_IO_CONTROLS.getInput('A').active && checkButtonDelay()){
              console.log()
              updateButtonDelay();
          }

          // READ ONE KEY
          let theOutput = _IO_CONTROLS.read('A');
          console.log(theOutput)

          // READ MANY KEYS
          let theOutput = _IO_CONTROLS.readMulti(['A', 'UP'])
          console.log(theOutput)


          ...
      }
  */

  // ***** DEBUGGER ************
  //
  // Pressing the [`] (Backquote) key will activate the debugger
  //

  IO:any;
  buttonSensitivity:any;
  buttonMap:any;
  properties:any;
  directionalButtons:any;
  actionButtons:any;
  triggerButtons:any;
  systemButtons:any;
  buttonArray:any;
  debugger:any;
  disabledButtons:any;

  constructor(){
    this.IO = null;
    /* BUTTON SENSITIVTY can be changed to whatever you want */
    this.buttonSensitivity = {TAP: 1, SHORT: 50, LONG: 150, SUPERLONG: 300}

    /* CLASS PROPERTIES */
    this.properties = {
      isReady: false,
      allowDebugger: true,
      buttonDelay: 50,
      timingRefreshRate: 1  // 0 is the most accurate but resource intensive, 10 is less accurate but less resource intensive
    }

    /* MUST MATCH this.buttonMap */
    this.directionalButtons = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    this.actionButtons = ['A', 'B', 'X', 'Y']
    this.triggerButtons = ['L1', 'L2', 'R1', 'R2', 'L3', 'R3']
    this.systemButtons = ['START', 'BACK']
    this.buttonArray = [...this.directionalButtons, ...this.actionButtons, ...this.triggerButtons, ...this.systemButtons]

    this.buttonMap = {
      UP: {name: 'UP', code: 'ArrowUp'},
      DOWN: {name: 'DOWN', code: 'ArrowDown'},
      LEFT: {name: 'LEFT', code: 'ArrowLeft'},
      RIGHT: {name: 'RIGHT', code: 'ArrowRight'},
      A: {name: 'A', code: 'KeyA'},
      B: {name: 'S', code: 'KeyS'},
      X: {name: 'D', code: 'KeyD'},
      Y: {name: 'F', code: 'KeyF'},
      L1: {name: 'Q', code: 'KeyQ'},
      L2: {name: 'W', code: 'KeyW'},
      R1: {name: 'E', code: 'KeyE'},
      R2: {name: 'R', code: 'KeyR'},
      L3:{name: 'O', code: 'KeyO'},
      R3:{name: 'P', code: 'KeyP'},
      START: {name: 'ENTER', code: 'Enter'},
      BACK: {name: 'BACKSPACE', code: 'Backspace'},
    }

    this.disabledButtons = {
      ALL: false,
      DIRECTIONAL: false,
      TRIGGER: false,
      ACTION: false,
      SYSTEM: true
      /* LEFT, RIGHT, UP, DOWN, A, B, X, Y, L1, L2, R1, R2, START and BACK added dynamically */
    }

    this.debugger = {
      enabled: false,
      text: {}
    }

  }

  public assignButtons(game){
    // setup debugger and disabled states
    let style = { font: "12px Courier New", fill: "#fff", align: "left" }
    this.buttonArray.forEach((btn, index) => {
      this.debugger.text[btn] = null; // must be null first since the property name doesn't exists yet
      this.debugger.text[btn] = game.add.text(10, 10 + (index * 15), "", style); // then add initial text
      this.disabledButtons[btn] = false; // set disabled as false
    })

    // setup INPUT/OUTPUT
    const IO = {
      buttons:{},
      sensitivityPress:{},
      sensitivityBuffer: {},
      timedPress:{},
      timedBuffer:{},
      timedTrigger:{},
      state: {}
    }

    // set default values for IO object
    for (let btn of this.buttonArray) {
      IO.buttons[btn] = game.input.keyboard.addKey(Phaser.Keyboard[this.buttonMap[btn].name]);
      IO.sensitivityPress[btn] = null; // stores the setInterval function
      IO.sensitivityBuffer[btn] = 0;   // value
      IO.state[btn] = () => {
        return this.getBtnPressType(this.IO.sensitivityBuffer[btn])
      }

    }

    // add button down behavior
    for (let btn of this.buttonArray) {
      IO.buttons[btn].onDown.add((e) => {
        // clear any intervals
        clearInterval(IO.sensitivityPress[btn]);

        // get type of button pressed
        let btnType, btnName;
        let buttonTypes = ['DIRECTIONAL', 'ACTION', 'TRIGGER', 'SYSTEM']
        Object.keys(this.buttonMap).forEach((key, value) => {
          if( this.buttonMap[key].code === e.event.code){
            for(let _type of buttonTypes){
              if(this[`${_type.toLowerCase()}Buttons`].indexOf(key) +1){
                btnType = _type;
                btnName = key;
              }
            }
          }
        });

        // check against disabled rules
        let isDisabled = false;
        if(this.disabledButtons.ALL){
          isDisabled = true;
        }

        // check for disable catagories
        for(let name of buttonTypes){
          if(this.disabledButtons[name] && btnType === name){
            isDisabled = true;
          }
        }

        // check to see if individual keypress is disabled
        Object.keys(this.buttonMap).forEach((key, value) => {
          if(this.disabledButtons[key] && btnName === key){
            isDisabled = true;
          }
        })

        // set new intervals
        if(!isDisabled){
          IO.sensitivityPress[btn] = setInterval(() => {
            IO.sensitivityBuffer[btn] += 1
          }, this.properties.timingRefreshRate)
        }
      }, this);
    }

    // add button release behavior
    game.input.keyboard.onUpCallback = (e) => {
        for (let btn of this.buttonArray) {
          if(e.code === this.buttonMap[btn].code){
              // clear intervals
              clearInterval(IO.sensitivityPress[btn]);
              // reset value
              IO.sensitivityBuffer[btn] = 0;
          }
        }
        // show/hide debugger (mapped to backdash key by default)
        if(e.code === 'Backquote' && this.properties.allowDebugger) {
          this.setDebugger(!this.debugger.enabled);
          this.updateDebugger();
        }
    }
    this.properties.isReady = true;
    this.IO = IO;
    return IO;
  }

  public isReady(){
    return this.properties.isReady;
  }

  public isDebuggerEnabled(){
    return this.debugger.enabled;
  }

  public setDebugger(state:boolean = true){
    this.debugger.enabled = state;
  }

  public updateDebugger(){
    if(this.properties.isReady){
      for (let btn of this.buttonArray) {
        this.debugger.text[btn].setText(this.debugger.enabled ? this.debuggerString(btn) : '').bringToTop()
      }
    }
  }

  public disableAllInput(){
    this.disabledButtons.ALL = true;
  }

  public enableAllInput(){
    this.disabledButtons.ALL = false;
  }

  public disableAllDirectionalButtons(){
    this.disabledButtons.DIRECTIONAL = true;
  }

  public enableAllDirectionalButtons(){
    this.disabledButtons.DIRECTIONAL = false;
  }

  public disableAllTriggerButtons(){
    this.disabledButtons.TRIGGER = true;
  }

  public enableAllTriggerButtons(){
    this.disabledButtons.TRIGGER = false;
  }

  public disableAllActionButtons(){
    this.disabledButtons.ACTION = true;
  }

  public enableAllActionButtons(){
    this.disabledButtons.ACTION = false;
  }

  public disableAllSystemButtons(){
    this.disabledButtons.SYSTEM = true;
  }

  public enableAllSystemButtons(){
    this.disabledButtons.SYSTEM = false;
  }

  public setDisableKeyProperty(name:string, value:boolean = true){
    if(this.properties.isReady){
      this.disabledButtons[name.toUpperCase()] = value
    }
  }

  public getKeyDisabledValue(name:string){
    if(this.properties.isReady){
      return this.disabledButtons[name.toUpperCase()]
    } else {
      return null;
    }
  }

  public clearAllControlIntervals(){
    if(this.properties.isReady){
      for (let btn of this.buttonArray) {
        clearInterval(this.IO.timedPress[btn]);
        clearInterval(this.IO.sensitivityPress[btn]);
      }
    }
  }

  public read(key:string){
    if(this.properties.isReady){
      let _return = {}
      return _return[key] = {active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]}
    }
  }

  public readMulti(keys:string[], returnAs:string = 'OBJECT'){
    if(this.properties.isReady){

      if(returnAs === 'OBJECT'){
        let _return = {}
        for(let key of keys){
          _return[key] = {active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]}
        }
        return _return;
      }
      if(returnAs === 'ARRAY'){
        let _return = []
        for(let key of keys){
          _return.push({key: key, active: this.IO.state[key.toUpperCase()]().val > 0 ? true: false, duration: this.IO.state[key.toUpperCase()]().val, state: this.IO.state[key.toUpperCase()]().state, type: this.IO.state[key.toUpperCase()]().type, disabled: this.disabledButtons[key.toUpperCase()]})
        }
        return _return;
      }

    }
  }

  private debuggerString(key:string){
    return `${key.toUpperCase()} (${this.buttonMap[key.toUpperCase()].name}/${this.buttonMap[key.toUpperCase()].code}) | duration: ${this.IO.state[key.toUpperCase()]().val} | state: ${this.IO.state[key.toUpperCase()]().state} | type: ${this.IO.state[key.toUpperCase()]().type} | disabled: ${this.disabledButtons[key.toUpperCase()]}`
  }

  private getBtnPressType(val:number){
    let _type = 'NONE', _state = 0, state = 0;
    Object.keys(this.buttonSensitivity).forEach((key) => {
      state++;
      if(val > this.buttonSensitivity[key]){
        _type = key;
        _state = state;
      }
    });
    return {val: val, type: _type, state: _state}
  }
}

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
      const game = new Phaser.Game(options.width, options.height, Phaser.WEBGL, el, { preload: preload, create: create, update: update});

      // add control class and input/output (optional but recommended)
      const _IO_CONTROLS = new IO_CONTROLS();
      let IO:any;

      // define possible gameStates (can add more or less, but this is a good start)
      const gameStates = {
          BOOT: 'BOOT',
          PRELOAD: 'PRELOAD',
          READY: 'READY',
          TITLE: 'TITLE',
          INTRO: 'INTRO',
          GAMEPLAY: 'GAMEPLAY',
      }

      let properties = {
          input:{
            delay: 0,
            delayValue: 100   // set if you need an input delay between input (higher number means it takes longer for the input to be recognized)
          }
      }

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
          state: gameStates.BOOT
      }

      function preload(){
        // load resources in parellel
        game.load.enableParallel = true;

        // set canvas color
        game.stage.backgroundColor = '#2f2f2f';

        // images
        game.load.image('gametitle', 'src/assets/game/demo1/titles/angular-attack-title.png')

        // load music and sound effects into buffer
        game.load.audio('intro-music', ['src/assets/game/demo1/music/far-sight.ogg']);
        game.load.audio('select', ['src/assets/game/demo1/sound/Pickup_Coin.ogg']);

        // scripts (loaded fonts will not be available for the preloader, but will be available after onLoadComplete)
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        (<any>window).WebFontConfig = {
            active(){ },
            google: {
              families: ['Press Start 2P']
            }
        };

        preloadHelper();
      }

      function preloadHelper() {
        /* ONLOAD START */
        game.load.onLoadStart.add(() => {
          // change state
          assets.state = gameStates.PRELOAD;
          // text
          loadingtext = game.add.text(game.world.centerX, game.world.centerY/2, "", { font: "18px Impact", fill: "#fff", align: "center" });
          loadingtext.anchor.set(0.5)
          loadingPercentage = game.add.text(game.world.centerX, game.world.centerY, "", { font: "32px Impact", fill: "#fff", align: "center" });
          loadingPercentage.anchor.set(0.5);
        }, this);


        /* AS RESOURCES ARE LOADED */
        game.load.onFileComplete.add((progress, cacheKey, success, totalLoaded, totalFiles) => {
          // change text
          loadingtext.setText("Please wait...");
          loadingPercentage.setText(progress + "%")
        }, this);

        /* ALL RESOURCES ARE LOADED */
        game.load.onLoadComplete.add(() => {
          loadingtext.setText("File loaded!");
          loadingPercentage.setText("")

          // start game after slight delay
          setTimeout(() => {
              // destroy all text
              loadingtext.destroy();
              loadingPercentage.destroy();

              // render game code
              assets.state = gameStates.READY;
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
        }, this);
      }

      function create(){
        IO = _IO_CONTROLS.assignButtons(game)
        //_IO_CONTROLS.setDisableKeyProperty('A', true)
        /*
        // keypress goes into buffer

        */

        /*
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
        */

        /*
        clickSound = game.add.audio('click');
        clickSound.allowMultiple = true;
        selectSound = game.add.audio('select');
        */
      }


      //-----------------------
      function clearReady(){
          splashScreen.destroy();
          assets.state = gameStates.TITLE

          // game title
          gametitleart = game.add.sprite(game.world.centerX, game.world.centerY - 50, 'gametitle');
          gametitleart.anchor.set(.5)
          gametitleart.scale.setTo(5, 5)
          game.add.tween(gametitleart.scale).to( { x: 1, y: 1}, 2000, Phaser.Easing.Bounce.Out, true)

          // text
          pressStartTextDelay = game.time.now + 1500;
          pressStartText = game.add.text(game.world.centerX, game.world.centerY + 250, "Press Enter to Start", { font: "24px Press Start 2P", fill: "#fff", align: "center" });
          pressStartText.anchor.set(0.5);
          pressStartText.alpha = 0;
          game.add.tween(pressStartText).to( { alpha: 1,  y: game.world.centerY + 200 }, 350, "Linear", true, 1500);
          //assets.disableInput = false;
      }
      //-----------------------

      //-----------------------
      function startGameIntro(){
          // disable input
          //assets.disableInput = true;

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
              assets.state = gameStates.INTRO;

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
                      //assets.disableInput = false;
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
      function checkButtonDelay(){
        return game.time.now > properties.input.delay;
      }

      function updateButtonDelay(){
        properties.input.delay = properties.input.delayValue + game.time.now;
      }
      //-----------------------

      //-----------------------
      function update() {
        // leave to update control debugger
        if(_IO_CONTROLS.isDebuggerEnabled()){
          _IO_CONTROLS.updateDebugger();
        }

        // good way to make sure your buttons are only pressed once every x seconds
        if(_IO_CONTROLS.read('A').active && checkButtonDelay()){
            console.log(_IO_CONTROLS.read('A'))
            updateButtonDelay();
        }


        if(!__phaser.global.isPaused){


          //-----------------
          if(assets.state === gameStates.PRELOAD){
              //filter.update();
          }
          //-----------------

          //-----------------
          if(assets.state === gameStates.READY){
              if(game.time.now > splashDelay){
                  clearReady();
              }
          }
          //-----------------

          //-----------------
          if(assets.state === gameStates.TITLE){

              //
              /*
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
              */
          }
          //-----------------

          //-----------------
          if(assets.state === gameStates.INTRO){
              //----------- wait for keypress
              if(game.time.now > buttonDelay){
                  /*
                  if(assets.keybufferStart[0]){
                      selectSound.play()
                      startGameplay();
                      buttonDelay = game.time.now + 250;
                  }
                  */
              }
              //-----------
          }
          //-----------------

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
