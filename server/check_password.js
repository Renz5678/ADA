import { models } from './src/models/index.js';
import bcrypt from 'bcrypt';

async function check() {
    const { Users } = models;
    const user = await Users.findOne({ where: { email: 'papercraft.studio@example.com' } });
    console.log('Hash in DB:', user.password);
    const isValid = await bcrypt.compare('Password123!', user.password);
    console.log('Is valid with Password123! ?', isValid);
    process.exit(0);
}
check();
