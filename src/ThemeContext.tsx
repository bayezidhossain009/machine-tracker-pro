import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDarkMode as loadDarkMode, setDarkMode as storeDarkMode } from './store';

export interface Colors {
  pageBg: string; cardBg: string; cardBg2: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  border: string; inputBg: string; navBg: string; headerBg: string;
  amber: string; amberBg: string; successBg: string; dangerBg: string;
  badgePending: string; badgePendingText: string;
  badgeDone: string; badgeDoneText: string;
}

const light: Colors = {
  pageBg: '#f0f2f5', cardBg: '#ffffff', cardBg2: '#f8fafc',
  textPrimary: '#1e293b', textSecondary: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', inputBg: '#f8fafc', navBg: '#ffffff',
  headerBg: 'linear-gradient(135deg, #0a1628, #0f1f3d)',
  amber: '#f59e0b', amberBg: '#fffbeb', successBg: '#f0fdf4', dangerBg: '#fff1f2',
  badgePending: '#fff7ed', badgePendingText: '#b45309',
  badgeDone: '#f0fdf4', badgeDoneText: '#16a34a',
};

const dark: Colors = {
  pageBg: '#0d1117', cardBg: '#161b22', cardBg2: '#21262d',
  textPrimary: '#e6edf3', textSecondary: '#8b949e', textMuted: '#6e7681',
  border: '#30363d', inputBg: '#21262d', navBg: '#161b22',
  headerBg: 'linear-gradient(135deg, #010409, #0d1117)',
  amber: '#f59e0b', amberBg: '#2a1f0a', successBg: '#0a1f0e', dangerBg: '#200a0a',
  badgePending: '#2a1a05', badgePendingText: '#f59e0b',
  badgeDone: '#0a1f0e', badgeDoneText: '#22c55e',
};

// Bootstrap cache key — stores a single boolean so the OS/app renders the
// correct theme immediately on load without waiting for IndexedDB to open.
const BOOT_KEY = '_mt_dark';

interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  c: Colors;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
  c: light,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Fast initial value from the bootstrap cache (prevents splash-screen flash)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem(BOOT_KEY) === '1'; } catch { return false; }
  });

  // Sync authoritative value from IndexedDB on mount
  useEffect(() => {
    loadDarkMode()
      .then(dm => {
        setDarkMode(dm);
        try { localStorage.setItem(BOOT_KEY, dm ? '1' : '0'); } catch { /* ignore */ }
      })
      .catch(() => { /* keep default */ });
  }, []);

  useEffect(() => {
    document.documentElement.style.background = darkMode ? dark.pageBg : light.pageBg;
  }, [darkMode]);

  async function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem(BOOT_KEY, next ? '1' : '0'); } catch { /* ignore */ }
    await storeDarkMode(next);
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, c: darkMode ? dark : light }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
