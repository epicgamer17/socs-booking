import { useState } from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'
import { useNavigate } from "react-router-dom";



function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { user, login, error, setError } = useAuth();
    const navigate = useNavigate()



    function handleEmailChange(event) {
        setError("")
        setEmail(event.target.value)
    }
    function handlePasswordChange(event) {
        setError("")
        setPassword(event.target.value)
    }

    async function submitForm() {
        if (await login(email, password)) {
            console.log(user.role)
            if (user.role === 'owner') {
                navigate("/OwnerDashboard")
            } else {
                navigate("/DirectoryPage")
            }
        }
    }

    return (
        <div className="Registration-area">
            <h1>Login</h1>

            <input id="email-box" type="text" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" />
            <input id="password-box" type="password" value={password} onChange={handlePasswordChange} placeholder="Password" />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={submitForm}>Login</button>



        </div>);

}

export default Login;