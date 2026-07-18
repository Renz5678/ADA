import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline, MdCheck } from "react-icons/md";
import { useGoogleLogin } from '@react-oauth/google';

import { Turnstile } from '@marsidev/react-turnstile';
import Icon from "#components/ui/Icon.jsx";
import { login, forgotPassword, googleLogin } from "#api/auth.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onStart, onStop }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");

    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            onStart("Logging in with Google...");
            setIsSubmitting(true);
            try {
                const res = await googleLogin({ token: tokenResponse.access_token });
                localStorage.setItem("token", res.data.token);
                navigate("/dashboard");
            } catch (err) {
                setError(err.response?.data?.message || "Google Login failed.");
            } finally {
                setIsSubmitting(false);
                onStop();
            }
        },
        onError: () => setError("Google Login Failed")
    });

    const isValidEmail = EMAIL_REGEX.test(form.email);
    const canSubmit = isValidEmail && form.password.length > 0 && turnstileToken && !isSubmitting;

    const handleChange = (e) => {
        setError("");
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        onStart("Logging you in...");
        setIsSubmitting(true);

        try {
            const res = await login({ email: form.email, password: form.password, turnstileToken });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
            onStop();
        }
    };

    const handleForgotPassword = async () => {
        if (!form.email) {
            setError("Enter your email address first.");
            return;
        }
        if (!isValidEmail) {
            setError("Enter a valid email address first.");
            return;
        }

        onStart("Redirecting...");
        try {
            await forgotPassword({ email: form.email });
            navigate("/reset-password", { state: { email: form.email } });
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed. Try again.");
        } finally {
            onStop();
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
                    <div className="mt-3 inline-block bg-[#8D4A52] text-white px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-sm">
                        Freelancer Portal
                    </div>
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
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[#8D4A52] hover:underline text-sm"
                                >
                                    Forgot Password?
                                </button>
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
                                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                        <Turnstile
                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                            onSuccess={(token) => setTurnstileToken(token)}
                        />

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full h-10 bg-[#8D4A52] rounded-full text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Footer */}
                <p className="font-label">
                    New to ADA?{" "}
                    <Link to="/signup" className="font-semibold text-[#8D4A52]">
                        Create an Account
                    </Link>
                </p>
                <p className="font-label text-xs text-gray-500 mt-2">
                    Are you a client?{" "}
                    <Link to="/login-client" className="font-semibold text-[#8D4A52] underline">
                        Login here
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}