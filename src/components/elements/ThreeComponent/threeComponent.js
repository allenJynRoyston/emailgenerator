var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default {
    props: [],
    data() {
        return {
            game: null,
            store: this.$store,
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.loadGame('src/_threeJS/ts_demo.js');
        },
        loadGame(fileLocation) {
            return __awaiter(this, void 0, void 0, function* () {
                // remove old game first
                if (this.game !== null) {
                    this.game = null;
                }
                // load threeJS (once)
                if (!this.store.getters._threeJSIsLoaded()) {
                    yield new Promise((resolve, reject) => {
                        let js = document.createElement("script");
                        js.type = "text/javascript";
                        js.src = `/node_modules/three/build/three.min.js`;
                        document.body.appendChild(js);
                        js.onload = (() => {
                            this.store.commit('setThreeJsIsLoaded', true);
                            resolve();
                        });
                    });
                }
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
                __three.init(this.$el, this, { width: 800, height: 600 });
            });
        }
    },
    destroyed() {
        this.game = null;
    }
};
//# sourceMappingURL=threeComponent.js.map