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
    // Create the secure SMTP transport for Gmail
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    transporter = {
        sendMail: async ({ to, subject, text, html }) => {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'ada.freelance.help@gmail.com',
                to,
                subject,
                text,
                html
            };
            return await smtpTransport.sendMail(mailOptions);
        }
    };
}

export default transporter;