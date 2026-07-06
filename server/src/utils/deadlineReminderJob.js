import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import transporter from './mailer.js';

const { Orders, Users } = models;

const startDeadlineReminderJob = () => {
    // Run at 8am daily
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('Running deadline reminder job...');
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const inTwoDays = new Date(today);
            inTwoDays.setDate(today.getDate() + 2);

            const dueOrders = await Orders.findAll({
                where: {
                    status: { [Op.notIn]: ['Done', 'Delivered', 'Cancelled'] },
                    deadline: {
                        [Op.and]: [
                            { [Op.ne]: null },
                            { [Op.between]: [today.toISOString().split('T')[0], inTwoDays.toISOString().split('T')[0]] }
                        ]
                    }
                },
                include: [{
                    model: Users,
                    attributes: ['email', 'username']
                }],
                order: [['user_id', 'ASC'], ['deadline', 'ASC']]
            });

            if (!dueOrders.length) {
                console.log('No due tasks found.');
                return;
            }

            // Group by user
            const ordersByUser = dueOrders.reduce((acc, order) => {
                const userId = order.user_id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: order.User, // Order belongsTo Users
                        orders: []
                    };
                }
                acc[userId].orders.push(order);
                return acc;
            }, {});

            for (const userId in ordersByUser) {
                const { user, orders } = ordersByUser[userId];
                
                if (!user || !user.email) continue;

                let textContent = `Hello ${user.username},\n\nHere are your upcoming tasks that are due soon:\n\n`;
                orders.forEach(o => {
                    textContent += `- Order #${o.order_id} is due on ${o.deadline} (Total: ₱${o.total_amount})\n`;
                });
                textContent += `\nPlease check your ADA Dashboard for more details.\n\nBest,\nADA Team`;

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'ADA - Upcoming Deadlines Reminder',
                    text: textContent
                });
            }

            console.log('Deadline reminder job completed.');
        } catch (error) {
            console.error('Error running deadline reminder job:', error);
        }
    });
};

export default startDeadlineReminderJob;
