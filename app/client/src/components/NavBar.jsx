/* Author: Jonathan Lamontagne-Kratz */
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../utils/auth';
import ThemeToggle from './ThemeToggle';
import styles from './NavBar.module.css';

function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isOwner = !!(user && user.role === 'owner');
    const isLoggedIn = !!(user && user.role);
    const homeHref = !isLoggedIn ? '/' : isOwner ? '/owner-dashboard' : '/user-dashboard';

    // Close the menu on route change so tapping a link dismisses it.
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Lock body scroll while the mobile menu is open.
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    function handleLogout() {
        setIsOpen(false);
        logout();
        navigate('/login');
    }

    const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

    return (
        <>
            <nav className={styles.nav}>
                <NavLink to={homeHref} className={styles.brand}>
                    <span className={styles.brandMark}>myBookings</span>
                </NavLink>

                <div className={styles.desktopLinks}>
                    {/* Public Links (for when logged out) */}
                    {!isLoggedIn && (
                        <>
                            <NavLink to="/login" className={linkClass}>Login</NavLink>
                            <NavLink to="/register" className={linkClass}>Register</NavLink>
                        </>
                    )}

                    {/* links when logged in to stop you being able to see dashboard navs when logged out */}
                    {isLoggedIn && (
                        <>
                            {isOwner ? (
                                <NavLink to="/owner-dashboard" className={linkClass}>Staff Dashboard</NavLink>
                            ) : (
                                <NavLink to="/user-dashboard" className={linkClass}>Student Dashboard</NavLink>
                            )}
                            <NavLink to="/directory-page" className={linkClass}>Directory</NavLink>
                        </>
                    )}

                    <ThemeToggle />

                    {isLoggedIn && (
                        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setIsOpen((v) => !v)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </nav>

            {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}

            <div
                id="mobile-menu"
                className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ''}`}
                aria-hidden={!isOpen}
            >
                {/* Mobile Links */}
                {/* Public links */}
                {!isLoggedIn && (
                    <>
                        <NavLink to="/login" className={linkClass}>Login</NavLink>
                        <NavLink to="/register" className={linkClass}>Register</NavLink>
                    </>
                )}
                {/* links when logged in to stop you being able to see dashboard navs when logged out */}
                {isLoggedIn && (
                    <>
                        {isOwner ? (
                            <NavLink to="/owner-dashboard" className={linkClass}>Staff Dashboard</NavLink>
                        ) : (
                            <NavLink to="/user-dashboard" className={linkClass}>Student Dashboard</NavLink>
                        )}
                        <NavLink to="/directory-page" className={linkClass}>Directory</NavLink>
                    </>
                )}

                <div className={styles.mobileDivider} />

                <div className={styles.mobileActions}>
                    <ThemeToggle />
                    {isLoggedIn && (
                        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default NavBar;
