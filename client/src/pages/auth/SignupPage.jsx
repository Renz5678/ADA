import { FaGoogle, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline, MdClose } from "react-icons/md";
import { IoMdPerson, IoMdBusiness } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { signup } from "#api/auth.js";
import Icon from "#components/ui/Icon.jsx";

const PASSWORD_RULES = [
    { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Number", test: (p) => /[0-9]/.test(p) },
    { label: "Symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const INITIAL_FORM = { username: "", businessName: "", email: "", password: "", confirmPassword: "" };

function PasswordRulesList({ password, visible }) {
    return (
        <ul className={`flex flex-col gap-0.5 mt-1 overflow-hidden transition-all duration-200 ${visible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
            {PASSWORD_RULES.map(({ label, test }) => {
                const passed = test(password);
                return (
                    <li key={label} className={`flex items-center gap-1.5 text-[11px] ${passed ? "text-green-500" : "text-red-400"}`}>
                        <span>{passed ? <FaCheck className="w-2 h-2" /> : <MdClose className="w-3 h-3" />}</span>
                        <span>{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-[11px] text-red-500 mt-0.5">{message}</p>;
}

function FieldSuccess({ message, visible }) {
    if (!visible) return null;
    return <p className="text-[11px] text-green-500 mt-0.5">{message}</p>;
}

export default function SignupPage({ onStart, onStop }) {
    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const allRulesPassed = PASSWORD_RULES.every(({ test }) => test(form.password));
    const passwordsMatch = form.password === form.confirmPassword;
    const canSubmit = isValidEmail && allRulesPassed && passwordsMatch && agreed && !loading;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSignup = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setError("");
        onStart("Creating your account...");
        try {
            await signup({
                username: form.username,
                business_name: form.businessName,
                email: form.email,
                password: form.password,
            });
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (e) {
            setError(e.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
            onStop();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen bg-[#FFF7E6] flex justify-center items-center"
        >
            <div className="w-full max-w-5xl flex gap-2 items-center justify-center px-4">

                {/* — Left panel — */}
                <div className="hidden lg:flex h-full w-1/2 p-6 flex-col justify-center gap-4">
                    <div>
                        <div className="font-headline text-3xl text-[#0F1D29] font-semibold flex items-center gap-4">
                            <Icon height={2} width={2} /> ADA
                        </div>
                        <div className="font-label text-[#551E26] mt-1">Create. Sell. Track</div>
                    </div>
                    <h1 className="font-headline text-5xl font-semibold leading-tight">
                        Your freelance business, finally in sync.
                    </h1>
                    <p className="font-body text-lg text-[#0F1D29]/80">
                        Manage projects, orders, deadlines, expenses, and finances in one calm
                        workspace designed to help independent professionals stay focused.
                    </p>
                </div>

                {/* — Right panel (form) — */}
                <div className="w-full lg:w-1/2 flex items-center justify-center py-8">
                    <div className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                        <h2 className="text-2xl font-headline font-[550]">Create your ADA account</h2>

                        {error && (
                            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <div className="font-body flex flex-col gap-3">

                            {/* Username */}
                            <label className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <IoMdPerson /> Username
                                </span>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    type="text"
                                    autoComplete="username"
                                    className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                />
                            </label>

                            <label className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <IoMdBusiness /> Business Name
                                </span>
                                <input
                                    name="businessName"
                                    value={form.businessName}
                                    onChange={handleChange}
                                    type="text"
                                    autoComplete="businessName"
                                    className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                />
                            </label>

                            {/* Email */}
                            <label className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <MdOutlineMailOutline /> Email Address
                                </span>
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    type="email"
                                    className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                />
                                <FieldError message={form.email && !isValidEmail ? "Enter a valid email (e.g. name@example.com)" : null} />
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
                                        value={form.password}
                                        onChange={handleChange}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52] text-xs"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <PasswordRulesList
                                    password={form.password}
                                    visible={passwordFocused || form.password.length > 0}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-0.5">
                                <label htmlFor="confirmPassword" className="font-medium text-xs flex items-center gap-1.5 text-[#0F1D29]">
                                    <FaCheck /> Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        className="w-full h-8 px-3 pr-9 text-sm border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((p) => !p)}
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52] text-xs"
                                    >
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <FieldError message={form.confirmPassword && !passwordsMatch ? "Passwords do not match" : null} />
                                <FieldSuccess
                                    message={<span className="flex items-center gap-1">Passwords match <FaCheck /></span>}
                                    visible={form.confirmPassword.length > 0 && passwordsMatch}
                                />
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="accent-[#C87B83] mt-0.5"
                                />
                                <span className="text-xs">
                                    I agree to the{" "}
                                    <a href="/terms" className="text-[#8D4A52] font-medium hover:underline">
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="/privacy" className="text-[#8D4A52] font-medium hover:underline">
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={handleSignup}
                                className="w-full h-9 bg-[#8D4A52] rounded-full text-white text-sm font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating account…" : "Sign Up"}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[#CBA0AA] text-xs">or continue with</span>
                            <button
                                type="button"
                                className="w-4/5 border border-[#c1c1c1] rounded-lg h-9 flex justify-center items-center gap-3 hover:bg-[#0F1D29] hover:text-white transition duration-150 text-xs"
                            >
                                <FaGoogle /> Google
                            </button>
                            <p className="font-label text-xs mt-1">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-[#8D4A52] hover:underline">
                                    Log in to ADA
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}