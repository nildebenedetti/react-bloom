import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute() {

    const { token, isLoading } = useAuthContext();

    if (isLoading) {
        return <div className="p-5 text-center">
            checking current session...
        </div>
    }

    // if token, access to private route
    return token? <Outlet /> : <Navigate to="/login" replace />;

}