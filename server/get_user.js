import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('postgres://postgres.enkfinmvcqmtbfruvwhr:Ilovejeztra143@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres');
async function run() {
  const [results] = await sequelize.query("SELECT * FROM \"Users\" LIMIT 1");
  console.log(results);
  process.exit(0);
}
run();
