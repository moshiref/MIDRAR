import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Light/dark toggle for the supplier portal only — see supplierTheme.css,
 * which scopes both palettes under `.supplier-portal[data-theme]` so this
 * never touches the main site's `:root` tokens or look.
 */

const THEME_KEY = 'midrar_supplier_theme_v1';
const SupplierThemeContext = createContext(null);

function initialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable — fall back to system preference */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function SupplierThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable — theme just won't survive a reload */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <SupplierThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="supplier-portal" data-theme={theme}>
        {children}
      </div>
    </SupplierThemeContext.Provider>
  );
}

export function useSupplierTheme() {
  const ctx = useContext(SupplierThemeContext);
  if (!ctx) throw new Error('useSupplierTheme must be used within a SupplierThemeProvider');
  return ctx;
}
