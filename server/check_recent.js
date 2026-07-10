import dotenv from 'dotenv';
dotenv.config({ path: '/home/scarecrow/dev/ADA/server/.env' });
import { models } from '/home/scarecrow/dev/ADA/server/src/models/index.js';

async function check() {
    try {
        const txs = await models.MaterialTransaction.findAll({
            order: [['createdAt', 'DESC']],
            limit: 3
        });
        console.log("Recent Txs:", JSON.stringify(txs, null, 2));

        const expenses = await models.Expense.findAll({
            order: [['createdAt', 'DESC']],
            limit: 3
        });
        console.log("Recent Expenses:", JSON.stringify(expenses, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
