import cron from 'node-cron';
import { Op } from 'sequelize';
import { models } from '../models/index.js';
import transporter from './mailer.js';
import { getVerificationEmailHtml } from './emailTemplates.js';

const { Users, Clients } = models;

export const pruneUnverifiedAccounts = async () => {
    try {
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // --- USERS (Freelancers) ---
        // 1. Delete users older than 48 hours who actually went through the OTP flow
        const usersToDelete = await Users.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                createdAt: {
                    [Op.lt]: fortyEightHoursAgo
                }
            }
        });

        for (const user of usersToDelete) {
            await user.destroy();
            console.log(`Deleted unverified user: ${user.email}`);
        }

        // 2. Send reminders to users between 24 and 48 hours old
        const usersToRemind = await Users.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                createdAt: {
                    [Op.gte]: fortyEightHoursAgo,
                    [Op.lt]: twentyFourHoursAgo
                }
            }
        });

        for (const user of usersToRemind) {
            await transporter.sendMail({
                to: user.email,
                subject: 'Reminder: Complete Your ADA Registration',
                text: `Hi ${user.username},\n\nThis is a reminder that your ADA account is not yet verified. Please use your verification code: ${user.verification_token} to verify your account.\n\nUnverified accounts are automatically deleted after 48 hours.\n\nBest regards,\nThe ADA Team`,
                html: getVerificationEmailHtml(user.username, user.verification_token)
            });
            console.log(`Sent reminder to user: ${user.email}`);
        }

        // --- CLIENTS ---
        // 1. Delete clients older than 48 hours who actually went through the OTP flow
        const clientsToDelete = await Clients.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                createdAt: {
                    [Op.lt]: fortyEightHoursAgo
                }
            }
        });

        for (const client of clientsToDelete) {
            await client.destroy();
            console.log(`Deleted unverified client: ${client.email}`);
        }

        // 2. Send reminders to clients between 24 and 48 hours old
        const clientsToRemind = await Clients.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                createdAt: {
                    [Op.gte]: fortyEightHoursAgo,
                    [Op.lt]: twentyFourHoursAgo
                }
            }
        });

        for (const client of clientsToRemind) {
            await transporter.sendMail({
                to: client.email,
                subject: 'Reminder: Complete Your ADA Client Registration',
                text: `Hi ${client.name},\n\nThis is a reminder that your ADA client account is not yet verified. Please use your verification code: ${client.verification_token} to verify your account.\n\nUnverified accounts are automatically deleted after 48 hours.\n\nBest regards,\nThe ADA Team`,
                html: getVerificationEmailHtml(client.name, client.verification_token)
            });
            console.log(`Sent reminder to client: ${client.email}`);
        }

    } catch (error) {
        console.error('Error pruning unverified accounts:', error);
    }
};

// Run daily at midnight
export const startPruningJob = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('Running unverified account pruning job...');
        pruneUnverifiedAccounts();
    });
};
