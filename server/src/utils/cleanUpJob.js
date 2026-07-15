import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const { Users, PendingOrders } = models;

const startCleanUpJob = () => {
    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        // Remove unverified users older than 1 hour
        await Users.destroy({
            where: {
                is_verified: false,
                createdAt: {
                    [Op.lt]: new Date(Date.now() - 60 * 60 * 1000)
                }
            }
        });

        // Remove expired PendingOrders (older than 48h TTL)
        await PendingOrders.destroy({
            where: {
                expires_at: {
                    [Op.lt]: new Date()
                }
            }
        });
    });
};

export default startCleanUpJob;