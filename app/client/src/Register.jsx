/* Author: Tanav Bansal & Jonathan Lamontange Kratz (linking styling only) */

import { useEffect, useState } from "react";
import useAuth from './utils/auth';
import { DEPARTMENT_OPTIONS, getDepartment } from "./utils/departments";

import Button from './components/ui/Button';
import Input from './components/ui/Input';
import styles from './Auth.module.css';


function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const { register, error, setError } = useAuth();

    useEffect(() => {
        document.title = "Register"
    }, []);

    function handleFirstNameChange(event) {
        setError("")
        setFirstName(event.target.value)
    }

    function handleLastNameChange(event) {
        setError("")
        setLastName(event.target.value)
    }

    function handleEmailChange(event) {
        const newEmail = event.target.value
        setError("")
        setEmail(newEmail)
        setIsOwner(newEmail.endsWith("@mcgill.ca"))
    }

    function handlePasswordChange(event) {
        setError("")
        setPassword(event.target.value)
    }

    function handleConfirmationPasswordChange(event) {
        setError("")
        setConfirmationPassword(event.target.value)
    }

    function handleDepartmentChange(event) {
        setError("")
        setDepartment(event.target.value)
    }

    async function submitForm(event) {
        event.preventDefault()

        if (!firstName) {
            setError("Please enter your First Name")
            return
        }
        if (!lastName) {
            setError("Please enter your Last Name")
            return
        }
        if (password !== confirmationPassword) {
            setError("Passwords must match")
            return
        }
        if (isOwner && !department) {
            setError("Please select a Department")
            return
        }

        const ok = await register(email, firstName, lastName, password, department)
        if (ok) {
            setFirstName("")
            setLastName("")
            setEmail("")
            setPassword("")
            setConfirmationPassword("")
            setDepartment("")
            setIsOwner(false)
            setIsRegistered(true)
        }
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h2 className={styles.title}>Create Account</h2>
                <p className={styles.subtitle}>Join myBookings</p>

                {error && <p className={styles.error}>{error}</p>}
                {isRegistered && <p className={styles.success}>Registration Successful</p>}

                <form onSubmit={submitForm} className={styles.formGroup}>
                    <Input label="First Name" id="firstName" type="text" value={firstName} onChange={handleFirstNameChange} placeholder="First name" required />
                    <Input label="Last Name" id="lastName" type="text" value={lastName} onChange={handleLastNameChange} placeholder="Last name" required />
                    <Input label="McGill Email" id="email" type="email" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" required />
                    <Input label="Password" id="password" type="password" value={password} onChange={handlePasswordChange} placeholder="••••••••" required />
                    <Input label="Confirm Password" id="confirmationPassword" type="password" value={confirmationPassword} onChange={handleConfirmationPasswordChange} placeholder="••••••••" required />

                    {isOwner && (
                        <div className={styles.selectWrapper}>
                            <label className={styles.selectLabel} htmlFor="dept">Department</label>
                            <select id="dept" className={styles.select} value={department} onChange={handleDepartmentChange} required>
                                <option value="">Select Department</option>
                                {DEPARTMENT_OPTIONS.map((d) => (
                                    <option value={d.code} key={d.code}>
                                        {getDepartment(d.code)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Button type="submit" variant="primary" className={styles.submitButton}>Register</Button>
                </form>

                <p className={styles.switchText}>
                    Already have an account? <a href="/login" className={styles.link}>Login here</a>
                </p>
            </div>
        </div>
    );
}

export default Register;
