import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider = ({ children }) => {
    // Inicialza com valor do local storage ou false
    const [isHighContrast, setIsHighContrast] = useState(() => {
        const saved = localStorage.getItem('isHighContrast');
        return saved === 'true';
    });

    // Salva no local storage sempre que mudar
    useEffect(() => {
        localStorage.setItem('isHighContrast', isHighContrast);

        // Injeta classe no root document para permitir estilizações CSS globais baseadas no modo
        if (isHighContrast) {
            document.documentElement.classList.add('high-contrast-mode');
        } else {
            document.documentElement.classList.remove('high-contrast-mode');
        }
    }, [isHighContrast]);

    const toggleHighContrast = () => {
        setIsHighContrast(prev => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ isHighContrast, toggleHighContrast }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
