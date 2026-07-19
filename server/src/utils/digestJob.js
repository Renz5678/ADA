import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const { Users, Orders, Product, Digest } = models;

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

                        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        } catch (error) {
            console.error('Digest Job Global Error:', error);
        }
    });
};

export default startDigestJob;
