import fs from 'fs';
import path from 'path';

// Load community disposable domains list
const disposableDomainsPath = path.resolve(process.cwd(), 'node_modules/disposable-email-domains/index.json');
const disposableDomains = JSON.parse(fs.readFileSync(disposableDomainsPath, 'utf8'));

// Add our own custom blocklist for domains that evade the community list
const customBlocklist = [
    'web-library.net'
];

export const isDisposableEmail = (email) => {
    const domain = email.split('@')[1].toLowerCase();
    return disposableDomains.includes(domain) || customBlocklist.includes(domain);
};
