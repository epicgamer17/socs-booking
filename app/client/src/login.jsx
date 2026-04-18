import {useState} from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'
import { useNavigate } from "react-router-dom";



function Login(){
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const{login,error,setError} = useAuth();
    const navigate = useNavigate()
    


    function handleEmailChange(event){
        setError("")
        setEmail(event.target.value)
    }
    function handlePasswordChange(event){
        setError("")
        setPassword(event.target.value)
    }

    async function submitForm(){

        const ok = await login(email,password)
        if (ok) {
            navigate("/directory")        
        }
    }

    return(
            <div className="Registration-area">  
                <h1>Login</h1>

                <input id="email-box" type="text" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" />
                <input id="password-box" type="password" value={password} onChange={handlePasswordChange} placeholder="Password"/>
                {error && <p style={{color:"red"}}>{error}</p>}
                <button onClick={submitForm}>Login</button>



            </div>);

}

export default Login;