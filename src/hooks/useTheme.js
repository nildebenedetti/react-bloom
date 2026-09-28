import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function useTheme() {
    const context = useContext(ThemeContext);

    if (context === null) {
        throw new Error(
            'useTheme: ThemeProvider non trovato a monte del componente. ' +
            'Verifica di aver avvolto l\'app con <ThemeProvider> in App.jsx.'
        );
    }

    return context;
}

export default useTheme;