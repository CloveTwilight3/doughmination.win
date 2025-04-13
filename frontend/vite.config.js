import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 8080,        // The port React app runs on
    hmr: {
      protocol: 'wss',
      host: 'friends.clovetwilight3.co.uk',  // Make sure this matches the domain
    },
  },
  plugins: [react()],
});
