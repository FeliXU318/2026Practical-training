import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import AdminLayout from '../layout/AdminLayout.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'product-audit', name: 'ProductAudit', component: () => import('../views/ProductAudit.vue') },
      { path: 'secondhand-audit', name: 'SecondHandAudit', component: () => import('../views/SecondHandAudit.vue') },
      { path: 'orders', name: 'OrderManage', component: () => import('../views/OrderManage.vue') },
      { path: 'members', name: 'MemberManage', component: () => import('../views/MemberManage.vue') },
      { path: 'delivery', name: 'DeliveryManage', component: () => import('../views/DeliveryManage.vue') },
      { path: 'phone-card', name: 'PhoneCardManage', component: () => import('../views/PhoneCardManage.vue') },
      { path: 'activity', name: 'ActivityNotice', component: () => import('../views/ActivityNotice.vue') },
      { path: 'complaints', name: 'ComplaintManage', component: () => import('../views/ComplaintManage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && userStore.token) {
    return '/dashboard'
  }
  return true
})

export default router
