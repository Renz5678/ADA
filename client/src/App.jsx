import { Routes, Route } from "react-router-dom";

import SignupPage from "#pages/auth/SignupPage.jsx";
import LoginPage from "#pages/auth/LoginPage.jsx";
import VerifyOTPPage from "#pages/auth/VerifyOTPPage.jsx";
import DashboardPage from "#pages/auth/DashboardPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
    );
}