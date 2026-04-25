/* Author: Jonathan Lamontagne-Kratz */
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./auth";

function OwnerRoute() {
    const { user } = useAuth();

    // If there's no user or the role is not 'owner', redirect.
    // Assuming ProtectedRoutes handles the initial 'no user' check if nested,
    // but being explicit here for safety.
    if (!user || user.role !== 'owner') {
        return <Navigate to="/directory-page" replace />;
    }

    return <Outlet />;
}

export default OwnerRoute;
