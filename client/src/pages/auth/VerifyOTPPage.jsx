import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Icon from "#components/ui/Icon.jsx";
import { verifyOtp, resendOtp } from "#api/auth.js";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOTPPage() {
    const { state } = useLocation();
    const email = state?.email;
    const navigate = useNavigate();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputs = useRef([]);

    useEffect(() => {
        if (!email) navigate("/signup", { replace: true });
    }, [email, navigate]);

    // Cooldown countdown timer
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
        setError("");

        if (value && index < OTP_LENGTH - 1) focusInput(index + 1);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    // Handle paste — fills all boxes from clipboard
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

    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            setError("Please enter the complete 6-digit code.");
            return;
        }

        setIsVerifying(true);
        try {
            await verifyOtp({ email, verification_token: code });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Please try again.");
            setOtp(Array(OTP_LENGTH).fill(""));
            focusInput(0);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        try {
            await resendOtp({ email });
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend code. Try again.");
        }
    };

    const isComplete = otp.every((d) => d !== "");

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
                    <p className="font-label text-[#551E26] mt-2">Create. Sell. Track</p>
                </div>

                {/* Card */}
                <div className="w-full bg-white rounded-3xl flex flex-col items-center py-10 px-6 gap-6 font-body">
                    <div className="text-center flex flex-col gap-2">
                        <h1 className="font-headline text-4xl font-semibold">Verify your account</h1>
                        <p className="text-[#AB626A] text-sm">
                            We sent a 6-digit code to <span className="font-medium">{email}</span>.
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
                                className="w-12 h-12 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA] text-center text-xl"
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 -mt-2 text-center">{error}</p>
                    )}

                    <button
                        type="button"
                        disabled={!isComplete || isVerifying}
                        onClick={handleVerifyOtp}
                        className="w-[70%] h-12 text-lg bg-[#8D4A52] rounded-full text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? "Verifying..." : "Verify Account"}
                    </button>

                    {/* Resend */}
                    <button
                        type="button"
                        disabled={resendCooldown > 0}
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