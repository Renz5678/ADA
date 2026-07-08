import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import transporter from './mailer.js';
import { getScheduleReminderHtml } from './emailTemplates.js';

const { Users, WeeklyAvailability, Tasks, Notifications } = models;

export const runScheduleCheck = async (currentTime = new Date()) => {
    try {
        // Calculate the target time: exactly 5 minutes from the provided current time
        const targetDate = new Date(currentTime.getTime() + 5 * 60000);
        
        const todayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
        const hours = targetDate.getHours().toString().padStart(2, '0');
        const minutes = targetDate.getMinutes().toString().padStart(2, '0');
        const targetTimeStr = `${hours}:${minutes}`;

        // Find all "Free Time" blocks starting at this exact HH:mm on this day of the week
        const startingBlocks = await WeeklyAvailability.findAll({
            where: {
                day_of_week: todayName,
                start_time: targetTimeStr,
                block_type: 'Free'
            },
            include: [{
                model: Users,
                attributes: ['user_id', 'email', 'username']
            }]
        });

        if (!startingBlocks.length) {
            return { sent: 0, failed: 0 };
        }

        let sent = 0;
        let failed = 0;

        for (const block of startingBlocks) {
            const user = block.User;
            if (!user || !user.email) continue;

            // Fetch top active task for this user
            const topTask = await Tasks.findOne({
                where: {
                    user_id: user.user_id,
                    status: { [Op.notIn]: ['Done', 'Cancelled'] }
                },
                order: [['priority_score', 'DESC'], ['deadline', 'ASC']]
            });

            if (!topTask) continue;

            // Send Email
            try {
                const textContent = `Hello ${user.username},\n\nYour scheduled work block is starting in 5 minutes (${targetTimeStr}). Based on your priorities, we suggest you focus on: ${topTask.title}\n\nBest,\nThe ADA Team`;
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'ADA \u2014 Your Scheduled Block Starts Soon',
                    text: textContent,
                    html: getScheduleReminderHtml(user.username, topTask.title, targetTimeStr)
                });
                
                // Create In-App Notification
                await Notifications.create({
                    user_id: user.user_id,
                    title: 'Schedule Reminder',
                    message: `Your block starts at ${targetTimeStr}. Suggested focus: ${topTask.title}`,
                    type: 'SYSTEM',
                    reference_type: 'TASK',
                    reference_id: topTask.task_id
                });

                console.log(`[ScheduleJob] \u2713 Sent schedule reminder to ${user.email}`);
                sent++;
            } catch (err) {
                console.error(`[ScheduleJob] \u2717 Failed to send to ${user.email}:`, err.message);
                failed++;
            }
        }
        
        return { sent, failed };
    } catch (error) {
        console.error('[ScheduleJob] Fatal error during job execution:', error);
        return { sent: 0, failed: 0 };
    }
};

const startScheduleReminderJob = () => {
    // Run every single minute
    cron.schedule('* * * * *', async () => {
        await runScheduleCheck(new Date());
    });
};

export default startScheduleReminderJob;
