import { useState,useEffect } from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'
import { useLocation, useNavigate } from "react-router-dom";



function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login, error, setError } = useAuth();
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(()=>{
        document.title = "Login"
    },[]);

    function handleEmailChange(event) {
        setError("")
        setEmail(event.target.value)
    }
    function handlePasswordChange(event) {
        setError("")
        setPassword(event.target.value)
    }


    async function submitForm() {
        const userdata = await login(email, password)
        if (userdata) {
            const from = location.state?.from?.pathname
            if (from) {
                navigate(from)
                return;
            }
            if (userdata.role === 'owner') {
                navigate("/OwnerDashboard")
            } else {
                navigate("/DirectoryPage")
            }
        }
    }

    return (
        <div className="login-area">
            <h1>Login</h1>

            <div className="row">
                <div className="field">
                    <label htmlFor="email">McGill Email</label>
                    <input id="email" type="email" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca"/>
                </div>
            </div>


            <div className="row">
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={handlePasswordChange} placeholder="Password"/>
                </div>
            </div>


            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={submitForm}>Login</button>



        </div>);

}

export default Login;
