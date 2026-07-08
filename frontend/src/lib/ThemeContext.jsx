import { createContext, useContext, useState, useEffect } from 'react';
import { getTheme } from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('hcri_theme') || 'dark'
  );

  const theme = getTheme(themeName);

  function toggleTheme() {
    const next = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(next);
    localStorage.setItem('hcri_theme', next);
  }

  // Apply background to body so there's no flash
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.documentElement.style.background = theme.bg;
  }, [theme.bg]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
