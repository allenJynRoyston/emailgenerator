// require vue and vue modules
import Vue from 'vue'
import Router from 'vue-router'
import VueResource from 'vue-resource'
import VueYouTubeEmbed from 'vue-youtube-embed'

/* IMPORT COMPONENTS */
// page components
import {Home, About, Game, Three, Pixi} from './components/'
// element components
import {PixiComponent, GameComponent, ThreeComponent, Navigation, Overlay, Header, Footer, DrawerComponent, GridComponent, EmailGeneratorComponent, Test} from './components/'


// shared elements
Vue.component('PixiComponent', PixiComponent)
Vue.component('GameComponent', GameComponent)
Vue.component('ThreeComponent',ThreeComponent)
Vue.component('SiteNavigation', Navigation)
Vue.component('SiteOverlay', Overlay)
Vue.component('SiteHeader', Header)
Vue.component('SiteFooter', Footer)
Vue.component('DrawerComponent', DrawerComponent)
Vue.component('GridComponent', GridComponent)
Vue.component('EmailGeneratorComponent', EmailGeneratorComponent)

// register router
Vue.use(Router)
Vue.use(VueResource);
Vue.use(VueYouTubeEmbed, { global: true })


// set routes
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/phaser',
      name: 'Phaser',
      component: Game
    },
    {
      path: '/three',
      name: 'Three',
      component: Three
    },
    {
      path: '/pixi',
      name: 'Pixi',
      component: Pixi
    }    
  ]
})
