import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const isClient = typeof window !== 'undefined';

const getSystemTheme = (): boolean => {
    if (!isClient) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (!isClient) return;
    
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (!isClient) return 'system';
    
    const stored = localStorage.getItem('appearance') as Appearance;
    return stored || 'system';
};

const applyTheme = (appearance: Appearance) => {
    if (!isClient) return;
    
    const isDark = appearance === 'dark' || (appearance === 'system' && getSystemTheme());
    document.documentElement.classList.toggle('dark', isDark);
};

export function initializeTheme() {
    if (!isClient) return;
    
    const savedAppearance = getStoredAppearance();
    applyTheme(savedAppearance);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        return isClient ? getStoredAppearance() : 'system';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    useEffect(() => {
        // Initialize theme on mount
        const savedAppearance = getStoredAppearance();
        if (savedAppearance !== appearance) {
            setAppearance(savedAppearance);
        }
        applyTheme(savedAppearance);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            const currentAppearance = getStoredAppearance();
            if (currentAppearance === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        
        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, [appearance]);

    return { appearance, updateAppearance } as const;
}
