import { useState, useLayoutEffect, createContext } from "react";

// Where the user's choice is stored. The very same key is hard-coded in the tiny
// inline script in index.html, which must set the theme BEFORE React boots to
// avoid a flash of the wrong theme. Keep the two in sync.
export const THEME_STORAGE_KEY = 'bloom.theme';

const THEMES = ['light', 'dark'];

// Reads the persisted choice once, at module load. Falls back to the operating
// system preference the first time the visitor arrives, so the app opens in the
// theme they expect even before they ever press the toggle.
function readInitialTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (THEMES.includes(stored)) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
    // Lazy initializer: the state is resolved during the first render (still
    // before the browser paints), so the UI never mounts in the wrong theme.
    const [theme, setTheme] = useState(readInitialTheme);

    // useLayoutEffect, not useEffect: it runs after React has updated the DOM but
    // still BEFORE the browser paints. Writing the attribute on <html> here means
    // the correct palette is already in place at paint time — a plain useEffect
    // would let one frame of the old theme through, which is what produces the
    // classic "white flash" on dark mode.
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-bs-theme', theme);
        // Persist so returning visitors keep their theme across sessions.
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,       // 'light' | 'dark' — currently active theme
        setTheme,    // set an explicit theme
        toggleTheme, // convenience flip
    };

    return (
        <ThemeContext value={value}>
            {children}
        </ThemeContext>
    );
}

export { ThemeContext, ThemeProvider };
