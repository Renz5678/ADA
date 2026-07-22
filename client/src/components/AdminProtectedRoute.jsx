import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "#contexts/AuthContext.jsx";

export default function AdminProtectedRoute() {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role === 'admin') {
        return <Outlet />;
    }

    return <Navigate to="/dashboard" replace />;
}
