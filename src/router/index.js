import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../components/FlowChart/index.vue')
    // component: () => import(/* webpackChunkName: "about" */ '../views/Diff.vue')
  },
  {
    path: '/NewDiff',
    name: 'NewDiff',
    component: () => import(/* webpackChunkName: "about" */ '../views/NewDiff.vue')
  },
  {
    path: '/FlowChart',
    name: 'FlowChart',
    component: () => import(/* webpackChunkName: "about" */ '../components/FlowChart/index.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
