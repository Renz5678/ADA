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
    const isValidName = form.name.length > 0 && form.name.length <= 50 && /^[^<>{}[\]]+$/.test(form.name);
    const canSubmit = isValidEmail && form.password.length > 0 && isValidName && turnstileToken && !isSubmitting;

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
            className="w-full min-h-screen bg-[#FFF7E6] flex flex-col py-8 md:py-12"
        >
            <div className="w-full max-w-5xl flex flex-col-reverse lg:flex-row gap-2 items-center justify-center px-4 m-auto">
                
                {/* — Left panel (form) — */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-8">
                    <div className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm font-body">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-headline font-[550] text-[#0F1D29]">Create your ADA Client account</h2>
                            <p className="text-xs text-gray-500">Are you a freelancer? <Link to="/signup" className="text-[#E57A44] font-semibold hover:underline">Sign up as a Freelancer</Link></p>
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleRegister} noValidate className="flex flex-col gap-3">
                            {/* Name */}
                            <label className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <MdPersonOutline /> Full Name
                                </span>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full h-8 px-3 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#E57A44]"
                                />
                                {form.name && !isValidName && (
                                    <p className="text-[11px] mt-0.5 text-red-500">1-50 chars, no special script tags</p>
                                )}
                            </label>

                            {/* Email */}
                            <label className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <MdOutlineMailOutline /> Email Address
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    className="w-full h-8 px-3 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#E57A44]"
                                />
                                {form.email && (
                                    <p className={`text-[11px] mt-0.5 ${isValidEmail ? "text-green-500 flex items-center gap-1" : "text-red-500"}`}>
                                        {isValidEmail ? <><MdCheck /> Valid email</> : "Please enter a valid email address"}
                                    </p>
                                )}
                            </label>

                            {/* Honeypot Field */}
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
                            <div className="flex flex-col gap-0.5">
                                <label htmlFor="password" className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <MdLockOutline /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#E57A44]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#E57A44] text-xs"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-1">
                                <Turnstile
                                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                    onSuccess={(token) => setTurnstileToken(token)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="w-full h-9 mt-1 bg-[#E57A44] rounded-full text-white text-sm font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Registering..." : "Register"}
                            </button>
                        </form>

                        {/* Divider + OAuth */}
                        <div className="flex flex-col w-full items-center gap-2 mt-2">
                            <span className="text-[#c1c1c1] text-xs">or sign up with</span>
                            <button
                                type="button"
                                onClick={() => handleGoogleAuth()}
                                className="w-4/5 border border-[#c1c1c1] h-9 rounded-lg flex justify-center items-center gap-3 hover:bg-[#0F1D29] hover:text-white transition duration-150 text-xs"
                            >
                                <FaGoogle /> Google
                            </button>
                            <p className="font-label text-xs mt-1 text-[#0F1D29]">
                                Already have an account?{" "}
                                <Link to="/login-client" className="font-semibold text-[#E57A44] hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* — Right panel (text) — */}
                <div className="hidden lg:flex h-full w-1/2 p-6 flex-col justify-center gap-4">
                    <div>
                        <div className="font-headline text-3xl text-[#0F1D29] font-semibold flex items-center gap-4">
                            <Icon height={2} width={2} /> ADA
                        </div>
                        <div className="font-label text-[#551E26] mt-1">Hire. Collaborate. Succeed</div>
                    </div>
                    <h1 className="font-headline text-5xl font-semibold leading-tight">
                        Top freelance talent, right at your fingertips.
                    </h1>
                    <p className="font-body text-lg text-[#0F1D29]/80">
                        Connect with skilled professionals, manage your orders, and track project progress 
                        in a seamless and intuitive workspace designed for clients.
                    </p>
                </div>

            </div>
        </motion.div>
    );
}
