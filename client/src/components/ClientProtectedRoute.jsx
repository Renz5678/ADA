import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "#contexts/AuthContext.jsx";

export default function ClientProtectedRoute() {
    const { client } = useAuth();
    return client ? <Outlet /> : <Navigate to="/" replace />;
}
