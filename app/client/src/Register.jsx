import {useState} from "react";
import useAuth from './utils/auth'

import './RegisterLogin.css'
import { DEPARTMENT_OPTIONS,getDepartment } from "./utils/departments";



function Register(){
    const[firstName,setFirstName] = useState("");
    const[lastName,setLastName] = useState("");
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const[confirmationPassword,setConfirmationPassword] = useState("");


    const[isRegistered,setIsRegistered] = useState(false);
    const{register,error,setError} = useAuth();
    const[department,setDepartment] = useState("");
    const[isOwner,setIsOwner] = useState(false);
    



    function handleFirstNameChange(event){
        setError("")
        setFirstName(event.target.value)
    }

    function handleLastNameChange(event){
        setError("")
        setLastName(event.target.value)
    }


    function handleEmailChange(event){
        const newEmail = event.target.value
        setError("")
        setEmail(newEmail)
        if (newEmail.endsWith("@mcgill.ca")) {
            setIsOwner(true)
        }
        else{setIsOwner(false)}
    }


    function handlePasswordChange(event){
        setError("")
        setPassword(event.target.value)
    }

    function handleConfirmationPasswordChange(event){
        setError("")
        setConfirmationPassword(event.target.value)
    }


    function handleDepartmentChange(event){
        setError("")
        setDepartment(event.target.value)
    }

    async function submitForm(){
        if (isOwner && !department) {
            setError("Please select a Department")
            return
        }
        if(password !== confirmationPassword){
            setError("passwords should be same")
            return

        }
        if(!firstName){
            setError("Please enter your First Name")
            return

        }
        if(!lastName){
            setError("Please enter your Last Name")
            return

        }

        const ok = await register(email,firstName,lastName,password,department)
        if (ok) {
            setEmail("")
            setPassword("")
            setIsRegistered(true)

            
        }
    }

    return(
            <div className="Registration-area">  
                <h1>Register</h1>
                <div className="row">
                <input  type="text" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" /><br/>
                </div>
                
                <div className="row">
                <input  type="text" value={firstName} onChange={handleFirstNameChange} placeholder="First name" />
                <input  type="text" value={lastName} onChange={handleLastNameChange} placeholder="Last name" /><br/>
                </div>

                <div className="row">


                <input  type="password" value={password} onChange={handlePasswordChange} placeholder="Password"/>
                <input  type="password" value={confirmationPassword} onChange={handleConfirmationPasswordChange} placeholder="Confirm password"/><br/>
                </div>

                {error && <p style={{color:"red"}}>{error}</p>}
                {isRegistered && <p style={{color:"green"}}>Registration Successful</p>}
                { isOwner &&
                    <>
                    <select value={department} onChange={handleDepartmentChange}>
                        <option value="">Select Department</option>
                        {
                            DEPARTMENT_OPTIONS.map(d=>{
                                return (<option value={d.code} key={d.code}>
                                    {getDepartment(d.code)}
                                </option>);
                            }
                            )
                        }
                    </select><br/></>
                 }
                <button onClick={submitForm}>Register</button>
            </div>);

}

export default Register;