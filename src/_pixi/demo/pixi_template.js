var __pixi = {
    //------------------------------------ CONSTRUCTOR
    constructor() {
        this.global = {
            options: null,
            pause: false,
            destroyed: false,
            el: null,
            app: null,
            renderer: null,
            stage: null,
            destroyMe: () => {
                // // remove from memory
                this.global.destroyed = true;
                this.global.stage.destroy(true);
                this.global.stage = null;
                this.global.renderer.destroy(true);
                this.global.renderer = null;
            }
        };
    },
    //------------------------------------ 
    //------------------------------------ START
    init(el, parent, options) {
        let { global } = this;
        let app = null;
        let renderer = null;
        let stage = null;
        let mainContainer = null;
        let sprites = [];
        //-------------------------
        const init = () => {
            // set renderer
            app = new PIXI.Application(options.width, options.height, {
                // resolution: window.devicePixelRatio || 1,
                backgroundColor: 0xe74c3c,
            });
            renderer = app.renderer;
            // set scale mode
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
            // append to element
            stage = new PIXI.Container();
            mainContainer = new PIXI.Container();
            stage.addChild(mainContainer);
            el.appendChild(renderer.view);
            // add to globals        
            global.options = options;
            global.app = app;
            global.renderer = renderer;
            global.stage = stage;
            global.destroyed = false;
            // set resize and initial scaling     
            if (options.resizeBehavior !== 'NONE') {
                window.addEventListener('resize', resizeHandler, false);
                resizeHandler();
            }
            // next step
            addContent();
        };
        //-------------------------
        //-------------------------
        const addContent = () => {
            /* ADD STUFF HERE */
            // load sprite - can also use url
            PIXI.loader.add('sprite', 'src/_pixi/demo/ninja-icon.png').load((loader, resources) => {
                // add sprite
                let sprite = new PIXI.Sprite(resources.sprite.texture);
                sprite.position.x = renderer.width / 2;
                sprite.position.y = renderer.height / 2;
                sprite.anchor.set(0.5);
                // rerender property
                sprite.refit = () => {
                    sprite.position.x = renderer.width / 2;
                    sprite.position.y = renderer.height / 2;
                };
                sprite.animateLoop = () => {
                    sprite.rotation += 0.05;
                };
                // add sprite screen
                mainContainer.addChild(sprite);
                // push sprite to array
                sprites.push(sprite);
            });
        };
        //-------------------------
        //-------------------------
        /* ADD functions STUFF HERE */
        //-------------------------
        //-------------------------
        // resize handler
        const resizeHandler = () => {
            if (this.global.options.resizeBehavior === 'FIT') {
                // var ratio = Math.min(this.global.options.width / renderer.width, this.global.options.height / renderer.height);
                // mainContainer.scale.x = ratio;
                // mainContainer.scale.y = ratio;
                mainContainer.children.forEach(child => {
                    if (!!child.refit) {
                        child.refit();
                    }
                });
                renderer.resize(el.parentElement.offsetWidth, el.parentElement.offsetHeight);
            }
            if (this.global.options.resizeBehavior === 'CENTER') {
                el.style.transform = `translate(${(el.parentElement.offsetWidth - this.global.options.width) / 2}px,${(el.parentElement.offsetHeight - this.global.options.height) / 2}px)`; // ;       
                el.style.width = `${this.global.options.width}px`;
                el.style.height = `${this.global.options.height}px`;
            }
        };
        //-------------------------
        //-------------------------
        // animation loop
        const animate = () => {
            if (!this.global.destroyed) {
                requestAnimationFrame(animate);
                if (!global.pause) {
                    //console.log(global.pause)
                    // DO THE THING
                    sprites.forEach(sprite => {
                        sprite.animateLoop();
                    });
                }
                renderer.render(stage);
            }
        };
        //-------------------------
        // link parent to element, 
        parent.element = this;
        parent.isReady = true;
        this.global.pause = !options.autoplay;
        // init and animate
        init();
        animate();
    },
    //------------------------------------
    //------------------------------------  DESTROY
    pause(state) {
        this.global.pause = state;
    },
};
__pixi.constructor();
//# sourceMappingURL=pixi_template.js.map