

import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL

function useAuth(){


    const[user,setUser] = useState(null)
    const[error,setError] = useState("")

    function getRoleFromEmail(email){
        const r = email.trim().toLowerCase()

        if(r.endsWith("@mail.mcgill.ca")){
            return "user"
        }

        if(r.endsWith("@mcgill.ca")){
            return "owner"
        }

        return null
    }

    function checkEmailPassword(email,password){
        if (email.trim()==="") {
            setError("Please enter your email")
            return false;
            
        }
        if (password.trim()==="") {
            setError("Please enter your password")
            return false; 
        }

        if(!getRoleFromEmail(email)){
            setError("Use a valid Mcgill email")
            return false; 
        }

        return true

    }

    async function register(email,password){
        setError("")

        if (!checkEmailPassword(email,password)) {
            return false;
            
        }
        
        const r = await fetch(`${API_URL}/auth/register`,{
            
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({email,password})
        })

        const data = await r.json();
        if(!r.ok){
            setError("Registration Failed")
            return false
        }
        return true;

    }

    async function login(email,password){
        setError("")

        
        if (!checkEmailPassword(email,password)) {
            return false;
            
        }

        const r = await fetch(`${API_URL}/auth/login`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({email,password})
        })

        const data = await r.json();
        if(!r.ok){
            setError("Login Failed")
            return false
        }

        setUser({email,role:data.role,token:data.token});
        return true;
    }

    function logout(){
        setUser(null)
    }

    return{
        user,
        error,
        setError,
        register,
        login,
        logout,
        getRoleFromEmail,

    };
}


export default useAuth