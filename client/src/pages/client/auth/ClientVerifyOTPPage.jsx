import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Icon from "#components/ui/Icon.jsx";
import ErrorModal from "#components/ui/ErrorModal.jsx";
import { verifyClientOtp, resendClientOtp } from "#api/clientEndpoints.js";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function ClientVerifyOTPPage({ onStart, onStop }) {
    const { state } = useLocation();
    const email = state?.email;
    const navigate = useNavigate();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [errorModal, setErrorModal] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputs = useRef([]);

    useEffect(() => {
        if (!email) navigate("/register-client", { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    if (!email) return null;

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

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        onStart("Sending a new code...");
        try {
            await resendClientOtp({ email });
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

    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) return;

        setIsVerifying(true);
        onStart("Verifying your code...");
        try {
            const res = await verifyClientOtp({ email, verification_token: code });
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                navigate("/client/dashboard");
            } else {
                navigate("/login-client");
            }
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
                        { label: "Go Back", onClick: () => navigate("/register-client"), variant: "secondary" }
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
            setIsVerifying(false);
            onStop();
        }
    };

    const isComplete = otp.every((d) => d !== "");

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full min-h-[100dvh] bg-[#FFF7E6] flex justify-center items-center py-10 pb-24 md:pb-10"
        >
            <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />

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
                <div className="w-full bg-[#1A2B3C] border border-gray-700 rounded-3xl flex flex-col items-center py-10 px-6 gap-6 font-body shadow-xl text-gray-200">
                    <div className="text-center flex flex-col gap-2">
                        <h1 className="font-headline text-4xl font-semibold text-white">Verify your account</h1>
                        <p className="text-gray-400 text-sm">
                            We sent a 6-digit code to <span className="font-medium text-white">{email}</span>.
                            It expires in 5 minutes.
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
                                className="w-12 h-12 bg-[#0F1D29] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#E57A44] text-center text-xl"
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        disabled={!isComplete || isVerifying}
                        onClick={handleVerifyOtp}
                        className="w-[70%] h-12 text-lg bg-[#E57A44] rounded-full text-white font-bold hover:bg-[#D46933] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isVerifying ? "Verifying..." : "Verify Account"}
                    </button>

                    <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={handleResendOtp}
                        className="text-sm text-[#E57A44] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
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