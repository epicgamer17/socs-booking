/* Author: Tanav Bansal*/


import { useState, createContext, useContext } from "react";

const API_URL = import.meta.env.VITE_API_URL

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("student");
        return savedUser ? JSON.parse(savedUser) : null;


    });
    const [error, setError] = useState("");

    function getRoleFromEmail(email) {
        const r = email.trim().toLowerCase();
        if (r.endsWith("@mail.mcgill.ca")) return "student";
        if (r.endsWith("@mcgill.ca")) return "owner";
        return null;
    }

    function checkEmailPassword(email, password) {
        if (email.trim() === "") {
            setError("Please enter your email");
            return false;
        }
        if (password.trim() === "") {
            setError("Please enter your password");
            return false;
        }
        if (!getRoleFromEmail(email)) {
            setError("Use a valid McGill email");
            return false;
        }
        return true;
    }

    async function register(email, firstName, lastName, password, department) {
        setError("");
        if (!checkEmailPassword(email, password)) return false;

        const to_send_data = {
            email, firstName, lastName, password
        }

        if (getRoleFromEmail(email) === "owner") {
            to_send_data.department = department;

        }

        const r = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(to_send_data)
        });
        const data = await r.json();
        if (!r.ok) {
            setError(data.message || "Registration Failed");
            return false;
        }
        return true;
    }

    async function login(email, password) {
        setError("");
        if (!checkEmailPassword(email, password)) return false;

        const r = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await r.json();
        if (!r.ok) {
            setError(data.message || "Login Failed");
            return false;
        }

        const userData = { email, role: getRoleFromEmail(email), token: data.token };
        localStorage.setItem("student", JSON.stringify(userData))
        setUser(userData);
        return userData;
    }

    async function logout() {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${user.token}` }


        });
        localStorage.removeItem("student")
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{
            user,
            error,
            setError,
            register,
            login,
            logout,
            getRoleFromEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}