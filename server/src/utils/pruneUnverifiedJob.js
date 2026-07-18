import cron from 'node-cron';
import { Op } from 'sequelize';
import { models } from '../models/index.js';

const { Users, Clients } = models;

export const pruneUnverifiedAccounts = async () => {
    try {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        // --- USERS (Freelancers) ---
        // Delete users who abandoned signup and haven't interacted for 10 minutes
        const usersToDelete = await Users.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                updatedAt: {
                    [Op.lt]: tenMinutesAgo
                }
            }
        });

        for (const user of usersToDelete) {
            await user.destroy();
            console.log(`Deleted abandoned user signup: ${user.email}`);
        }

        // --- CLIENTS ---
        // Delete clients who abandoned signup and haven't interacted for 10 minutes
        const clientsToDelete = await Clients.findAll({
            where: {
                is_verified: false,
                verification_token: { [Op.ne]: null }, // SAFEGUARD: Protect legacy accounts
                updatedAt: {
                    [Op.lt]: tenMinutesAgo
                }
            }
        });

        for (const client of clientsToDelete) {
            await client.destroy();
            console.log(`Deleted abandoned client signup: ${client.email}`);
        }

    } catch (error) {
        console.error('Error pruning unverified accounts:', error);
    }
};

// Run every 5 minutes
export const startPruningJob = () => {
    cron.schedule('*/5 * * * *', () => {
        console.log('Running abandoned account pruning job...');
        pruneUnverifiedAccounts();
    });
};
