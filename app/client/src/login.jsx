import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from './utils/auth';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import styles from './Auth.module.css';


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error, setError } = useAuth();
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        document.title = "Login"
    }, []);

    function handleEmailChange(event) {
        setError("")
        setEmail(event.target.value)
    }
    function handlePasswordChange(event) {
        setError("")
        setPassword(event.target.value)
    }


    async function submitForm(event) {
        event.preventDefault()
        const userdata = await login(email, password)
        if (userdata) {
            const from = location.state?.from?.pathname
            if (from) {
                navigate(from)
                return;
            }
            if (userdata.role === 'owner') {
                navigate("/owner-dashboard")
            } else {
                navigate("/directory-page")
            }
        }
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h2 className={styles.title}>Welcome Back</h2>
                <p className={styles.subtitle}>Sign in to SOCS Booking</p>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={submitForm} className={styles.formGroup}>
                    <Input label="McGill Email" id="email" type="email" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" required />
                    <Input label="Password" id="password" type="password" value={password} onChange={handlePasswordChange} placeholder="••••••••" required />

                    <Button type="submit" variant="primary" className={styles.submitButton}>Login</Button>
                </form>

                <p className={styles.switchText}>
                    Don't have an account? <a href="/register" className={styles.link}>Register here</a>
                </p>
            </div>
        </div>
    );

}
export default Login;
