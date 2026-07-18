import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { models } from '../src/models/index.js';

async function testApi() {
    try {
        const user = await models.Users.findOne();
        if(!user) {
            console.log("No user");
            return process.exit();
        }

        const token = jwt.sign({ id: user.user_id }, process.env.ACCESS_TOKEN_SECRET || 'secret', { expiresIn: '1h' });

        const material = await models.Material.findOne({ where: { user_id: user.user_id } });
        if(!material) {
            console.log("No material");
            return process.exit();
        }

        console.log("Attempting API call to /material-transaction/" + material.material_id);
        const res = await fetch(`http://localhost:3000/material-transaction/${material.material_id}`, {
            method: 'POST',
            body: JSON.stringify({
                type: 'Purchase',
                quantity: 3,
                unit_cost: 12.00,
                date_bought: '2026-07-06'
            }),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        console.log("API Success:", data);

        const expenses = await models.Expense.findAll({
            order: [['createdAt', 'DESC']],
            limit: 1
        });
        console.log("Latest Expense after API call:", expenses.length > 0 ? expenses[0].toJSON() : 'None');

    } catch(e) {
        console.error("API Error:", e);
    } finally {
        process.exit();
    }
}
testApi();
