import { useState, useEffect, createContext } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light'); // 'light' | 'dark'

    // Modificare document.documentElement è un effetto collaterale: agisce sul DOM
    // reale al di fuori del controllo di React. Il rendering deve essere puro
    // (nessuna interazione col mondo esterno), quindi questa operazione va dentro
    // useEffect, che viene eseguito dopo che React ha già aggiornato il DOM.
    // L'array [theme] garantisce che l'effetto si ripeta solo quando il tema cambia.
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,       // stato corrente del tema
        toggleTheme, // funzione per cambiarlo
    };

    return (
        <ThemeContext value={value}>
            {children}
        </ThemeContext>
    );
}

export { ThemeContext, ThemeProvider };