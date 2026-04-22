import { useState } from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'
import { useLocation, useNavigate } from "react-router-dom";



function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login, error, setError } = useAuth();
    const navigate = useNavigate()
    const location = useLocation()



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
            console.log(userdata.role)
            if (userdata.role === 'owner') {
                navigate("/OwnerDashboard")
            } else {
                navigate("/DirectoryPage")
            }
        }
    }

    return (
        <div className="Registration-area">
            <h1>Login</h1>

            <input id="email-box" type="text" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" /><br/>
            <input id="password-box" type="password" value={password} onChange={handlePasswordChange} placeholder="Password" /><br/>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={submitForm}>Login</button>



        </div>);

}

export default Login;
