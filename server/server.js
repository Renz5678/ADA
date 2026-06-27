import app from "./app.js";
import { sequelize } from "./src/models/index.js";

const port = 3000;

const start = async () => {
    await sequelize.sync({ logging: false });

    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
};

start();