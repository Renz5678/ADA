import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { models } from '../models/index.js';
import transporter from '../utils/mailer.js';

const { Users } = models;

const register = async (req, res) => {
    try {
        const verification_token = crypto.randomInt(100000, 999999).toString();
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const { username, email, password } = req.body;

        const userResult = await Users.findOne({
            where: { email }
        })

        if (userResult !== null) {
            if (!userResult.is_verified || userResult.otp_expires_at < new Date()) {
                userResult.verification_token = verification_token;
                userResult.otp_expires_at = otp_expires_at;
                await userResult.save();

                await transporter.sendMail({
                    to: email,
                    subject: 'OTP Verification for ADA Account Registration',
                    text: `Good day, ${username}! Here is your OTP for your ADA account creation verification: ${verification_token}. Make sure to not share this OTP to anyone. This code will expire in 5 minutes.`
                });


                return res.status(200).json({ message: 'OTP resent!' });
            }

            return res.status(409).json({ message: 'Email already in use!' });
        }

        const newUser = await Users.create({
            username,
            email,
            password,
            verification_token,
            otp_expires_at
        });

        await transporter.sendMail({
            to: email,
            subject: 'Your ADA Account Verification Code',
            text: `Hi ${username},\n\nThank you for registering with ADA. Use the OTP below to verify your account:\n\n${verification_token}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe ADA Team`
        });

        return res.status(201).json({ message: 'New User Created Successfully!', user: newUser });
    }
    catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
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
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        )

        return res.status(200).json({ message: 'Login valid!', token: token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

export { register, login };