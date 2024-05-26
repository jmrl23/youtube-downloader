import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react-swc';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/docs': {
        target: BACKEND_URL,
      },
    },
  },
});
