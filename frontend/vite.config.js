import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base: './' makes ALL asset paths relative — works at any URL depth
  base: './',
  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },
  build: {
    // Output directly into spd2/ root as assets/
    outDir: '../assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Single JS and CSS file, no hashed subfolder
        entryFileNames: 'app.js',
        chunkFileNames: 'app-[name].js',
        assetFileNames: (info) => info.name?.endsWith('.css') ? 'app.css' : '[name][extname]',
      }
    }
  },
})
