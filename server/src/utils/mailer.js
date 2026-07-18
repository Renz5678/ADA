import axios from 'axios';
import dotenv from 'dotenv';

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
    transporter = {
        sendMail: async ({ to, subject, text, html }) => {
            const payload = {
                sender: {
                    name: "ADA Freelance Help",
                    email: process.env.EMAIL_USER || 'ada.freelance.help@gmail.com'
                },
                to: [
                    { email: to }
                ],
                subject: subject,
                htmlContent: html,
                textContent: text
            };

            // Using Brevo HTTP API to completely bypass Render's SMTP Port firewall
            return await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            });
        }
    };
}

export default transporter;