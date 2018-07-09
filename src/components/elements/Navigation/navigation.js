import * as logo from "../../../assets/images/misc/ninja-icon.png";
import anime from 'animejs';
export default {
    data() {
        return {
            route: this.$route,
            store: this.$store,
            logo: logo,
            headerIsOpen: null,
            drawerIsOpen: null,
            routes: []
        };
    },
    mounted() {
        // get routes from store
        this.routes = this.store.getters._getRoutes();
        // set and watch header state
        this.headerIsOpen = true; //this.store.getters._headerIsOpen()
        this.store.watch(this.store.getters._headerIsOpen, val => {
            this.setHeader(val);
        });
        this.setHeader(this.route.path !== '/', true);
        // set and watch drawer state
        this.drawerIsOpen = this.store.getters._drawerIsOpen();
        this.store.watch(this.store.getters._drawerIsOpen, val => {
            this.setDrawer(val);
        });
    },
    methods: {
        setHeader(val, instant = false) {
            this.headerIsOpen = val;
            this.store.commit('setHeader', val);
            // only animate if it's not mobile
            if (!this.store.getters._getIsMobile()) {
                anime({
                    targets: document.querySelector('#animateme'),
                    padding: val ? '40px' : '15px',
                    backgroundColor: val ? '#596673' : '#2f2f2f',
                    duration: instant ? 0 : 500,
                });
                anime({
                    targets: document.querySelector('.left-link'),
                    opacity: val ? 1 : 0,
                    duration: instant ? 0 : 250,
                });
            }
        },
        setDrawer(val) {
            this.drawerIsOpen = val;
            this.store.commit('setDrawerState', val);
        }
    }
};
//# sourceMappingURL=navigation.js.map