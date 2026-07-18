import { sequelize } from './src/models/index.js';

async function run() {
  const [results] = await sequelize.query('SELECT * FROM "Users" LIMIT 1');
  console.log(results);
  process.exit(0);
}
run();
