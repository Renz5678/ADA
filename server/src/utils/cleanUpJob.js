import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';

const { Users } = models;

const startCleanUpJob = () => {
    cron.schedule('*/10 * * * *', async () => {
        await Users.destroy({
            where: {
                is_verified: false,
                createdAt: {
                    [Op.lt]: new Date(Date.now() - 60 * 60 * 1000)
                }
            }
        });
    })
};

export default startCleanUpJob;