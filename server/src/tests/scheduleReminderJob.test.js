import { runScheduleCheck } from '../utils/scheduleReminderJob.js';
import { models, sequelize } from '../models/index.js';
import transporter from '../utils/mailer.js';

const { Users, WeeklyAvailability, Tasks, Orders, Notifications } = models;

describe('Schedule Reminder Job', () => {
    let testUser;
    let testOrder;
    let testTask;


    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });



    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(transporter, 'sendMail').mockResolvedValue(true);

        testUser = await Users.create({
            username: 'test_scheduler',
            email: 'test_scheduler@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Test Business',
            is_verified: true
        });

        testOrder = await Orders.create({
            user_id: testUser.user_id,
            total_amount: 100,
            status: 'Pending',
            order_date: '2026-07-08'
        });

        testTask = await Tasks.create({
            user_id: testUser.user_id,
            related_order_id: testOrder.order_id,
            title: 'Fulfill Order #1',
            status: 'Not Started',
            priority_score: 10,
            deadline: '2026-07-10'
        });
    });

    afterEach(async () => {
        await Notifications.destroy({ where: {} });
        await Tasks.destroy({ where: {} });
        await Orders.destroy({ where: {} });
        await WeeklyAvailability.destroy({ where: {} });
        await Users.destroy({ where: {} });
    });

    it('should send an email and notification 5 minutes before a Free Time block', async () => {
        // Set up the fake current time
        const now = new Date('2026-07-08T09:00:00.000Z');
        
        // Target time is exactly 5 minutes ahead (09:05)
        const targetDate = new Date(now.getTime() + 5 * 60000);
        const todayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
        const targetTimeStr = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;

        // Create the availability block
        await WeeklyAvailability.create({
            user_id: testUser.user_id,
            day_of_week: todayName,
            start_time: targetTimeStr,
            end_time: '12:00',
            block_type: 'Free'
        });

        // Run the job
        const result = await runScheduleCheck(now);

        expect(result.sent).toBe(1);
        expect(result.failed).toBe(0);

        // Verify mailer was called
        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        const mailArgs = transporter.sendMail.mock.calls[0][0];
        expect(mailArgs.to).toBe('test_scheduler@example.com');
        expect(mailArgs.subject).toContain('Your Scheduled Block Starts Soon');
        expect(mailArgs.html).toContain('Fulfill Order #1');
        expect(mailArgs.html).toContain(targetTimeStr);

        // Verify in-app notification
        const notif = await Notifications.findOne({ where: { user_id: testUser.user_id } });
        expect(notif).toBeTruthy();
        expect(notif.title).toBe('Schedule Reminder');
        expect(notif.message).toContain(targetTimeStr);
        expect(notif.message).toContain('Fulfill Order #1');
    });

    it('should do nothing if there is no block in exactly 5 minutes', async () => {
        const now = new Date('2026-07-08T09:00:00.000Z');
        const targetDate = new Date(now.getTime() + 6 * 60000); // 6 mins ahead
        const todayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
        const targetTimeStr = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;

        await WeeklyAvailability.create({
            user_id: testUser.user_id,
            day_of_week: todayName,
            start_time: targetTimeStr, // 6 minutes from now, not 5
            end_time: '12:00',
            block_type: 'Free'
        });

        const result = await runScheduleCheck(now);
        expect(result.sent).toBe(0);
        expect(transporter.sendMail).not.toHaveBeenCalled();
    });

    it('should do nothing if the user has a block but no active tasks', async () => {
        // Complete the task
        await testTask.update({ status: 'Done' });

        const now = new Date('2026-07-08T09:00:00.000Z');
        const targetDate = new Date(now.getTime() + 5 * 60000);
        const todayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
        const targetTimeStr = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;

        await WeeklyAvailability.create({
            user_id: testUser.user_id,
            day_of_week: todayName,
            start_time: targetTimeStr,
            end_time: '12:00',
            block_type: 'Free'
        });

        const result = await runScheduleCheck(now);
        expect(result.sent).toBe(0);
        expect(transporter.sendMail).not.toHaveBeenCalled();
    });
});
