import fs from 'fs';
import path from 'path';

// Load community disposable domains list
const disposableDomainsPath = path.resolve(process.cwd(), 'node_modules/disposable-email-domains/index.json');
const disposableDomains = JSON.parse(fs.readFileSync(disposableDomainsPath, 'utf8'));

// Add our own custom blocklist for domains that evade the community list
const customBlocklist = [
    'web-library.net',
    'example.com',
    'suahi.com',
    'mailinator.com',
    'temp-mail.org',
    'guerrillamail.com',
    '10minutemail.com',
    'yopmail.com',
    'trashmail.com',
    'throwawaymail.com',
    'maildrop.cc',
    'proton.me'
];

export const isDisposableEmail = (email) => {
    const domain = email.split('@')[1].toLowerCase();
    
    if (disposableDomains.includes(domain) || customBlocklist.includes(domain)) {
        return true;
    }
    
    // Hard block notoriously spammy generic TLDs
    if (domain.endsWith('.top') || domain.endsWith('.xyz')) {
        return true;
    }
    
    return false;
};
