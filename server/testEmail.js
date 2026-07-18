import 'dotenv/config';
import transporter from './src/utils/mailer.js';

const testEmail = async () => {
    try {
        console.log('Sending test email to ada.freelance.help@gmail.com...');
        const info = await transporter.sendMail({
            to: 'ada.freelance.help@gmail.com', // Sending to themselves
            subject: 'ADA System Test',
            text: 'This is a test email to verify that the ADA mailer is functioning correctly.',
            html: '<h1>ADA System Test</h1><p>Your email system is functioning correctly.</p>'
        });
        console.log('Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending test email:', error);
    }
};

testEmail();
