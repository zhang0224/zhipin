import Vue from 'vue'
import Router from 'vue-router'
 
//组件模块
import Index from './pages/index/index'
import Explain from './pages/explain'
import Order from './pages/order/order'
import Active from './pages/active'
 
Vue.use(Router)
 
export default new Router({
  routes: [
    { path: '/', name: 'Index', component:  Index},
    { path: '/explain', name: 'Explain', component: Explain },
    { path: '/order', name: 'Order', component: Order },
    { path: '/active', name: 'Active', component: Active },
  ]
})