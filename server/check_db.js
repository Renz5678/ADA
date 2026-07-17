import { models } from './src/models/index.js';
async function main() {
  const users = await models.Users.findAll({ attributes: ['user_id', 'profile_picture'] });
  console.log(users.map(u => u.toJSON()));
  process.exit(0);
}
main();
