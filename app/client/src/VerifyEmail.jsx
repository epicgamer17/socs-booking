// Author: Jonathan Lamontagne-Kratz
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./utils/api";
import styles from './VerifyEmail.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, failure
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        // token verification as per explained in sophias message
        // with nice error messages as desired
        const verifyToken = async () => {
            try {
                // Call backend verification endpoint
                const response = await fetchWithAuth(`${API_URL}/auth/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage("Email verified! You can now log in.");

                    // Redirect to login after a short delay so user can read the success message
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                } else {
                    setStatus("failure");
                    setMessage(data.message || "Invalid or expired verification link");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("failure");
                setMessage("An error occurred during verification. Please try again.");
            }
        };

        if (token) {
            verifyToken();
        } else {
            setStatus("failure");
            setMessage("No verification token found.");
        }
    }, [token, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Email Verification</h2>
                <p className={styles.subtitle}>myBookings Account</p>

                {status === "verifying" && (
                    <p className={styles.statusMessage}>{message}</p>
                )}

                {status === "success" && (
                    <div className={styles.success}>
                        {message}
                        <p className={styles.redirectHint}>Redirecting to login...</p>
                    </div>
                )}

                {status === "failure" && (
                    <div className={styles.error}>
                        {message}
                    </div>
                )}

                <div>
                    <a href="/login" className={styles.link}>Go to Login</a>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
