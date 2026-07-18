import { models } from './src/models/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const disposableDomains = require('disposable-email-domains');

async function listEmails() {
    try {
        const users = await models.Users.findAll();
        const dummyUsers = users.filter(user => {
            const domain = user.email.split('@')[1];
            return disposableDomains.includes(domain);
        });
        
        console.log(`Found ${dummyUsers.length} dummy/disposable accounts:`);
        dummyUsers.forEach(u => {
            console.log(`- ID: ${u.user_id}, Email: ${u.email}, Username: ${u.username}, Verified: ${u.is_verified}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listEmails();
