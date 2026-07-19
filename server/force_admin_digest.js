import { sequelize, models } from './src/models/index.js';
import { Op } from 'sequelize';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const { Users, Orders, Digest, Feedback } = models;

async function forceAdminDigest() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set.');
            process.exit(1);
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const today = new Date().toISOString().split('T')[0];

        console.log('Generating admin digest...');
        // Let's make sure we have at least 1 admin user
        let admins = await Users.findAll({ where: { role: 'admin' } });
        if (admins.length === 0) {
            console.log("No admins found! Creating a test admin...");
            const newAdmin = await Users.create({
                username: 'superadmin_test',
                email: 'admin_test@example.com',
                password: 'password123',
                role: 'admin',
                is_verified: true,
                approval_status: 'approved'
            });
            admins = [newAdmin];
        }
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newSignups = await Users.count({
            where: { createdAt: { [Op.gte]: thirtyDaysAgo }, role: 'user' }
        });
        
        const platformOrders = await Orders.findAll({
            where: { order_date: { [Op.gte]: thirtyDaysAgo } }
        });
        
        const platformRevenue = platformOrders.reduce((sum, order) => {
            if (order.status === 'Delivered' || order.status === 'Done') {
                return sum + parseFloat(order.total_amount);
            }
            return sum;
        }, 0);

        const newFeedbacks = await Feedback.count({
            where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
        });

        const adminPrompt = `You are a helpful AI assistant for the Admin of a SaaS platform called ADA. Given the platform's aggregate operations data for the last 30 days, write a short (2-3 sentences max), friendly, engaging daily digest highlighting platform growth, revenue, and user activity. Speak directly to the Admin using "you" or "the platform". DO NOT use markdown, lists, or tables. Just a plain text paragraph.

Platform Data (Last 30 Days):
New User Signups: ${newSignups}
Total Platform Completed Revenue: ${platformRevenue} PHP
Total Orders Tracked: ${platformOrders.length}
New Feedbacks/Bug Reports: ${newFeedbacks}
`;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const adminResult = await model.generateContent(adminPrompt);
        const adminContent = adminResult.response.text();
        console.log("\nGenerated AI Output:\n" + adminContent + "\n");

        for (const admin of admins) {
            const existingAdminDigest = await Digest.findOne({
                where: { user_id: admin.user_id, date: today }
            });
            
            if (existingAdminDigest) {
                await existingAdminDigest.update({ content: adminContent.trim() });
                console.log(`Updated existing digest for admin ${admin.user_id}`);
            } else {
                await Digest.create({
                    user_id: admin.user_id,
                    date: today,
                    content: adminContent.trim()
                });
                console.log(`Created new digest for admin ${admin.user_id}`);
            }
        }
        console.log("Success! Admin digest generation test passed.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
forceAdminDigest();
