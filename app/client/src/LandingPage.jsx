/* Author: Tanav Bansal*/

import { useNavigate } from 'react-router-dom'
import Button from './components/ui/Button';
import styles from './LandingPage.module.css';


function LandingPage() {
        const navigate = useNavigate();

        return (
                <div className={styles.hero}>
                        <h1 className={styles.title}>
                                myBookings
                        </h1>
                        <p className={styles.description}>
                                Connect with professors, schedule office hours, and manage your meetings all in one place.
                        </p>
                        <div className={styles.actionGroup}>
                                <Button variant="primary" onClick={() => navigate('/register')}>
                                        Register
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/login')}>
                                        Log In
                                </Button>
                        </div>
                </div>);


}

export default LandingPage