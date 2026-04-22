

import { Navigate,Outlet, useLocation } from "react-router-dom";
import useAuth from "./auth";

function ProtectedRoutes(){
    const location = useLocation()
    const {user} = useAuth()
    return user ? <Outlet/> : <Navigate to="/Login" replace state={{from:location}}/>

}

export default ProtectedRoutes