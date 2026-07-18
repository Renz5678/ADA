export const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string') return email;

    const parts = email.split('@');
    if (parts.length !== 2) return email;

    let [localPart, domain] = parts;
    domain = domain.toLowerCase();

    if (domain === 'gmail.com') {
        // Strip everything from + onward
        const plusIndex = localPart.indexOf('+');
        if (plusIndex !== -1) {
            localPart = localPart.substring(0, plusIndex);
        }
        
        // Remove all dots
        localPart = localPart.replace(/\./g, '');
    }

    return `${localPart}@${domain}`;
};
