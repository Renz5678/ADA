import dotenv from 'dotenv';
dotenv.config({ path: '/home/scarecrow/dev/ADA/server/.env' });
import { models } from '/home/scarecrow/dev/ADA/server/src/models/index.js';

async function test() {
    try {
        const mats = await models.Material.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        console.log("Recent mats:", mats.map(e => e.toJSON()));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}
test();
