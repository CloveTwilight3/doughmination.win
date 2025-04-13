import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['friends.clovetwilight3.co.uk', 'localhost', '127.0.0.1'],
  },
  plugins: [react()],
})
