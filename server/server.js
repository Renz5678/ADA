import app from "./app.js";
import { sequelize } from "./src/models/index.js";
import startCleanUpJob from './src/utils/cleanUpJob.js';

const port = 3000;

const start = async () => {
    await sequelize.sync({ logging: false });

    startCleanUpJob();

    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
};

start();