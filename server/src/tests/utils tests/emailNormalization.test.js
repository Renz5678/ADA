import { normalizeEmail } from '../../utils/emailNormalization.js';

describe('normalizeEmail', () => {
    it('should remove dots from the local part of a gmail address', () => {
        expect(normalizeEmail('john.doe@gmail.com')).toBe('johndoe@gmail.com');
        expect(normalizeEmail('j.o.h.n.d.o.e@gmail.com')).toBe('johndoe@gmail.com');
    });

    it('should remove everything after + in the local part of a gmail address', () => {
        expect(normalizeEmail('johndoe+spam@gmail.com')).toBe('johndoe@gmail.com');
        expect(normalizeEmail('john.doe+ada@gmail.com')).toBe('johndoe@gmail.com');
    });

    it('should not alter non-gmail addresses', () => {
        expect(normalizeEmail('john.doe@yahoo.com')).toBe('john.doe@yahoo.com');
        expect(normalizeEmail('johndoe+spam@outlook.com')).toBe('johndoe+spam@outlook.com');
    });

    it('should handle edge cases gracefully', () => {
        expect(normalizeEmail('')).toBe('');
        expect(normalizeEmail(null)).toBe(null);
        expect(normalizeEmail('invalidemail')).toBe('invalidemail');
    });
});
