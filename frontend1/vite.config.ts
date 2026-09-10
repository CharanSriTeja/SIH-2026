import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['maplibre-gl']
    },
    server: {
      port: 5173,
      proxy: {
        '/auth': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/profile': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/risk': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/tiles': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/data': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/reports': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/district-admin': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/admin': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        },
        '/reference': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true
        }
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
