import dotenv from 'dotenv';
dotenv.config({ path: '/home/scarecrow/dev/ADA/server/.env' });
import { models } from '/home/scarecrow/dev/ADA/server/src/models/index.js';

async function test() {
    try {
        const expenses = await models.Expense.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        console.log("Recent expenses:", expenses.map(e => e.toJSON()));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}
test();
