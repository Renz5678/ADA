import { Routes, Route } from "react-router-dom";

import SignupPage from "#pages/auth/SignupPage.jsx";
import LoginPage from "#pages/auth/LoginPage.jsx";
import VerifyOTPPage from "#pages/auth/VerifyOTPPage.jsx";
import DashboardPage from "#pages/auth/DashboardPage.jsx";
import ProtectedRoute from "#components/ui/ProtectedRoute.jsx";
import ForgotPasswordPage from "#pages/auth/ForgotPasswordPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />
        </Routes>
    );
}