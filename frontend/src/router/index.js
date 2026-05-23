import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import Livefeed from '../views/Livefeed.vue'
import Setting from '../views/Setting.vue'
import Analytics from '../views/Analytics.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/analytics', component: Analytics },
  { path: '/setting', component: Setting },
  { path: '/home', component: Home },
  { path: '/livefeed', component: Livefeed},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router