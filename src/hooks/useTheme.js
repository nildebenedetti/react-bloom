import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function useTheme() {
    const context = useContext(ThemeContext);

    if (context === null) {
        throw new Error(
            'useTheme: ThemeProvider not found above this component. ' +
            'Make sure the app is wrapped in <ThemeProvider> in App.jsx.'
        );
    }

    return context;
}

export default useTheme;