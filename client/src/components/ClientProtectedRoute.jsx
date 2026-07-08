import { Navigate, Outlet } from "react-router-dom";

export default function ClientProtectedRoute() {
    const clientToken = localStorage.getItem("client_token");
    return clientToken ? <Outlet /> : <Navigate to="/client/login" replace />;
}
