import './assets/style.css'
import { createApp } from 'vue'
import Vue3Toastify from 'vue3-toastify'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'vue3-toastify/dist/index.css'
// Pertama, buat aplikasi Vue
const app = createApp(App)

// Kemudian gunakan plugin
app.use(VueQueryPlugin)
app.use(Vue3Toastify, {
  autoClose: 2000,
})
app.use(VueSweetalert2);
app.use(createPinia())
app.use(router)

// Terakhir, mount aplikasi
app.mount('#app')
