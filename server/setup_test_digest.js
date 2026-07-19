import { sequelize, models } from './src/models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { Users, Digest } = models;

async function setup() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: { drop: false } });
        
        // Find a verified user
        let user = await Users.findOne({ where: { is_verified: true } });
        if (!user) {
            user = await Users.create({
                username: 'test_digest_user',
                business_name: 'Test Digest Business',
                email: 'digest_test@example.com',
                password: 'password123',
                is_verified: true,
                approval_status: 'approved'
            });
        }

        // Insert dummy digest for today
        const today = new Date().toISOString().split('T')[0];
        
        const existingDigest = await Digest.findOne({
            where: { user_id: user.user_id, date: today }
        });

        const sampleContent = "Here is your Daily Insight: Your revenue is looking fantastic! You have completed 5 orders this week totaling PHP 15,000. Keep up the great work and make sure to follow up on the 2 pending orders.";

        if (existingDigest) {
            await existingDigest.update({ content: sampleContent });
        } else {
            await Digest.create({
                user_id: user.user_id,
                date: today,
                content: sampleContent
            });
        }

        // Generate token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
        );

        console.log('\n--- EXACT CURL COMMAND ---');
        console.log(`curl -X GET http://localhost:3000/digest \\\n  -H "Authorization: Bearer ${token}"`);
        console.log('--------------------------\n');
        
        process.exit(0);
    } catch (e) {
        console.error("Error setting up test data:", e);
        process.exit(1);
    }
}

setup();
