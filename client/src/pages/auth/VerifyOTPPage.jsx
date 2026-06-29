import { verifyOtp, resendOtp } from "#api/auth.js";
import Icon from "#components/ui/Icon.jsx";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const inputs = useRef([]);

    const { state } = useLocation();
    const email = state?.email;

    const navigate = useNavigate();

    const handleChange = (value, index) => {
        // Only allow digits
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move back when pressing Backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await verifyOtp({
                email,
                verification_token: otp.join("")
            });
            navigate('/login');
        } catch (e) {
            console.error(e.response?.data?.message || "Verification failed");
        }
    }

    const handleResendOtp = async () => {
        try {
            const res = await resendOtp({
                email
            });
        } catch (e) {
            console.error(e.response?.data?.message || "Resend failed");
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

                    <div className="w-full bg-white h-[65%] rounded-3xl flex flex-col justify-center items-center font-body p-6 gap-6">
                        <div className="font-headline text-4xl font-semibold">Verify your account</div>
                        <div className="font-body text-[#AB626A] text-md text-center">We've sent an OTP to {email}. Enter it here to verify your account. This OTP will expire in 5 minutes</div>
                        <div className="flex gap-2">
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
                                    className="w-12 h-12 border border-[#c1c1c1] rounded-lg focus:outline-[#CBA0AA] text-center text-xl"
                                />
                            ))}
                        </div>

                        <button
                            className="w-[70%] h-14 text-xl bg-[#8D4A52] rounded-4xl text-white font-medium hover:bg-[#0F1D29] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            onClick={handleVerifyOtp}
                        >
                            Login
                        </button>

                        <div className="text-md text-[#8D4A52] font-medium cursor-pointer" onClick={() => { handleResendOtp() }}>Resend Code</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}