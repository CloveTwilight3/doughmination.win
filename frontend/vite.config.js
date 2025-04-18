import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for the Doughmination System Server frontend
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 8080,        // The port the UI runs on
    hmr: {
      protocol: 'wss',
      host: 'friends.clovetwilight3.co.uk',  // Domain for WebSocket connections
    },
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