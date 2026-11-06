import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/ThemeContext.jsx'
import { redirectCmpToShared } from './lib/runtimeLink.js'

// A runtime comparison address opened while signed out becomes the public link (when those lights are shared).
try { if (!localStorage.getItem('spd_token')) redirectCmpToShared(); } catch { /* ignore */ }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
