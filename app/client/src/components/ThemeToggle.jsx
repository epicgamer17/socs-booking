import useTheme from '../utils/theme';
import styles from './ThemeToggle.module.css';

function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

    return (
        <button
            type="button"
            className={styles.toggle}
            onClick={toggle}
            aria-label={label}
            title={label}
        >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
    );
}

export default ThemeToggle;
