var __pixi = {
    //------------------------------------ CONSTRUCTOR
    constructor() {
        this.global = {
            options: null,
            pause: false,
            destroyed: false,
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
        let historyX = [];
        let historyY = [];
        //historySize determines how long the trail will be.
        let historySize = 50;
        //ropeSize determines how smooth the trail will be.
        let ropeSize = 500;
        let points = [];
        let rope = null;
        //-------------------------
        const init = () => {
            // set renderer
            app = new PIXI.Application(options.width, options.height, {
                resolution: window.devicePixelRatio || 1,
                backgroundColor: 0xffffff,
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
            //Get the texture for rope.
            let trailTexture = PIXI.Texture.fromImage('src/_pixi/bg/ninja-icon.png');
            //Create history array.
            for (var i = 0; i < historySize; i++) {
                historyX.push(0);
                historyY.push(0);
            }
            //Create rope points.
            for (var i = 0; i < ropeSize; i++) {
                points.push(new PIXI.Point(0, 0));
            }
            //Create the rope
            var rope = new PIXI.mesh.Rope(trailTexture, points);
            //Set the blendmode
            rope.blendmode = PIXI.BLEND_MODES.ADD;
            app.stage.addChild(rope);
        };
        //-------------------------
        //-------------------------
        // resize handler
        const resizeHandler = () => {
            if (this.global.options.resizeBehavior === 'SCALE') {
                const scaleFactor = Math.min(window.innerWidth / options.width, window.innerHeight / options.height);
                const newWidth = Math.ceil(options.width * scaleFactor);
                const newHeight = Math.ceil(options.height * scaleFactor);
                // get scrollbar width
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                renderer.view.style.width = `${newWidth - scrollbarWidth}px`;
                renderer.view.style.height = `${newHeight}px`;
                renderer.resize(newWidth, newHeight);
                mainContainer.scale.set(scaleFactor);
            }
            if (this.global.options.resizeBehavior === 'GROW') {
                // get scrollbar width
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                renderer.view.style.width = `${window.innerWidth - scrollbarWidth}px`;
                renderer.view.style.height = `${innerHeight}px`;
                renderer.resize(window.innerWidth - scrollbarWidth, innerHeight);
            }
        };
        //-------------------------
        //-------------------------
        const clipInput = (k, arr) => {
            if (k < 0)
                k = 0;
            if (k > arr.length - 1)
                k = arr.length - 1;
            return arr[k];
        };
        const getTangent = (k, factor, array) => {
            return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
        };
        const cubicInterpolation = (array, t, tangentFactor) => {
            if (tangentFactor == null)
                tangentFactor = 1;
            var k = Math.floor(t);
            var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
            var p = [clipInput(k, array), clipInput(k + 1, array)];
            t -= k;
            var t2 = t * t;
            var t3 = t * t2;
            return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
        };
        //-------------------------
        //-------------------------
        // animation loop
        const animate = () => {
            if (!this.global.destroyed) {
                requestAnimationFrame(animate);
                if (!global.pause) {
                    //Read mouse points, this could be done also in mousemove/touchmove update. For simplicity it is done here for now.
                    //When implemeting this properly, make sure to implement touchmove as interaction plugins mouse might not update on certain devices.
                    var mouseposition = app.renderer.plugins.interaction.mouse.global;
                    //Update the mouse values to history
                    historyX.pop();
                    historyX.unshift(mouseposition.x);
                    historyY.pop();
                    historyY.unshift(mouseposition.y);
                    //Update the points to correspond with history.
                    for (let i = 0; i < ropeSize; i++) {
                        let p = points[i];
                        //Smooth the curve with cubic interpolation to prevent sharp edges.
                        let ix = cubicInterpolation(historyX, i / ropeSize * historySize, 1);
                        let iy = cubicInterpolation(historyY, i / ropeSize * historySize, 1);
                        p.x = ix;
                        p.y = iy;
                    }
                }
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
//# sourceMappingURL=script.js.map