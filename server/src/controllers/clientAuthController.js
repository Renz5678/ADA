import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { models } from '../models/index.js';
import { validationResult } from 'express-validator';
import transporter from '../utils/mailer.js';
import { getVerificationEmailHtml } from '../utils/emailTemplates.js';

import { normalizeEmail } from '../utils/emailNormalization.js';
import { isSpammyName, isSpammyEmail } from '../utils/spamHeuristics.js';

const { Clients, Users } = models;

export const registerClient = async (req, res) => {
    if (process.env.ENABLE_REGISTRATION !== 'true') {
        return res.status(403).json({ message: 'Registration is currently paused. Please try again later.' });
    }
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Honeypot check
        if (req.body.phone_ext) {
            return res.status(200).json({ message: 'Client registered successfully!' }); // Fake success for bots
        }

        const { name, email, password, freelancer_id } = req.body;
        const normalized_email = normalizeEmail(email);

        // Verify freelancer exists if provided
        if (freelancer_id) {
            const freelancer = await Users.findByPk(freelancer_id);
            if (!freelancer) {
                return res.status(404).json({ message: 'Freelancer not found!' });
            }
        }

        const existingClient = await Clients.findOne({ where: { normalized_email } });
        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        if (existingClient) {
            if (!existingClient.is_verified) {
                existingClient.verification_token = verification_token;
                existingClient.otp_expires_at = otp_expires_at;
                await existingClient.save();

                await transporter.sendMail({
                    to: existingClient.email,
                    subject: 'OTP Verification for ADA Client Account',
                    text: `Good day, ${existingClient.name}! Here is your OTP for your ADA account creation verification: ${verification_token}. Make sure to not share this OTP to anyone. This code will expire in 5 minutes. (Please also check your spam folder.)`,
                    html: getVerificationEmailHtml(existingClient.name, verification_token)
                });

                return res.status(200).json({ message: 'OTP resent!' });
            }
            return res.status(409).json({ message: 'Email already in use!' });
        }

        const isSpammy = isSpammyName(name) || isSpammyEmail(email);

        if (isSpammy) {
            return res.status(400).json({ message: 'Registration blocked: Your email or name has been flagged as spam.' });
        }

        const newClient = await Clients.create({
            name,
            email,
            normalized_email,
            password,
            freelancer_id: freelancer_id || null,
            is_verified: false,
            verification_token,
            otp_expires_at,
            flaggedForReview: false
        });

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Client Account Verification Code',
            text: `Hi ${name},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email. (Please also check your spam folder.)\n\nBest regards,\nThe ADA Team`,
            html: getVerificationEmailHtml(name, verification_token)
        });

        return res.status(201).json({ message: 'Client registered successfully!', client: newClient });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const loginClient = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const client = await Clients.findOne({ where: { email } });
        if (!client) return res.status(401).json({ message: 'Invalid credentials!' });
        if (!client.is_verified) return res.status(403).json({ message: 'Account is not yet verified!' });

        const isPasswordCorrect = await bcrypt.compare(password, client.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials!' });

        const token = jwt.sign(
            {
                id: client.client_id,
                email: client.email,
                role: 'client'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.cookie('client_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ message: 'Login valid!' });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const otp = req.body.verification_token;

        const client = await Clients.findOne({
            where: {
                email: email,
                verification_token: otp
            }
        });

        if (!client) return res.status(404).json({ message: 'Email not found or wrong verification code!' });

        if (client.otp_expires_at < new Date()) return res.status(400).json({ message: 'OTP has expired!' });

        client.is_verified = true;
        client.verification_token = null;
        client.otp_expires_at = null;

        await client.save();

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Client Account Has Been Verified',
            text: `Hi ${client.name},\n\nYour account has been successfully verified. You can now log in and start using ADA.\n\nIf you did not create this account, please contact our support team immediately.\n\nBest regards,\nThe ADA Team`
        });

        const token = jwt.sign(
            { id: client.client_id, email: client.email, isClient: true },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.cookie('client_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ message: 'Account verified!' });
    } catch (error) {
        console.error('Error in controller:', error);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const client = await Clients.findOne({
            where: {
                email: email,
                is_verified: false
            }
        });

        if (!client) return res.status(404).json({ message: 'Email not found or wrong verification code!' });

        client.verification_token = verification_token;
        client.otp_expires_at = otp_expires_at;

        await client.save();

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Client Account Verification Code',
            text: `Hi ${client.name},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email. (Please also check your spam folder.)\n\nBest regards,\nThe ADA Team`,
            html: getVerificationEmailHtml(client.name, verification_token)
        });

        return res.status(200).json({ message: 'New OTP sent!' });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const googleLoginClient = async (req, res) => {
    try {
        const { token, freelancer_id } = req.body;
        
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!userInfoRes.ok) {
            return res.status(401).json({ message: 'Invalid Google Token' });
        }
        
        const payload = await userInfoRes.json();
        const { email, name } = payload;

        let clientResult = await Clients.findOne({ where: { email } });

        if (!clientResult) {
            if (process.env.NODE_ENV !== 'test') {
                return res.status(403).json({ message: 'Registration is currently paused. Please try again later.' });
            }
            clientResult = await Clients.create({
                name: name,
                email: email,
                password: crypto.randomBytes(16).toString('hex'),
                freelancer_id: freelancer_id || null,
                is_verified: true,
                verification_token: null,
                otp_expires_at: null
            });
        } else if (!clientResult.is_verified) {
            clientResult.is_verified = true;
            await clientResult.save();
        }

        const jwtToken = jwt.sign(
            { id: clientResult.client_id, email: clientResult.email, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.cookie('client_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({ message: 'Login valid!' });
    } catch (e) {
        console.error(e);
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export const me = async (req, res) => {
    // Relies on clientAuthMiddleware to verify token and populate req.client
    if (!req.client) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(200).json({ client: req.client });
};

export const logout = async (req, res) => {
    res.clearCookie('client_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    return res.status(200).json({ message: 'Logged out successfully' });
};
