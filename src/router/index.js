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
      console.log("User tidak terautentikasi, memeriksa token...");

      await authStore.checkAuth();

      if (!authStore.isAuthenticated) {
        console.log("Autentikasi gagal, mengarahkan ke login...");
        return next("/login");
      }
    }
  }

  next();
});


export default router;
