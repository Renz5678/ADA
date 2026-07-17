import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let transporter;

if (process.env.NODE_ENV === 'test') {
    transporter = {
        sendMail: async () => {
            // Mock email sending for tests
            return true;
        }
    };
} else {
    transporter = {
        sendMail: async ({ to, subject, text, html }) => {
            const msg = {
                to,
                from: process.env.EMAIL_USER || 'ada.freelance.help@gmail.com', // Must match verified sender
                subject,
                text,
                html
            };
            return await sgMail.send(msg);
        }
    };
}

export default transporter;