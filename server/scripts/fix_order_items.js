import { sequelize } from './src/models/index.js';

async function fixOrderItems() {
    try {
        await sequelize.query(`ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_product_id_fkey";`);
        await sequelize.query(`ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE CASCADE;`);
        console.log("Successfully fixed OrderItems product_id constraint!");
    } catch (err) {
        console.error("Error updating constraints:", err);
    }
    process.exit(0);
}

fixOrderItems();
