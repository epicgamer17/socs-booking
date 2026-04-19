

import { Navigate,Outlet } from "react-router-dom";
import useAuth from "./auth";

function ProtectedRoutes(){
    const {user} = useAuth()
    return user ? <Outlet/> : <Navigate to="/Login"/>

}

export default ProtectedRoutes