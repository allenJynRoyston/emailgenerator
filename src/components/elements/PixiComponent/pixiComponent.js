/* OPTIONS

  PARAMETERS:
  autoplay        |           |     will start playing as soon as script is loaded
  allowpause      |           |     a pause button will be displayed on the bottom left corner
  allowdestroy    |           |     an X button will be displayed on the top right corner
  allowcontrols   |           |     If multiple files are included, will allow the user to click the forward and back buttons
  fullscreen      |           |     if true, width and height will be set to the browsers availWidth and availHeight
  width           | <number>  |     Sets the canvas resolution width to this amount
  height          | <number>  |     Sets the canvas resolution width to this amount
  type            | <string>  |     Sets the scaling for a canvas element.  Can be FIT, CENTER, or NONE
  orderdelay      | <number>  |     set a number (in seconds) to delay the start of a script if there are more than one Pixi instances

  // SINGLE FILE
  PixiComponent.bg-canvas(file='src/filelocation/file.js' autoplay allowpause allowdestroy allowcontrols fullscreen)
  PixiComponent.bg-canvas(file='src/filelocation/file.js' type='GROW' width='800' height='600' autoplay allowpause allowdestroy allowcontrols)

  // MULTIPLE FILES
  PixiComponent.bg-canvas(v-if='!this.isMobile' v-bind:files='pixiFiles' autoplay allowcontrols allowpause allowdestroy)
  
    - in controller
    pixiFiles: ['src/_pixi/demo/demo.js', 'src/_pixi/demo/demo.js', 'src/_pixi/template/pixi_template.js']


*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default {
    props: ['file', 'files', 'autoplay', 'allowpause', 'allowdestroy', 'allowcontrols', 'fullscreen', 'width', 'height', 'type', 'orderdelay'],
    data() {
        return {
            index: 0,
            isReady: false,
            element: null,
            store: this.$store,
            props: this.$props,
            hasAutoplay: null,
            hasControls: null,
            hasAllowpause: null,
            hasAllowdestroy: null,
            hasFullscreen: null,
            responsiveType: 'NONE',
            defaultWidth: 400,
            defaultHeight: 400,
            loadedOnce: false,
            orderDelay: null,
        };
    },
    mounted() {
        this.hasAutoplay = !!this.props.autoplay;
        this.hasControls = !!this.props.allowcontrols && !!this.files && this.files.length > 1;
        this.hasAllowpause = !!this.props.allowpause;
        this.hasAllowdestroy = !!this.props.allowdestroy;
        this.hasFullscreen = !!this.props.fullscreen;
        this.defaultWidth = parseInt(!!this.props.width ? this.props.width : this.defaultWidth);
        this.defaultHeight = parseInt(!!this.props.height ? this.props.height : this.defaultHeight);
        this.responsiveType = !!this.props.type ? this.props.type : this.responsiveType;
        this.orderDelay = !!this.props.orderdelay ? parseInt(this.props.orderdelay) : 0;
        this.init();
    },
    methods: {
        init() {
            setTimeout(() => {
                if (!!this.files) {
                    this.loadGame(this.files[this.index]);
                }
                if (!!this.file) {
                    this.loadGame(this.file);
                }
            }, this.orderDelay * 500);
        },
        loadGame(fileLocation) {
            return __awaiter(this, void 0, void 0, function* () {
                // load threeJS (once)      
                yield new Promise((resolve, reject) => {
                    let js = document.createElement("script");
                    js.type = "text/javascript";
                    js.src = `/node_modules/pixi.js/dist/pixi.min.js`;
                    document.body.appendChild(js);
                    js.onload = (() => {
                        this.store.commit('setPixiIsLoaded', true);
                        this.store.commit('setPhaserIsLoaded', false);
                        resolve();
                    });
                });
                // load game file
                yield new Promise((resolve, reject) => {
                    let js = document.createElement("script");
                    js.type = "text/javascript";
                    js.src = `${fileLocation}`;
                    document.body.appendChild(js);
                    js.onload = (() => {
                        resolve();
                    });
                });
                // load new one      
                this.start();
            });
        },
        start() {
            __pixi.init(this.$el, this, {
                width: this.hasFullscreen ? screen.availWidth : this.defaultWidth,
                height: this.hasFullscreen ? screen.availHeight : this.defaultHeight,
                autoplay: this.autoplay || false,
                resizeBehavior: this.responsiveType,
            });
        },
        next() {
            if (this.index + 1 < this.files.length) {
                this.index++;
            }
            if (!(!!this.props.autoplay)) {
                this.hasAutoplay = false;
                this.isReady = false;
            }
            this.destroy();
            this.loadGame(this.files[this.index]);
        },
        back() {
            if (this.index - 1 >= 0) {
                this.index--;
            }
            if (!(!!this.props.autoplay)) {
                this.hasAutoplay = false;
                this.isReady = false;
            }
            this.destroy();
            this.loadGame(this.files[this.index]);
        },
        autostart() {
            this.hasAutoplay = true;
            this.element.global.pause = false;
        },
        pause() {
            this.element.global.pause = !this.element.global.pause;
        },
        destroy() {
            this.isReady = false;
            this.element.global.destroyMe();
        }
    },
    destroyed() {
        if (!this.element.global.destroyed) {
            this.element.global.destroyMe();
        }
    }
};
//# sourceMappingURL=pixiComponent.js.map