import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline, MdLockOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Icon from "#components/ui/Icon.jsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { forgotPassword, login } from "#api/auth.js";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginForm({
            ...loginForm,
            [e.target.name]: e.target.value
        });
    };

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email);

    const handleLogin = async () => {
        try {
            console.log(loginForm)
            const res = await login({
                email: loginForm.email,
                password: loginForm.password
            });

            localStorage.setItem("token", res.data.token);
            navigate('/dashboard');
        } catch (e) {
            console.error(e.response?.data?.message || "Login failed");
        }
    }

    const handleForgotPassword = async () => {
        try {
            if (loginForm.email === "") return alert("Please enter your email");

            const res = await forgotPassword({
                email: loginForm.email
            })

            navigate('/reset-password', { state: { email: loginForm.email } });
        } catch (e) {
            console.error(e.response?.data?.message || "Password reset failed");
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-screen"
        >
            <div className="w-screen h-screen bg-[#FFF7E6] flex justify-center items-center">
                <div className="w-[80%] lg:w-[35%] h-full flex flex-col p-2 gap-4 items-center justify-center">

                    <div className="gap-2">
                        <div className="font-headline text-5xl text-[#0F1D29] font-semibold text-center w-full flex items-center gap-4">
                            <Icon height={4} width={4} />ADA
                        </div>
                        <div className="font-label text-center text-[#551E26] mt-2">Create. Sell. Track</div>
                    </div>

                    <div className="w-full bg-white h-[65%] rounded-3xl flex flex-col justify-center items-center font-body">
                        <form className="flex flex-col w-[80%] align-items gap-6 mb-2">

                            {/* Email */}
                            <label className="flex flex-col gap-1">
                                <div className="font-medium text-sm flex items-center gap-2">
                                    <MdOutlineMailOutline /> Email Address
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    value={loginForm.email}
                                    onChange={handleChange}
                                    className="w-full h-10 px-4 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                />
                                {loginForm.email && !isValidEmail && (
                                    <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                                )}
                                {loginForm.email && isValidEmail && (
                                    <p className="text-xs text-green-500 mt-1">Valid email ✓</p>
                                )}
                            </label>

                            {/* Password */}
                            <label className="flex flex-col gap-1">
                                <div className="flex relative font-medium text-sm">
                                    <div className="flex items-center gap-2"><MdLockOutline /> Password</div>
                                    <div className="absolute right-0 text-[#8D4A52] hover:cursor-pointer"
                                        onClick={() => { handleForgotPassword() }}>Forgot Password?</div>
                                </div>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={loginForm.password}
                                        onChange={handleChange}
                                        className="w-full border border-[#c1c1c1] px-4 h-10 rounded-lg focus:outline-[#CBA0AA] pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </label>

                            <button
                                disabled={!isValidEmail || !loginForm.password}
                                className="w-full h-10 bg-[#8D4A52] rounded-4xl text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleLogin}
                            >
                                Login
                            </button>
                        </form>

                        <div className="flex flex-col w-full items-center gap-3 mt-4">
                            <div className="text-[#CBA0AA]">or continue with</div>
                            <button className="w-[80%] border border-[#c1c1c1] rounded p-2 h-10 rounded-lg flex justify-center items-center gap-4 hover:bg-[#0F1D29] hover:text-white transition duration-150">
                                <FaGoogle /> Google
                            </button>
                        </div>
                    </div>

                    <div className="font-label h-8 mt-4">
                        New to ADA? <Link to="/signup" className="font-semibold text-[#8D4A52]">Create an Account</Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}