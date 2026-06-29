import { FaGoogle, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Icon from "#components/ui/Icon.jsx";

const passwordRules = [
    { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Number", test: (p) => /[0-9]/.test(p) },
    { label: "Symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    const [signUpForm, setSignUpForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setSignUpForm({
            ...signUpForm,
            [e.target.name]: e.target.value
        });
    };

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email);
    const allRulesPassed = passwordRules.every(rule => rule.test(signUpForm.password));
    const passwordsMatch = signUpForm.password === signUpForm.confirmPassword;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-screen"
        >
            <div className="w-screen h-screen bg-[#FFF7E6] flex justify-center items-center">
                <div className="h-full w-[85%] flex gap-2 items-center justify-center">
                    <div className="h-full w-[50%] p-6 hidden lg:block">
                        <div className="h-full w-full flex flex-col justify-center gap-2">
                            <div className="gap-2">
                                <div className="font-headline text-3xl text-[#0F1D29] font-semibold w-full flex items-center gap-4">
                                    <Icon height={2} width={2} />ADA
                                </div>
                                <div className="font-label text-[#551E26] mt-2">Create. Sell. Track</div>
                            </div>
                            <div className="font-headline text-5xl font-semibold">
                                Your freelance business, finally in sync.
                            </div>
                            <div className="font-body text-lg">
                                Manage projects, orders, deadlines, expenses, and finances in one calm workspace designed to help independent professionals stay focused on what matters most.
                            </div>
                        </div>
                    </div>

                    <div className="h-full w-[100%] lg:w-[50%] p-6 flex items-center justify-center overflow-y-auto">
                        <div className="w-[85%] p-8 bg-white rounded-2xl flex flex-col gap-4 my-6">
                            <div className="text-3xl font-headline font-[550]">Create your ADA account</div>

                            <form className="font-body flex flex-col gap-4">
                                {/* Username */}
                                <label className="flex flex-col">
                                    <div className="font-medium text-sm flex items-center gap-2"><IoMdPerson /> Username</div>
                                    <input
                                        name="username"
                                        value={signUpForm.username}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full h-9 px-4 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                    />
                                </label>

                                {/* Email */}
                                <label className="flex flex-col">
                                    <div className="font-medium text-sm flex items-center gap-2"><MdOutlineMailOutline /> Email Address</div>
                                    <div className="relative">
                                        <input
                                            ref={emailRef}
                                            name="email"
                                            value={signUpForm.email}
                                            onChange={handleChange}
                                            type="email"
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                            className="w-full h-9 px-4 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                        />

                                        {/* Email popover — shows when invalid, hides when valid */}
                                        {/* Email popover */}
                                        {(emailFocused || signUpForm.email) && !isValidEmail && emailRef.current && (() => {
                                            const rect = emailRef.current.getBoundingClientRect();
                                            return (
                                                <div style={{ position: "fixed", top: rect.top, left: rect.right + 12, zIndex: 9999 }}
                                                    className="w-40 bg-white border border-[#e0e0e0] rounded-xl shadow-lg p-3">
                                                    <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
                                                    <p className="text-xs font-semibold text-[#0F1D29] mb-2">Email must look like:</p>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs text-[#888]"><span>•</span><span>name@example.com</span></div>
                                                        <div className="flex items-center gap-2 text-xs text-[#888]"><span>•</span><span>Must contain @</span></div>
                                                        <div className="flex items-center gap-2 text-xs text-[#888]"><span>•</span><span>Must have a domain (e.g. .com)</span></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </label>

                                {/* Password */}
                                <label className="flex flex-col">
                                    <div className="flex relative font-medium text-sm items-center gap-2">
                                        <MdLockOutline /> Password
                                    </div>
                                    <div className="relative">
                                        <input
                                            ref={passwordRef}
                                            name="password"
                                            value={signUpForm.password}
                                            onChange={handleChange}
                                            type={showPassword ? "text" : "password"}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            className="w-full border border-[#c1c1c1] px-4 h-9 rounded-lg focus:outline-[#CBA0AA] pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>

                                        {/* Password rules popover */}
                                        {/* Password popover */}
                                        {(passwordFocused || signUpForm.password) && !allRulesPassed && passwordRef.current && (() => {
                                            const rect = passwordRef.current.getBoundingClientRect();
                                            return (
                                                <div style={{ position: "fixed", top: rect.top, left: rect.left - 192 - 12, zIndex: 9999 }}
                                                    className="w-40 bg-white border border-[#e0e0e0] rounded-xl shadow-lg p-3">
                                                    <div className="absolute -right-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
                                                    <p className="text-xs font-semibold text-[#0F1D29] mb-2">Password must have:</p>
                                                    <div className="flex flex-col gap-1">
                                                        {passwordRules.map((rule) => {
                                                            const passed = rule.test(signUpForm.password);
                                                            return (
                                                                <div key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? "text-green-500" : "text-red-400"}`}>
                                                                    <span>{passed ? "✓" : "✗"}</span>
                                                                    <span>{rule.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </label>

                                {/* Confirm Password */}
                                <label className="flex flex-col">
                                    <div className="flex relative font-medium text-sm items-center gap-2">
                                        <FaCheck /> Confirm Password
                                    </div>
                                    <div className="relative">
                                        <input

                                            name="confirmPassword"
                                            value={signUpForm.confirmPassword}
                                            onChange={handleChange}
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full border border-[#c1c1c1] px-4 h-9 rounded-lg focus:outline-[#CBA0AA] pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(prev => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    {signUpForm.confirmPassword && !passwordsMatch && (
                                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                    {signUpForm.confirmPassword && passwordsMatch && (
                                        <p className="text-xs text-green-500 mt-1">Passwords match ✓</p>
                                    )}
                                </label>

                                <div className="flex gap-2 my-2">
                                    <input type="checkbox" className="accent-[#C87B83]" />
                                    <label className="text-sm">
                                        I agree to the Terms of Service and Privacy Policy
                                    </label>
                                </div>

                                <button
                                    disabled={!allRulesPassed || !passwordsMatch || !isValidEmail}
                                    className="w-full h-10 bg-[#8D4A52] rounded-4xl text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sign Up
                                </button>
                            </form>

                            <div className="flex flex-col w-full items-center gap-3">
                                <div className="text-[#CBA0AA]">or continue with</div>
                                <button className="w-[80%] border border-[#c1c1c1] rounded p-2 h-10 rounded-lg flex justify-center items-center gap-4 hover:bg-[#0F1D29] hover:text-white transition duration-150">
                                    <FaGoogle /> Google
                                </button>
                                <div className="font-label h-8 mt-4">Already have an account? <Link to="/login" className="font-semibold text-[#8D4A52]">Login to ADA</Link></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}