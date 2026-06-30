import { Routes, Route } from "react-router-dom";

import AppLayout from "#components/layout/AppLayout.jsx";
import SignupPage from "#pages/auth/SignupPage.jsx";
import LoginPage from "#pages/auth/LoginPage.jsx";
import VerifyOTPPage from "#pages/auth/VerifyOTPPage.jsx";
import DashboardPage from "#pages/app/DashboardPage.jsx";
import ProtectedRoute from "#components/ProtectedRoute.jsx";
import ForgotPasswordPage from "#pages/auth/ForgotPasswordPage.jsx";

export default function AppRouter({ onStart, onStop }) {
    return (
        <Routes>
            <Route path="/" element={<LoginPage onStart={onStart} onStop={onStop} />} />
            <Route path="/login" element={<LoginPage onStart={onStart} onStop={onStop} />} />
            <Route path="/signup" element={<SignupPage onStart={onStart} onStop={onStop} />} />
            <Route path="/reset-password" element={<ForgotPasswordPage onStart={onStart} onStop={onStop} />} />
            <Route path="/verify-otp" element={<VerifyOTPPage onStart={onStart} onStop={onStop} />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    {/* <Route path="/projects" element={<ProjectsPage />} /> */}
                    {/* <Route path="/invoices" element={<InvoicesPage />} /> */}
                </Route>
            </Route>
        </Routes>
    );
}