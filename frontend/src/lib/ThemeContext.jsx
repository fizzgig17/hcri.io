// frontend/src/lib/ThemeContext.jsx
//
// Reconstructed from assets/app.js (minified var C/w/T). Adds one thing the
// stale version didn't have: syncing document.body/documentElement
// background to the theme, so there's no flash of the wrong color behind
// the app on load or theme toggle.

import { createContext, useContext, useState, useEffect } from 'react';
import { getTheme } from './theme';

const ThemeContext = createContext(null);

// Wraps the app (see main.jsx) and provides the current theme object, its
// name, and a toggle function via useTheme(). The chosen theme name
// persists to localStorage ("hcri_theme") so it survives a reload.
export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('hcri_theme') || 'dark');
  const theme = getTheme(themeName);

  function toggleTheme() {
    const next = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(next);
    localStorage.setItem('hcri_theme', next);
  }

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.documentElement.style.background = theme.bg;
    // The pre-load background rule in index.php (#boot-bg) has done its job once the app is
    // running; drop it so a later theme toggle isn't fighting a stale hard-coded colour.
    const boot = document.getElementById('boot-bg');
    if (boot) boot.remove();
  }, [theme.bg]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Reads { theme, themeName, toggleTheme } from the nearest ThemeProvider.
export function useTheme() {
  return useContext(ThemeContext);
}
