import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // START OF CRITICAL SERVER CONFIGURATION FOR PROXY
  server: {
    port: 5173, // Your frontend dev server port (default Vite)
    proxy: {
      '/api': { // This means any request starting with /api (e.g., /api/auth/login)
        target: 'http://localhost:3000', // WILL BE PROXIED TO YOUR BACKEND ON PORT 3000
        changeOrigin: true, // Changes the origin of the host header to the target URL
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // This line might be redundant if backend also uses /api, but harmless
      },
    },
  },
  // END OF CRITICAL SERVER CONFIGURATION FOR PROXY
});