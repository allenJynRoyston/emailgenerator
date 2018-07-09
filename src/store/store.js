import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        appReady: false,
        isActive: false,
        isMobile: (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1),
        progressBar: 0,
        headerIsOpen: true,
        phaserIsLoaded: false,
        threeJSIsLoaded: false,
        pixiJsIsLoaded: false,
        drawerIsOpen: false,
        routes: [
            { title: 'Home', goto: '/', expand: false },
            { title: 'About', goto: '/about', expand: true },
            { title: 'Phaser', goto: '/phaser', expand: true },
            { title: 'Three', goto: '/three', expand: true },
            { title: 'Pixi', goto: '/pixi', expand: true }
        ]
    },
    getters: {
        _appReady: state => () => state.appReady,
        _isActive: state => () => state.isActive,
        _progressBar: state => () => state.progressBar,
        _headerIsOpen: state => () => state.headerIsOpen,
        _phaserIsLoaded: state => () => state.phaserIsLoaded,
        _threeJSIsLoaded: state => () => state.threeJSIsLoaded,
        _pixiJSIsLoaded: state => () => state.pixiJsIsLoaded,
        _drawerIsOpen: state => () => state.drawerIsOpen,
        _getRoutes: state => () => state.routes,
        _getIsMobile: state => () => state.isMobile,
    },
    mutations: {
        setAppState(state, value) {
            state.appReady = value;
        },
        overlay_on(state) {
            state.isActive = true;
        },
        overlay_off(state) {
            state.isActive = false;
        },
        setProgressBar(state, value) {
            state.progressBar = value;
        },
        setHeader(state, value) {
            state.headerIsOpen = value;
        },
        setPhaserIsLoaded(state, value) {
            state.phaserIsLoaded = value;
        },
        setThreeJsIsLoaded(state, value) {
            state.threeJSIsLoaded = value;
        },
        setPixiIsLoaded(state, value) {
            state.pixiJsIsLoaded = value;
        },
        setDrawerState(state, value) {
            state.drawerIsOpen = value;
        }
    }
});
//# sourceMappingURL=store.js.map