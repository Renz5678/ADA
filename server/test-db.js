import { sequelize } from './src/models/index.js';
async function test() {
  try {
    await sequelize.authenticate();
    console.log("Connected successfully!");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await sequelize.close();
  }
}
test();
