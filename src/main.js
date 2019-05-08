import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'lib-flexible'
import {Alert, Confirm, Toast, Loading} from 'wc-messagebox'
import FastClick from 'fastclick'
FastClick.attach(document.body)
import 'wc-messagebox/style.css'
import axios from 'axios' 
Vue.prototype.$http = axios;
Vue.use(Alert)
Vue.use(Confirm)
Vue.use(Toast)
Vue.use(Loading)

Vue.config.productionTip = false;

axios.defaults.withCredentials=true
axios.defaults.timeout = 5000 // 请求超时
// axios.defaults.baseURL = '/api/'  // api 即上面 vue.config.js 中配置的地址

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
