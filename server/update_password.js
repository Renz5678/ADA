import { models } from './src/models/index.js';
import bcrypt from 'bcrypt';

async function updatePassword() {
    try {
        const { Users } = models;
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        await Users.update(
            { password: hashedPassword },
            { where: { email: 'papercraft.studio@example.com' }, hooks: false }
        );
        console.log('Password updated via update query');
    } catch (error) {
        console.error('Error updating password:', error);
        process.exit(1);
    }
    process.exit(0);
}

updatePassword();
