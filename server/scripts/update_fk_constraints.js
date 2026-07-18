import { sequelize } from './src/models/index.js';

async function updateConstraints() {
    const queries = [
        // Products
        `ALTER TABLE "Products" DROP CONSTRAINT IF EXISTS "Products_user_id_fkey";`,
        `ALTER TABLE "Products" ADD CONSTRAINT "Products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,
        
        // Materials
        `ALTER TABLE "Materials" DROP CONSTRAINT IF EXISTS "Materials_user_id_fkey";`,
        `ALTER TABLE "Materials" ADD CONSTRAINT "Materials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // Orders
        `ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS "Orders_user_id_fkey";`,
        `ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // Expenses
        `ALTER TABLE "Expenses" DROP CONSTRAINT IF EXISTS "Expenses_user_id_fkey";`,
        `ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // WeeklyAvailability
        `ALTER TABLE "WeeklyAvailabilities" DROP CONSTRAINT IF EXISTS "WeeklyAvailabilities_user_id_fkey";`,
        `ALTER TABLE "WeeklyAvailabilities" ADD CONSTRAINT "WeeklyAvailabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // Notifications
        `ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_user_id_fkey";`,
        `ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // Clients
        `ALTER TABLE "Clients" DROP CONSTRAINT IF EXISTS "Clients_freelancer_id_fkey";`,
        `ALTER TABLE "Clients" ADD CONSTRAINT "Clients_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // Tasks
        `ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_user_id_fkey";`,
        `ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`,

        // PendingOrders
        `ALTER TABLE "PendingOrders" DROP CONSTRAINT IF EXISTS "PendingOrders_freelancer_id_fkey";`,
        `ALTER TABLE "PendingOrders" ADD CONSTRAINT "PendingOrders_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Users"("user_id") ON DELETE CASCADE;`
    ];

    try {
        for (const query of queries) {
            await sequelize.query(query);
        }
        console.log("Successfully updated all foreign key constraints.");
    } catch (err) {
        console.error("Error updating constraints:", err);
    }
    process.exit(0);
}

updateConstraints();
