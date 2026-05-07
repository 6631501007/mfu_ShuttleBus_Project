import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import History from '../views/History.vue'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/history', component: History },
  { path: '/home', component: Home },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (to.path === '/' && isAuthenticated) {
    // If authenticated and trying to access login, redirect to dashboard
    next('/dashboard');
  } else if (to.path !== '/' && !isAuthenticated) {
    // If not authenticated and trying to access protected route, redirect to login
    next('/');
  } else {
    next();
  }
});

export default router