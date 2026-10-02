// vite.config.test.js
//
// Build config used ONLY by the Playwright test suite (see playwright.config.js
// and package.json's "test"/"test:build"/"test:preview" scripts).
//
// Deliberately separate from vite.config.js: that config's outDir is
// `../assets` with emptyOutDir:true, which is correct for a real deploy
// build but would silently wipe assets/ (favicons, fonts, chart.umd.js,
// og images, etc. -- everything that lives there but isn't produced by
// this Vite build) every time the test suite runs. This config instead
// builds into a throwaway `test-dist/` folder that's gitignored and never
// touched by anything else.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: './test-dist',
    emptyOutDir: true,
  },
})
