import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../utils/auth';
import ThemeToggle from './ThemeToggle';
import styles from './NavBar.module.css';

function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.role === 'owner';
    const homeHref = !user ? '/' : isOwner ? '/owner-dashboard' : '/directory-page';

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

    return (
        <nav className={styles.nav}>
            <NavLink to={homeHref} className={styles.brand}>
                <span className={styles.brandMark}>SOCS</span> Booking
            </NavLink>

            <div className={styles.links}>
                {user && isOwner && (
                    <NavLink to="/owner-dashboard" className={linkClass}>Dashboard</NavLink>
                )}
                {user && (
                    <NavLink to="/directory-page" className={linkClass}>Directory</NavLink>
                )}
                {!user && (
                    <>
                        <NavLink to="/login" className={linkClass}>Login</NavLink>
                        <NavLink to="/register" className={linkClass}>Register</NavLink>
                    </>
                )}
                <ThemeToggle />
                {user && (
                    <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
