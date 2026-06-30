import { Routes, Route } from "react-router-dom";

import SignupPage from "#pages/auth/SignupPage.jsx";
import LoginPage from "#pages/auth/LoginPage.jsx";
import VerifyOTPPage from "#pages/auth/VerifyOTPPage.jsx";
import DashboardPage from "#pages/auth/DashboardPage.jsx";
import ProtectedRoute from "#components/ProtectedRoute.jsx";
import ForgotPasswordPage from "#pages/auth/ForgotPasswordPage.jsx";

export default function AppRoutes({ onStart, onStop }) {
    return (
        <>
            <Routes>
                <Route path="/" element={<LoginPage onStart={onStart} onStop={onStop} />} />
                <Route path="/login" element={<LoginPage onStart={onStart} onStop={onStop} />} />
                <Route path="/signup" element={<SignupPage onStart={onStart} onStop={onStop} />} />
                <Route path="/reset-password" element={<ForgotPasswordPage onStart={onStart} onStop={onStop} />} />
                <Route path="/verify-otp" element={<VerifyOTPPage onStart={onStart} onStop={onStop} />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
            </Routes></>
    )
}