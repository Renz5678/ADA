import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

let transporter;

if (process.env.NODE_ENV === 'test') {
    transporter = {
        sendMail: async () => {
            // Mock email sending for tests
            return true;
        }
    };
} else {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

export default transporter;