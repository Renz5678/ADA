import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline, MdCheck } from "react-icons/md";
import { useGoogleLogin } from '@react-oauth/google';

import Icon from "#components/ui/Icon.jsx";
import { loginClient, googleLoginClient } from "#api/clientEndpoints.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientLoginPage({ onStart, onStop }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            if (onStart) onStart("Logging in with Google...");
            setIsSubmitting(true);
            try {
                const res = await googleLoginClient({ token: tokenResponse.access_token });
                localStorage.setItem("client_token", res.token);
                navigate("/client/dashboard");
            } catch (err) {
                setError(err.response?.data?.message || "Google Login failed.");
            } finally {
                setIsSubmitting(false);
                if (onStop) onStop();
            }
        },
        onError: () => setError("Google Login Failed")
    });

    const isValidEmail = EMAIL_REGEX.test(form.email);
    const canSubmit = isValidEmail && form.password.length > 0 && !isSubmitting;

    const handleChange = (e) => {
        setError("");
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        if (onStart) onStart("Logging you in...");
        setIsSubmitting(true);

        try {
            const res = await loginClient({ email: form.email, password: form.password });
            localStorage.setItem("client_token", res.token);
            navigate("/client/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
            if (onStop) onStop();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-screen h-screen bg-[#FFF7E6] flex justify-center items-center"
        >
            <div className="w-[80%] lg:w-[35%] flex flex-col gap-4 items-center">

                {/* Brand */}
                <div className="text-center">
                    <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                        <Icon height={4} width={4} />
                        ADA
                    </div>
                    <p className="font-label text-[#551E26] mt-2">Client Portal</p>
                </div>

                {/* Card */}
                <div className="w-full bg-white rounded-3xl flex flex-col items-center py-10 font-body">
                    <form
                        onSubmit={handleLogin}
                        noValidate
                        className="flex flex-col w-[80%] gap-6"
                    >
                        {/* Email */}
                        <label className="flex flex-col gap-1">
                            <span className="font-medium text-sm flex items-center gap-2">
                                <MdOutlineMailOutline /> Email Address
                            </span>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                className="w-full h-10 px-4 border border-[#c1c1c1] rounded-lg focus:border-[#CBA0AA]"
                            />
                            {form.email && (
                                <p className={`text-xs mt-1 ${isValidEmail ? "text-green-500 flex items-center gap-1" : "text-red-500"}`}>
                                    {isValidEmail ? <><MdCheck /> Valid email</> : "Please enter a valid email address"}
                                </p>
                            )}
                        </label>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm flex items-center justify-between">
                                <label htmlFor="password" className="flex items-center gap-2">
                                    <MdLockOutline /> Password
                                </label>
                            </span>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    className="w-full h-10 px-4 pr-10 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Global error */}
                        {error && (
                            <p className="text-xs text-red-500 -mt-2">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full h-10 bg-[#0F1D29] rounded-full text-white font-medium hover:bg-[#8D4A52] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Divider + OAuth */}
                    <div className="flex flex-col w-full items-center gap-3 mt-6">
                        <span className="text-[#CBA0AA] text-sm">or continue with</span>
                        <button
                            type="button"
                            onClick={() => handleGoogleAuth()}
                            className="w-[80%] border border-[#c1c1c1] h-10 rounded-lg flex justify-center items-center gap-4 hover:bg-[#0F1D29] hover:text-white transition duration-150"
                        >
                            <FaGoogle /> Google
                        </button>
                    </div>
                </div>

                <p className="font-label">
                    Don't have an account?{" "}
                    <Link to="/client/register" className="font-semibold text-[#8D4A52]">
                        Sign up here
                    </Link>
                </p>
                <p className="font-label text-xs text-gray-500 mt-2">
                    Are you a freelancer?{" "}
                    <Link to="/login" className="font-semibold text-gray-700 underline">
                        Login here
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
