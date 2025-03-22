import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('@/views/HomePage.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/register', component: () => import('@/views/RegisterPage.vue') },
  { path: '/detail/:id', component: () => import('@/views/NoteDetail.vue'), meta: { requiresAuth: true } },
  {path: '/create', component: () => import('@/views/CreateNote.vue'), meta: { requiresAuth: true }},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();


  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      try {
        await authStore.checkAuth();
        if (authStore.isAuthenticated) {
          next();
        } else {
          next('/login');
        }
      } catch (error) {
        console.error('Gagal memverifikasi autentikasi:', error);
        next('/login');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
