import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Icon from "#components/ui/Icon.jsx";
import ErrorModal from "#components/ui/ErrorModal.jsx";
import { resendOtp, confirmResetPassword } from "#api/auth.js";
import { Turnstile } from '@marsidev/react-turnstile';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function ForgotPasswordPage({ onStart, onStop }) {
    const { state } = useLocation();
    const email = state?.email;
    const navigate = useNavigate();

    const [isSettingPassword, setIsSettingPassword] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [errorModal, setErrorModal] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [turnstileToken, setTurnstileToken] = useState("");

    const inputs = useRef([]);

    useEffect(() => {
        if (!email) navigate("/signup", { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    if (!email) return null;

    // ── Password modal ──────────────────────────────────────────
    const handleSettingNewPassword = () => {
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        setPasswordError("");
        setIsSettingPassword(false);
    };

    // ── OTP input handlers ──────────────────────────────────────
    const focusInput = (index) => inputs.current[index]?.focus();

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) focusInput(index + 1);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(pasted)) return;

        const newOtp = Array(OTP_LENGTH).fill("");
        pasted.slice(0, OTP_LENGTH).split("").forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
    };

    // ── Resend ──────────────────────────────────────────────────
    const handleResendOtp = async () => {
        if (resendCooldown > 0 || !turnstileToken) return;

        onStart("Sending a new code...");
        try {
            await resendOtp({ email, turnstileToken });
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
            setOtp(Array(OTP_LENGTH).fill(""));
            focusInput(0);
        } catch (err) {
            const status = err.response?.status;
            const retryAfter = err.response?.headers?.["retry-after"];

            setErrorModal({
                title: "Couldn't Resend Code",
                message: status === 429
                    ? retryAfter
                        ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
                        : "Too many requests. Please wait a moment before trying again."
                    : err.response?.data?.message || "Failed to resend code. Try again.",
                actions: [
                    { label: "OK", onClick: () => { }, variant: "primary" }
                ]
            });
        } finally {
            onStop();
        }
    };

    // ── Submit reset ────────────────────────────────────────────
    const handleResetPassword = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH || !turnstileToken) return;

        setIsSubmitting(true);
        onStart("Resetting your password...");
        try {
            await confirmResetPassword({
                email,
                verification_token: code,
                password: newPassword,
                turnstileToken,
            });
            navigate("/login-freelancer");
        } catch (err) {
            const status = err.response?.status;
            const retryAfter = err.response?.headers?.["retry-after"];

            setOtp(Array(OTP_LENGTH).fill(""));
            focusInput(0);

            if (status === 400) {
                setErrorModal({
                    title: "Code Expired",
                    message: "Your verification code has expired. Request a new one to continue.",
                    actions: [
                        { label: "Resend Code", onClick: handleResendOtp, variant: "primary" },
                        { label: "Go Back", onClick: () => navigate("/login-freelancer"), variant: "secondary" }
                    ]
                });
            } else if (status === 404) {
                setErrorModal({
                    title: "Incorrect Code",
                    message: "That code doesn't match. Double-check and try again, or request a new one.",
                    actions: [
                        { label: "Try Again", onClick: () => { }, variant: "primary" },
                        { label: "Resend Code", onClick: handleResendOtp, variant: "secondary" }
                    ]
                });
            } else if (status === 429) {
                setErrorModal({
                    title: "Too Many Attempts",
                    message: retryAfter
                        ? `You've made too many attempts. Please wait ${retryAfter} seconds before trying again.`
                        : "You've made too many attempts. Please wait a moment before trying again.",
                    actions: [
                        { label: "OK", onClick: () => { }, variant: "primary" }
                    ]
                });
            } else {
                setErrorModal({
                    title: "Something Went Wrong",
                    message: "An unexpected error occurred. Check your connection and try again.",
                    actions: [
                        { label: "Try Again", onClick: () => { }, variant: "primary" }
                    ]
                });
            }
        } finally {
            setIsSubmitting(false);
            onStop();
        }
    };

    const isOtpComplete = otp.every((d) => d !== "");

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full min-h-screen bg-[#FFF7E6] flex justify-center items-center py-10"
        >
            <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />

            {/* ── Step 1: Set new password modal ── */}
            {isSettingPassword && (
                <div className="fixed inset-0 bg-gray-900/40 z-10 backdrop-blur-sm flex justify-center items-center">
                    <div className="w-[90%] lg:w-[30%] bg-white rounded-3xl flex flex-col items-center font-body p-8 gap-6">
                        <h2 className="font-headline text-3xl font-semibold text-center">
                            Enter your new password
                        </h2>

                        <div className="w-full flex flex-col gap-4">
                            {/* New Password */}
                            <label className="flex flex-col gap-1">
                                <span className="font-medium text-sm">New Password</span>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        autoComplete="new-password"
                                        className="w-full h-10 px-4 pr-10 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((p) => !p)}
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </label>

                            {/* Confirm Password */}
                            <label className="flex flex-col gap-1">
                                <span className="font-medium text-sm">Confirm New Password</span>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        autoComplete="new-password"
                                        className="w-full h-10 px-4 pr-10 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((p) => !p)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c1c1c1] hover:text-[#8D4A52]"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </label>

                            {passwordError && (
                                <p className="text-xs text-red-500">{passwordError}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!newPassword || !confirmPassword}
                            onClick={handleSettingNewPassword}
                            className="w-[70%] h-12 text-lg bg-[#8D4A52] rounded-full text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Enter OTP ── */}
            <div className="w-[80%] lg:w-[35%] flex flex-col gap-4 items-center">
                {/* Brand */}
                <div className="text-center">
                    <div className="font-headline text-5xl text-[#0F1D29] font-semibold flex items-center justify-center gap-4">
                        <Icon height={4} width={4} />
                        ADA
                    </div>
                    <p className="font-label text-[#551E26] mt-2">Create. Sell. Track</p>
                </div>

                {/* Card */}
                <div className="w-full bg-white rounded-3xl flex flex-col items-center py-10 px-6 gap-6 font-body">
                    <div className="text-center flex flex-col gap-2">
                        <h1 className="font-headline text-4xl font-semibold">Reset your password</h1>
                        <p className="text-[#AB626A] text-sm">
                            We sent a 6-digit code to <span className="font-medium">{email}</span>.
                            Enter it below to confirm your password reset. It expires in 5 minutes.
                        </p>
                    </div>

                    {/* OTP Inputs */}
                    <div className="flex gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                aria-label={`OTP digit ${index + 1}`}
                                className="w-12 h-12 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA] text-center text-xl"
                            />
                        ))}
                    </div>

                    <Turnstile
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => setTurnstileToken(token)}
                    />

                    <button
                        type="button"
                        disabled={!isOtpComplete || isSubmitting || !turnstileToken}
                        onClick={handleResetPassword}
                        className="w-[70%] h-12 text-lg bg-[#8D4A52] rounded-full text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>

                    <button
                        type="button"
                        disabled={resendCooldown > 0 || !turnstileToken}
                        onClick={handleResendOtp}
                        className="text-sm text-[#8D4A52] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                    >
                        {resendCooldown > 0
                            ? `Resend code in ${resendCooldown}s`
                            : "Resend Code"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}