import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import Livefeed from '../views/Livefeed.vue'
import Setting from '../views/Setting.vue'
import Analytics from '../views/Analytics.vue'

const routes = [
  { path: '/', component: Login },
  { 
    path: '/dashboard', 
    component: Dashboard, 
    meta: { requiresAuth: true, adminOnly: true }
  },
  { 
    path: '/analytics', 
    component: Analytics, 
    meta: { requiresAuth: true, adminOnly: true }
  },
  { 
    path: '/setting', 
    component: Setting, 
    meta: { requiresAuth: true, adminOnly: true }
  },
  { 
    path: '/home', 
    component: Home, 
    meta: { requiresAuth: true }
  },
  { 
    path: '/livefeed', 
    component: Livefeed, 
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router