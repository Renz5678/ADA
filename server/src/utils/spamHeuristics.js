const KEYWORD_BLOCKLIST = [
    'viagra', 'casino', 'porn', 'seo', 'marketing', 'buy followers', 'cheap pills',
    'tite', 'titi', 'kantot', 'puta', 'gago', 'bobo', 'tanga', 'pasarap'
];

export const isSpammyName = (name) => {
    if (!name) return false;
    
    const lowerName = name.toLowerCase();

    // Check for URLs in name
    // Matches common URL patterns (http://, https://, www., or domain.ext)
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/i;
    if (urlPattern.test(lowerName)) {
        return true;
    }

    // Check keyword blocklist
    for (const keyword of KEYWORD_BLOCKLIST) {
        if (lowerName.includes(keyword)) {
            return true;
        }
    }

    return false;
};

const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com', 
    'temp-mail.org', 'throwawaymail.com', 'fakemail.net', 'trashmail.com'
];

const SPAM_TLDS = [
    '.xyz', '.ru', '.pw', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.gq'
];

export const isSpammyEmail = (email) => {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    
    for (const keyword of KEYWORD_BLOCKLIST) {
        if (lowerEmail.includes(keyword)) {
            return true;
        }
    }

    const parts = lowerEmail.split('@');
    if (parts.length === 2) {
        const [localPart, domain] = parts;

        // Check if disposable domain
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            return true;
        }

        // Check for spam TLDs
        for (const tld of SPAM_TLDS) {
            if (domain.endsWith(tld)) {
                return true;
            }
        }

        // Check for excessive dots in the local part or use of plus sign (Gmail trick)
        if (domain === 'gmail.com' || domain === 'googlemail.com') {
            const dotCount = (localPart.match(/\./g) || []).length;
            if (dotCount > 3 || localPart.includes('+')) {
                return true;
            }
        }
    }

    return false;
};
