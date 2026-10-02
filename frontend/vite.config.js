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
    // Confirmed 2026-10-02: assets/ holds a lot more than this build
    // produces -- favicons, fonts, standalone playground pages/scripts
    // (cri3d.js, hcri-playground.*, etc.) that are served directly, not
    // built by Vite at all. emptyOutDir:true wiped every one of those on
    // a routine `npm run build`, since Vite only knows to clear and
    // regenerate what IT manages. false: only the files this config
    // actually emits (app.js/app.css/index.html) get overwritten; nothing
    // else in assets/ is touched.
    emptyOutDir: false,
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
