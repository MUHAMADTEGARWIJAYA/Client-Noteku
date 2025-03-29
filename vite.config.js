import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['vue-sweetalert2'],
  },
  plugins: [vue(), vueDevTools()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'https://server-noteku.vercel.app/',
      // '/api': 'http://localhost:4000/',
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
