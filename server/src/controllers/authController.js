import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { models } from '../models/index.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import transporter from '../utils/mailer.js';
import { getVerificationEmailHtml } from '../utils/emailTemplates.js';
import { normalizeEmail } from '../utils/emailNormalization.js';
import { isSpammyName, isSpammyEmail } from '../utils/spamHeuristics.js';
import { validationResult } from 'express-validator';

const { Users } = models;

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Honeypot check
        if (req.body.phone_ext) {
            return res.status(200).json({ message: 'New User Created Successfully!' }); // Fake success for bots
        }

        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const { username, business_name, email, password } = req.body;
        const normalized_email = normalizeEmail(email);

        const userResult = await Users.findOne({
            where: { normalized_email }
        });

        if (userResult !== null) {
            if (!userResult.is_verified) {
                userResult.verification_token = verification_token;
                userResult.otp_expires_at = otp_expires_at;
                await userResult.save();

                await transporter.sendMail({
                    to: userResult.email,
                    subject: 'OTP Verification for ADA Account Registration',
                    text: `Good day, ${userResult.username}! Here is your OTP for your ADA account creation verification: ${verification_token}. Make sure to not share this OTP to anyone. This code will expire in 5 minutes. (Please also check your spam folder.)`,
                    html: getVerificationEmailHtml(userResult.username, verification_token)
                });

                return res.status(200).json({ message: 'OTP resent!' });
            }

            return res.status(409).json({ message: 'Email already in use!' });
        }

        const flaggedForReview = isSpammyName(username) || isSpammyName(business_name) || isSpammyEmail(email);

        const newUser = await Users.create({
            username,
            business_name,
            email,
            normalized_email,
            password,
            verification_token,
            otp_expires_at,
            flaggedForReview
        });

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Account Verification Code',
            text: `Hi ${username},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email. (Please also check your spam folder.)\n\nBest regards,\nThe ADA Team`,
            html: getVerificationEmailHtml(username, verification_token)
        });

        return res.status(201).json({ message: 'New User Created Successfully!', user: newUser });
    }
    catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const userResult = await Users.findOne({
            where: { email }
        });

        if (userResult === null) return res.status(401).json({ message: 'Invalid credentials!' });
        if (!userResult.is_verified) return res.status(403).json({ message: 'Account is not yet verified!' });

        const isPasswordCorrect = await bcrypt.compare(password, userResult.password);

        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials!' });

        const token = jwt.sign(
            {
                id: userResult.user_id,
                email: userResult.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            }
        )

        return res.status(200).json({ message: 'Login valid!', token: token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

const verifyOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

        transporter.sendMail({
            to: email,
            subject: 'Your ADA Account Has Been Verified',
            text: `Hi ${user.username},\n\nYour account has been successfully verified. You can now log in and start using ADA.\n\nIf you did not create this account, please contact our support team immediately.\n\nBest regards,\nThe ADA Team`
        }).catch(err => console.error('Failed to send verification email:', err));

        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        return res.status(200).json({ message: 'Account verified!', token: token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
            text: `Hi ${user.username},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email. (Please also check your spam folder.)\n\nBest regards,\nThe ADA Team`,
            html: getVerificationEmailHtml(user.username, verification_token)
        });

        return res.status(200).json({ message: 'New OTP sent!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const user = await Users.findOne({
            where: {
                email: email,
                is_verified: true
            }
        });

        if (!user) return res.status(404).json({ message: 'Account not found!' });

        user.verification_token = verification_token;
        user.otp_expires_at = otp_expires_at;

        await user.save();
        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Password Reset Code',
            text: `Hi ${user.username},\n\nWe received a request to reset your ADA account password. Use the OTP below to proceed:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request a password reset, please ignore this email and your account will remain secure. (Please also check your spam folder.)\n\nBest regards,\nThe ADA Team`,
            html: getVerificationEmailHtml(user.username, verification_token)
        });

        return res.status(200).json({ message: 'OTP for password reset sent!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const confirmResetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const verification_token = req.body.verification_token;
        const newPassword = req.body.password;

        const user = await Users.findOne({
            where: {
                email: email,
                verification_token: verification_token,
            }
        });

        if (!user) return res.status(404).json({ message: 'Account not existing or invalid OTP!' });
        if (user.otp_expires_at < new Date()) return res.status(400).json({ message: 'OTP Expired!' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.verification_token = null;
        user.otp_expires_at = null;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!userInfoRes.ok) {
            return res.status(401).json({ message: 'Invalid Google Token' });
        }
        
        const payload = await userInfoRes.json();
        const { email, name } = payload;

        let userResult = await Users.findOne({ where: { email } });

        if (!userResult) {
            userResult = await Users.create({
                username: name,
                business_name: 'My Business',
                email: email,
                password: crypto.randomBytes(16).toString('hex'),
                is_verified: true,
                verification_token: null,
                otp_expires_at: null
            });
        } else if (!userResult.is_verified) {
            userResult.is_verified = true;
            await userResult.save();
        }

        const jwtToken = jwt.sign(
            { id: userResult.user_id, email: userResult.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        return res.status(200).json({ message: 'Login valid!', token: jwtToken });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export { register, login, verifyOtp, resendOtp, resetPassword, confirmResetPassword, googleLogin };