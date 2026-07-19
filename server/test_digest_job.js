import { sequelize } from "./src/models/index.js";
import startDigestJob from "./src/utils/digestJob.js";

async function run() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
        // Just checking if we can import and call it without syntax/reference errors
        startDigestJob();
        console.log("Digest job scheduled successfully without errors.");
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}
run();
