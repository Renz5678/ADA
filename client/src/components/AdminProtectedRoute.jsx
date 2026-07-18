import { Navigate, Outlet } from "react-router-dom";

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export default function AdminProtectedRoute() {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login-freelancer" replace />;
    }

    const decoded = parseJwt(token);
    if (decoded?.role === 'admin') {
        return <Outlet />;
    }

    return <Navigate to="/dashboard" replace />;
}
