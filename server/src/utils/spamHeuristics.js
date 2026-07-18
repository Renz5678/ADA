const KEYWORD_BLOCKLIST = [
    'viagra', 'casino', 'porn', 'seo', 'marketing', 'buy followers', 'cheap pills'
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

export const isSpammyEmail = (email) => {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    
    for (const keyword of KEYWORD_BLOCKLIST) {
        if (lowerEmail.includes(keyword)) {
            return true;
        }
    }

    return false;
};
