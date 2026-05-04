import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

export default defineConfig({
  base: '/algo-wiki/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: process.env.VITE_API_URL ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    } : {}
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public'
})