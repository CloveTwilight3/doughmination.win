import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: ['friends.clovetwilight3.co.uk', 'localhost', '127.0.0.1'],
  },
  plugins: [react()],
})
