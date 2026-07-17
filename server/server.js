import app from "./app.js";
import { sequelize } from "./src/models/index.js";
import startCleanUpJob from './src/utils/cleanUpJob.js';
import startDeadlineReminderJob from './src/utils/deadlineReminderJob.js';
import startScheduleReminderJob from './src/utils/scheduleReminderJob.js';

const port = process.env.PORT || 3000;

const start = async () => {
    await sequelize.authenticate();
    // Temporarily force sync in production to apply the new image_url and profile_picture columns
    await sequelize.sync({ alter: true });
    console.log("Database connection has been established successfully.");

    startCleanUpJob();
    // Start Cron Jobs
    startDeadlineReminderJob();
    startScheduleReminderJob();

    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
};

start();