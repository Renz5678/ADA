import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "#components/layout/AppLayout.jsx";
import RoleSelectionPage from "#pages/auth/RoleSelectionPage.jsx";
import SignupPage from "#pages/auth/SignupPage.jsx";
import LoginPage from "#pages/auth/LoginPage.jsx";
import VerifyOTPPage from "#pages/auth/VerifyOTPPage.jsx";
import ProtectedRoute from "#components/ProtectedRoute.jsx";
import ForgotPasswordPage from "#pages/auth/ForgotPasswordPage.jsx";
import TermsPage from "#pages/public/TermsPage.jsx";
import PrivacyPage from "#pages/public/PrivacyPage.jsx";
import LandingPage from "#pages/public/LandingPage.jsx";
import MarketplacePage from "#pages/public/MarketplacePage.jsx";
import FreelancerCatalogPage from "#pages/public/FreelancerCatalogPage.jsx";

import AdminProtectedRoute from "#components/AdminProtectedRoute.jsx";
import AdminDashboard from "#pages/admin/AdminDashboard.jsx";

import DashboardPage from "#pages/app/DashboardPage.jsx";
import ExpensesPage from "#pages/app/ExpensesPage.jsx";
import TasksPage from "#pages/app/TasksPage.jsx";
import ProfileSettingsPage from "#pages/app/ProfileSettingsPage.jsx";
import MaterialsPage from "#pages/app/MaterialsPage.jsx";
import OrdersPage from "#pages/app/OrdersPage.jsx";
import ProductsPage from "#pages/app/ProductsPage.jsx";
import OrderEditorPage from "#pages/app/OrderEditorPage.jsx";
import SchedulePage from "#pages/app/SchedulePage.jsx";

// Client imports
import ClientLoginPage from "#pages/client/auth/ClientLoginPage.jsx";
import ClientRegisterPage from "#pages/client/auth/ClientRegisterPage.jsx";
import ClientVerifyOTPPage from "#pages/client/auth/ClientVerifyOTPPage.jsx";
import ClientLayout from "#components/layout/ClientLayout.jsx";
import ClientProtectedRoute from "#components/ClientProtectedRoute.jsx";
import ClientDashboardPage from "#pages/client/DashboardPage.jsx";
import ClientOrdersPage from "#pages/client/OrdersPage.jsx";
import BusinessDetailsPage from "#pages/client/BusinessDetailsPage.jsx";

export default function AppRouter({ onStart, onStop }) {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<RoleSelectionPage />} />
            <Route path="/login-freelancer" element={<LoginPage onStart={onStart} onStop={onStop} />} />
            <Route path="/signup" element={<SignupPage onStart={onStart} onStop={onStop} />} />
            <Route path="/reset-password" element={<ForgotPasswordPage onStart={onStart} onStop={onStop} />} />
            <Route path="/verify-otp" element={<VerifyOTPPage onStart={onStart} onStop={onStop} />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<FreelancerCatalogPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/profile" element={<ProfileSettingsPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/materials" element={<MaterialsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/new" element={<OrderEditorPage />} />
                    <Route path="/orders/:orderId" element={<OrderEditorPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                </Route>
            </Route>

            {/* Client Routes */}
            <Route path="/client" element={<Navigate to="/login-client" replace />} />
            <Route path="/login-client" element={<ClientLoginPage onStart={onStart} onStop={onStop} />} />
            <Route path="/register-client" element={<ClientRegisterPage onStart={onStart} onStop={onStop} />} />
            <Route path="/verify-otp-client" element={<ClientVerifyOTPPage onStart={onStart} onStop={onStop} />} />
            
            <Route element={<ClientProtectedRoute />}>
                <Route element={<ClientLayout />}>
                    <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                    <Route path="/client/business/:id" element={<BusinessDetailsPage />} />
                    <Route path="/client/orders" element={<ClientOrdersPage />} />
                </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
        </Routes>
    );
}