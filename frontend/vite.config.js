import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for the Doughmination System Server frontend
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 8080,       // The port the UI runs on
    // Add this line to allow your domain
    allowedHosts: ['localhost', '127.0.0.1', 'doughmination.win', 'www.doughmination.win'],
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy avatar requests 
      '/avatars': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react-router-dom']
  }
});
