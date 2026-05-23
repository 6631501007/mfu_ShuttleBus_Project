import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import History from '../views/History.vue'
import Home from '../views/Home.vue'
import Setting from '../views/Setting.vue'
import Livefeed from '../views/Livefeed.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/history', component: History },
  { path: '/setting', component: Setting },
  { path: '/home', component: Home },
  { path: '/livefeed', component: Livefeed },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router