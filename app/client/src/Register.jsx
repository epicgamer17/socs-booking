import {useState} from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'



function Register(){
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const[isRegistered,setIsRegistered] = useState(false);
    const{register,error,setError} = useAuth();


    function handleEmailChange(event){
        setError("")
        setEmail(event.target.value)
    }
    function handlePasswordChange(event){
        setError("")
        setPassword(event.target.value)
    }

    async function submitForm(){

        const ok = await register(email,password)
        if (ok) {
            setEmail("")
            setPassword("")
            setIsRegistered(true)

            
        }
    }

    return(
            <div className="Registration-area">  
                <h1>Register</h1>

                <input id="email-box" type="text" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" />
                <input id="password-box" type="password" value={password} onChange={handlePasswordChange} placeholder="Password"/>
                {error && <p style={{color:"red"}}>{error}</p>}
                {isRegistered && <p style={{color:"green"}}>Registration Successful</p>}
                <button onClick={submitForm}>Register</button>



            </div>);

}

export default Register;