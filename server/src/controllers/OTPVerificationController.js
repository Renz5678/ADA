import { models } from "../models/index.js";
import transporter from "../utils/mailer.js";
import crypto from 'crypto';

const { Users } = models;

const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.verification_token;

        const user = await Users.findOne({
            where: {
                email: email,
                verification_token: otp
            }
        });

        if (!user) return res.status(404).json({ message: 'Email not found or wrong verification code!' });

        if (user.otp_expires_at < new Date()) return res.status(400).json({ message: 'OTP has expired!' });

        user.is_verified = true;
        user.verification_token = null;
        user.otp_expires_at = null;

        await user.save();

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Account Has Been Verified',
            text: `Hi ${user.username},\n\nYour account has been successfully verified. You can now log in and start using ADA.\n\nIf you did not create this account, please contact our support team immediately.\n\nBest regards,\nThe ADA Team`
        });

        return res.status(200).json({ message: 'Account verified!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const user = await Users.findOne({
            where: {
                email: email,
                is_verified: false
            }
        });

        if (!user) return res.status(404).json({ message: 'Email not found or wrong verification code!' });

        user.verification_token = verification_token;
        user.otp_expires_at = otp_expires_at;

        await user.save();

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Account Verification Code',
            text: `Hi ${user.username},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe ADA Team`
        });

        return res.status(200).json({ message: 'New OTP sent!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export { verifyOtp, resendOtp };