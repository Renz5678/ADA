import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline, MdCheck, MdPersonOutline } from "react-icons/md";
import { useGoogleLogin } from '@react-oauth/google';

import Icon from "#components/ui/Icon.jsx";
import { registerClient, googleLoginClient } from "#api/clientEndpoints.js";
import { Turnstile } from '@marsidev/react-turnstile';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientRegisterPage({ onStart, onStop }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", phone_ext: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");

    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            if (onStart) onStart("Registering with Google...");
            setIsSubmitting(true);
            try {
                const res = await googleLoginClient({ token: tokenResponse.access_token });
                localStorage.setItem("client_token", res.token);
                navigate("/client/dashboard");
            } catch (err) {
                setError(err.response?.data?.message || "Google Signup failed.");
            } finally {
                setIsSubmitting(false);
                if (onStop) onStop();
            }
        },
        onError: () => setError("Google Signup Failed")
    });

    const isValidEmail = EMAIL_REGEX.test(form.email);
    const canSubmit = isValidEmail && form.password.length > 0 && form.name.length > 0 && turnstileToken && !isSubmitting;

    const handleChange = (e) => {
        setError("");
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        if (onStart) onStart("Creating your account...");
        setIsSubmitting(true);

        try {
            await registerClient({
                name: form.name,
                email: form.email,
                password: form.password,
                phone_ext: form.phone_ext,
                turnstileToken
            });
            navigate("/verify-otp-client", { state: { email: form.email } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
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
            className="w-full min-h-[100dvh] bg-[#FFF7E6] flex justify-center items-center py-10 pb-24 md:pb-10"
        >
            <div className="w-[90%] md:w-[60%] lg:w-[40%] flex flex-col gap-4 items-center">

                {/* Brand */}
                <div className="text-center">
                    <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                        <Icon height={4} width={4} />
                        ADA
                    </div>
                    <p className="font-label text-[#551E26] mt-2">Client Registration</p>
                </div>

                {/* Card */}
                <div className="w-full bg-[#1A2B3C] border border-gray-700 rounded-3xl flex flex-col items-center py-10 font-body shadow-xl">
                    <form
                        onSubmit={handleRegister}
                        noValidate
                        className="flex flex-col w-[80%] gap-6"
                    >
                        {/* Name */}
                        <label className="flex flex-col gap-1 text-gray-200">
                            <span className="font-medium text-sm flex items-center gap-2">
                                <MdPersonOutline /> Full Name
                            </span>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full h-10 px-4 bg-[#0F1D29] border border-gray-600 rounded-lg text-white focus:border-[#E57A44] focus:outline-none"
                            />
                        </label>

                        {/* Email */}
                        <label className="flex flex-col gap-1 text-gray-200">
                            <span className="font-medium text-sm flex items-center gap-2">
                                <MdOutlineMailOutline /> Email Address
                            </span>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                className="w-full h-10 px-4 bg-[#0F1D29] border border-gray-600 rounded-lg text-white focus:border-[#E57A44] focus:outline-none"
                            />
                            {form.email && (
                                <p className={`text-xs mt-1 ${isValidEmail ? "text-green-400 flex items-center gap-1" : "text-red-400"}`}>
                                    {isValidEmail ? <><MdCheck /> Valid email</> : "Please enter a valid email address"}
                                </p>
                            )}
                        </label>

                        {/* Honeypot Field - Hidden from real users via CSS */}
                        <label className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                            <span className="font-medium text-sm flex items-center gap-2">Phone Extension</span>
                            <input
                                name="phone_ext"
                                type="text"
                                value={form.phone_ext}
                                onChange={handleChange}
                                tabIndex="-1"
                                autoComplete="off"
                            />
                        </label>

                        {/* Password */}
                        <div className="flex flex-col gap-1 text-gray-200">
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
                                    autoComplete="new-password"
                                    className="w-full h-10 px-4 pr-10 bg-[#0F1D29] border border-gray-600 rounded-lg text-white focus:border-[#E57A44] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Global error */}
                        {error && (
                            <p className="text-xs text-red-400 -mt-2">{error}</p>
                        )}

                        <Turnstile
                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                            onSuccess={(token) => setTurnstileToken(token)}
                            theme="dark"
                        />

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full h-10 bg-[#E57A44] rounded-full text-white font-bold hover:bg-[#D46933] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isSubmitting ? "Registering..." : "Register"}
                        </button>
                    </form>

                    {/* Divider + OAuth */}
                    <div className="flex flex-col w-full items-center gap-3 mt-6">
                        <span className="text-gray-400 text-sm">or sign up with</span>
                        <button
                            type="button"
                            onClick={() => handleGoogleAuth()}
                            className="w-[80%] border border-gray-600 h-10 rounded-lg flex justify-center items-center gap-4 text-white hover:bg-white hover:text-[#0F1D29] transition duration-150"
                        >
                            <FaGoogle /> Google
                        </button>
                    </div>
                </div>

                <p className="font-label">
                    Already have an account?{" "}
                    <Link to="/login-client" className="font-semibold text-[#8D4A52]">
                        Login here
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
