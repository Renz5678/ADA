import dotenv from 'dotenv';
dotenv.config({ path: '/home/scarecrow/dev/ADA/server/.env' });
import { sequelize, models } from '/home/scarecrow/dev/ADA/server/src/models/index.js';

async function test() {
    try {
        const material = await models.Material.findOne();
        if (!material) {
            console.log("No material found.");
            process.exit();
        }
        console.log("Using material:", material.material_id, "for user:", material.user_id);
        const userId = material.user_id;

        const t = await sequelize.transaction();
        try {
            await models.MaterialTransaction.create({
                material_id: material.material_id,
                type: 'Purchase',
                quantity: 5,
                unit_cost: 12.00,
                date_bought: '2026-07-06'
            }, { transaction: t });

            await material.increment('quantity', { by: 5, transaction: t });
            await material.update({ unit_cost: 12.00 }, { transaction: t });
            
            const exp = await models.Expense.create({
                user_id: userId,
                title: `Material Purchase: ${material.material_name}`,
                amount: 60.00,
                category: 'Materials',
                expense_date: '2026-07-06'
            }, { transaction: t });

            await t.commit();
            console.log("Success! Expense ID:", exp.expense_id);
        } catch (e) {
            await t.rollback();
            console.error("Transaction Error:", e);
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

test();
