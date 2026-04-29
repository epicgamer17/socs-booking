/* Author: Tanav Bansal */
//Jonathan Lamontagne-Kratz modefied it a bit return use AuthContext and use cookies wrapper


import { useState, createContext, useContext } from "react";
import { fetchWithAuth } from "./api";

const API_URL = import.meta.env.VITE_API_URL

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("student");
        return savedUser ? JSON.parse(savedUser) : null;


    });
    const [error, setError] = useState("");

    // TEST MODE: domain check is relaxed — role is selected on the form and
    // we only fall back to the email rule when nothing was passed in.
    function getRoleFromEmail(email) {
        const r = (email || "").trim().toLowerCase();
        if (r.endsWith("@mail.mcgill.ca")) return "student";
        if (r.endsWith("@mcgill.ca")) return "owner";
        return "student";
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
        return true;
    }

    async function register(email, firstName, lastName, password, department, role) {
        setError("");
        if (!checkEmailPassword(email, password)) return false;

        const finalRole = role || getRoleFromEmail(email);
        const to_send_data = {
            email, firstName, lastName, password, role: finalRole
        }

        if (finalRole === "owner") {
            to_send_data.department = department;

        }

        try {
            const r = await fetchWithAuth(`${API_URL}/auth/register`, {
                method: "POST",
                body: JSON.stringify(to_send_data)
            });
            const data = await r.json();
            if (!r.ok) {
                setError(data.message || "Registration Failed");
                return false;
            }
            return true;
        }
        catch {
            setError("Registration Failed");
            return false;

        }
    }

    async function login(email, password) {
        setError("");
        if (!checkEmailPassword(email, password)) return false;
        try {
            const r = await fetchWithAuth(`${API_URL}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            const data = await r.json();
            if (!r.ok) {
                setError(data.message || "Login Failed");
                return false;
            }

            // role lives in the JWT payload — decode it so test users with
            // non-McGill emails still land on the right dashboard.
            let role = getRoleFromEmail(email);
            try {
                const payload = JSON.parse(atob(data.token.split(".")[1]));
                if (payload.role) role = payload.role;
            } catch { /* fall back to email-derived role */ }

            const userData = { email, role, token: data.token };
            localStorage.setItem("student", JSON.stringify(userData))
            setUser(userData);
            return userData;
        }
        catch {
            setError("Login Failed");
            return false;

        }

    }

    async function logout() {
        try {
            await fetchWithAuth(`${API_URL}/auth/logout`, {
                method: "POST",
            });

        }
        catch {
            console.log("Logout Failed");

        }
        finally {
            localStorage.removeItem("student")
            setUser(null);

        }
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