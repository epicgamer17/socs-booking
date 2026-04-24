import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

const STORAGE_KEY = 'theme';

function getInitialTheme() {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
}

function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const next = theme === 'light' ? 'dark' : 'light';
    const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

    return (
        <button
            type="button"
            className={styles.toggle}
            onClick={() => setTheme(next)}
            aria-label={label}
            title={label}
        >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
    );
}

export default ThemeToggle;
