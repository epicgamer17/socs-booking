import {useEffect, useState} from "react";
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

    useEffect(()=>{
        document.title = "Register"
    },[]);
    



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
            setError("passwords must match")
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
            setFirstName("")
            setLastName("")
            setEmail("")
            setPassword("")
            setConfirmationPassword("")
            setIsOwner(false)
            setIsRegistered(true)
        }
    }

    return(
            <div className="Registration-area">  
                <h1>Register</h1>
                
                
                <div className="row">

                    <div className="field">
                        <label htmlFor="firstName">First Name</label>
                        <input  id="firstName" type="text" value={firstName} onChange={handleFirstNameChange} placeholder="First name" />
                    </div>

                    <div className="field">
                        <label htmlFor="lastName">Last Name</label>
                        <input id="lastName" type="text" value={lastName} onChange={handleLastNameChange} placeholder="Last name" />
                    </div>

                </div>

                <div className="row">
                    <div className="field">
                        <label htmlFor="email">McGill Email</label>
                        <input  id="email" type="email" value={email} onChange={handleEmailChange} placeholder="first.last@[mail.]mcgill.ca" />
                    </div>
                    
                    
                </div>

                <div className="row">

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={handlePasswordChange} placeholder="Password"/>
                    </div>

                    <div className="field">
                        <label htmlFor="confirmationPassword">Confirm Password</label>
                         <input  id="confirmationPassword" type="password" value={confirmationPassword} onChange={handleConfirmationPasswordChange} placeholder="Confirm password"/>
                    </div>
                </div>

                {error && <p style={{color:"red"}}>{error}</p>}
                {isRegistered && <p style={{color:"green"}}>Registration Successful</p>}


                { isOwner &&
                    <div className="row">

                        <div className="field">
                            <label htmlFor="dept">Department</label>
                            <select id="dept" value={department} onChange={handleDepartmentChange}>
                                <option value="">Select Department</option>
                                {
                                    DEPARTMENT_OPTIONS.map(d=>{
                                        return (<option value={d.code} key={d.code}>
                                            {getDepartment(d.code)}
                                        </option>);
                                    }
                                    )
                                }
                            </select>
                        </div>

                    </div>
                }
                <button onClick={submitForm}>Register</button>
            </div>);

}

export default Register;