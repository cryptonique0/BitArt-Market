import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['web-vitals'],
    include: ['react', 'react-dom'],
  },
  resolve: {
    alias: {
      'web-vitals': 'web-vitals/dist/web-vitals.js',
    },
  },
});
