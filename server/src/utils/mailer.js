import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

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
            const oauth2Client = new OAuth2(
                process.env.GMAIL_CLIENT_ID,
                process.env.GMAIL_CLIENT_SECRET,
                "https://developers.google.com/oauthplayground"
            );

            oauth2Client.setCredentials({
                refresh_token: process.env.GMAIL_REFRESH_TOKEN
            });

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
            const messageParts = [
                `From: ADA Freelance Help <${process.env.EMAIL_USER || 'ada.freelance.help@gmail.com'}>`,
                `To: ${to}`,
                'Content-Type: text/html; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: ${utf8Subject}`,
                '',
                html || text
            ];
            const message = messageParts.join('\n');

            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            return await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                },
            });
        }
    };
}

export default transporter;