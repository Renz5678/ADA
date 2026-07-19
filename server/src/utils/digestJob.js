import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const { Users, Orders, Product, Digest, Feedback } = models;

const startDigestJob = () => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Digest job will not start.');
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Starting daily digest job...');
            const today = new Date().toISOString().split('T')[0];
            const users = await Users.findAll({ 
                where: { 
                    is_verified: true, 
                    is_deleted: false, 
                    approval_status: 'approved' 
                } 
            });

            for (const user of users) {
                try {
                    // Threshold check
                    const orderCount = await Orders.count({ where: { user_id: user.user_id } });
                    const productCount = await Product.count({ where: { user_id: user.user_id } });

                    if (orderCount >= 5 && productCount >= 1) {
                        // Check if digest already exists for today to avoid duplicates
                        const existingDigest = await Digest.findOne({
                            where: { user_id: user.user_id, date: today }
                        });

                        if (existingDigest) continue;

                        // Gather 30-day data
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                        const orders = await Orders.findAll({
                            where: { 
                                user_id: user.user_id, 
                                order_date: { [Op.gte]: thirtyDaysAgo } 
                            }
                        });

                        const totalRevenue = orders.reduce((sum, order) => {
                            if (order.status === 'Delivered' || order.status === 'Done') {
                                return sum + parseFloat(order.total_amount);
                            }
                            return sum;
                        }, 0);

                        const orderStatuses = orders.reduce((acc, order) => {
                            acc[order.status] = (acc[order.status] || 0) + 1;
                            return acc;
                        }, {});

                        const prompt = `You are a helpful AI assistant for a freelancer (Name: ${user.business_name || user.username}). Given their operations data for the last 30 days, write a short (2-3 sentences max), friendly, engaging daily digest highlighting their revenue and order activity. Speak directly to them using "you". DO NOT use markdown, lists, or tables. Just a plain text paragraph.
                        
Data:
Total Completed Revenue: ${totalRevenue} PHP
Order Statuses Breakdown: ${JSON.stringify(orderStatuses)}
`;

                        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                        const result = await model.generateContent(prompt);
                        const content = result.response.text();

                        await Digest.create({
                            user_id: user.user_id,
                            date: today,
                            content: content.trim()
                        });
                    }
                } catch (err) {
                    console.error(`Failed to generate digest for user ${user.user_id}:`, err);
                }
            }
            console.log('Daily digest job completed.');

            // --- ADMIN DIGEST GENERATION ---
            try {
                console.log('Generating admin digest...');
                const admins = await Users.findAll({ where: { role: 'admin' } });
                
                if (admins.length > 0) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    // Platform Metrics
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

                    for (const admin of admins) {
                        const existingAdminDigest = await Digest.findOne({
                            where: { user_id: admin.user_id, date: today }
                        });
                        
                        if (!existingAdminDigest) {
                            await Digest.create({
                                user_id: admin.user_id,
                                date: today,
                                content: adminContent.trim()
                            });
                        }
                    }
                }
            } catch (adminErr) {
                console.error('Failed to generate admin digest:', adminErr);
            }
            // --- END ADMIN DIGEST ---
        } catch (error) {
            console.error('Digest Job Global Error:', error);
        }
    });
};

export default startDigestJob;
