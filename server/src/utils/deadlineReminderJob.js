import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import transporter from './mailer.js';
import { getDeadlineReminderHtml } from './emailTemplates.js';

const { Orders, Users, Notifications } = models;

const startDeadlineReminderJob = () => {
    // Run at 8am daily
    cron.schedule('0 8 * * *', async () => {
        console.log('[DeadlineJob] Running deadline reminder job...');
        let sent = 0;
        let failed = 0;

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const inTwoDays = new Date(today);
            inTwoDays.setDate(today.getDate() + 2);

            const todayStr = today.toISOString().split('T')[0];
            const inTwoDaysStr = inTwoDays.toISOString().split('T')[0];

            const dueOrders = await Orders.findAll({
                where: {
                    status: { [Op.notIn]: ['Done', 'Delivered', 'Cancelled'] },
                    deadline: {
                        [Op.and]: [
                            { [Op.ne]: null },
                            { [Op.between]: [todayStr, inTwoDaysStr] }
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
                console.log('[DeadlineJob] No orders due in the next 2 days. Exiting.');
                return;
            }

            console.log(`[DeadlineJob] Found ${dueOrders.length} due order(s). Grouping by user...`);

            // Group by user
            const ordersByUser = dueOrders.reduce((acc, order) => {
                const userId = order.user_id;
                if (!acc[userId]) {
                    acc[userId] = { user: order.User, orders: [] };
                }
                acc[userId].orders.push(order);
                return acc;
            }, {});

            for (const userId in ordersByUser) {
                const { user, orders } = ordersByUser[userId];

                if (!user?.email) {
                    console.warn(`[DeadlineJob] User ${userId} has no email address. Skipping.`);
                    failed++;
                    continue;
                }

                // Build plain text fallback
                let textContent = `Hello ${user.username},\n\nHere are your upcoming tasks due soon:\n\n`;
                orders.forEach(o => {
                    textContent += `- Order #${o.order_id} is due on ${o.deadline} (Total: \u20b1${o.total_amount})\n`;
                });
                textContent += `\nPlease check your ADA Dashboard for more details.\n\nBest,\nThe ADA Team`;

                // Each email is wrapped independently so one failure doesn't abort the batch
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: 'ADA \u2014 Upcoming Deadlines Reminder',
                        text: textContent,
                        html: getDeadlineReminderHtml(user.username, orders)
                    });
                    
                    // Create in-app notification
                    await Notifications.create({
                        user_id: userId,
                        title: 'Upcoming Deadlines',
                        message: `You have ${orders.length} order(s) due soon.`,
                        type: 'DEADLINE',
                        reference_type: 'ORDER',
                        reference_id: orders.length === 1 ? orders[0].order_id : null
                    });

                    console.log(`[DeadlineJob] \u2713 Sent reminder to ${user.email} (${orders.length} order(s))`);
                    sent++;
                } catch (emailErr) {
                    console.error(`[DeadlineJob] \u2717 Failed to send to ${user.email}:`, emailErr.message);
                    failed++;
                }
            }

        } catch (error) {
            console.error('[DeadlineJob] Fatal error during job execution:', error);
        } finally {
            console.log(`[DeadlineJob] Complete. Sent: ${sent}, Failed: ${failed}`);
        }
    });
};

export default startDeadlineReminderJob;
