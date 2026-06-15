import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'
import Livefeed from '../views/Livefeed.vue'
import Setting from '../views/Setting.vue'
import Analytics from '../views/Analytics.vue'
import Feedback from '../views/Feedback.vue'

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
    path: '/feedback', 
    component: Feedback, 
    meta: { requiresAuth: true, adminOnly: true }
  },
  { 
    path: '/setting', 
    component: Setting, 
    meta: { requiresAuth: true, adminOnly: true }
  },
  { 
    path: '/map', 
    component: Map, 
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

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    return '/'
  }

  if (to.meta.adminOnly && role !== 'admin') {
    return '/home'
  }

})

export default router
