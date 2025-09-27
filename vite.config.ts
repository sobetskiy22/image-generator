import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/image-generator/",
  server: {
    allowedHosts: [
      '7a36a3d6c867.ngrok-free.app'
    ]
  },
  build: {
    outDir: './build',
    emptyOutDir: true, // also necessary
  }
})
