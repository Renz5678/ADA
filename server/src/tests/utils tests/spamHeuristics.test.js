import { isSpammyName, isSpammyEmail } from '../../utils/spamHeuristics.js';

describe('Spam Heuristics', () => {
    describe('isSpammyName', () => {
        it('should return false for valid names', () => {
            expect(isSpammyName('John Doe')).toBe(false);
            expect(isSpammyName('Alice')).toBe(false);
        });

        it('should return true for URLs in name', () => {
            expect(isSpammyName('http://example.com')).toBe(true);
            expect(isSpammyName('www.spam.com')).toBe(true);
            expect(isSpammyName('Buy here: spam.com/buy')).toBe(true);
        });

        it('should return true for names with profanity or spam words', () => {
            expect(isSpammyName('buy followers now')).toBe(true);
            expect(isSpammyName('tite')).toBe(true);
            expect(isSpammyName('puta')).toBe(true);
            expect(isSpammyName('pasarap123')).toBe(true);
        });
        
        it('should handle case insensitivity', () => {
            expect(isSpammyName('TITE')).toBe(true);
            expect(isSpammyName('Buy Followers')).toBe(true);
        });
    });

    describe('isSpammyEmail', () => {
        it('should return false for valid emails', () => {
            expect(isSpammyEmail('john.doe@gmail.com')).toBe(false);
            expect(isSpammyEmail('alice123@yahoo.com')).toBe(false);
            expect(isSpammyEmail('test.email.here@example.com')).toBe(false);
        });

        it('should return true for emails with profanity or spam words', () => {
            expect(isSpammyEmail('tite@gmail.com')).toBe(true);
            expect(isSpammyEmail('marketing_seo@yahoo.com')).toBe(true);
            expect(isSpammyEmail('bobo.tanga@gmail.com')).toBe(true);
        });

        it('should return true for gmail addresses with more than 3 dots', () => {
            expect(isSpammyEmail('j.o.h.n.doe@gmail.com')).toBe(true);
            expect(isSpammyEmail('iveli.s.s.e.t.y.b.cn.illa@gmail.com')).toBe(true);
            expect(isSpammyEmail('fr.eedewas.h.wo.rth.a@gmail.com')).toBe(true);
        });

        it('should return false for gmail addresses with 3 or fewer dots', () => {
            expect(isSpammyEmail('j.o.h.n@gmail.com')).toBe(false);
            expect(isSpammyEmail('john.doe.smith@gmail.com')).toBe(false);
        });

        it('should return true for gmail addresses using the plus alias', () => {
            expect(isSpammyEmail('john+spam@gmail.com')).toBe(true);
            expect(isSpammyEmail('burmabooker+rppf8q@gmail.com')).toBe(true);
        });
        
        it('should apply dot and plus rules only to gmail and googlemail', () => {
            // These would be true if it was gmail
            expect(isSpammyEmail('j.o.h.n.doe@yahoo.com')).toBe(false);
            expect(isSpammyEmail('john+spam@outlook.com')).toBe(false);
        });

        it('should return true for disposable email domains', () => {
            expect(isSpammyEmail('test@mailinator.com')).toBe(true);
            expect(isSpammyEmail('user123@yopmail.com')).toBe(true);
            expect(isSpammyEmail('fake@10minutemail.com')).toBe(true);
            expect(isSpammyEmail('temp@temp-mail.org')).toBe(true);
        });

        it('should return true for known spam TLDs', () => {
            expect(isSpammyEmail('admin@casino.xyz')).toBe(true); // .xyz
            expect(isSpammyEmail('info@business.ru')).toBe(true); // .ru
            expect(isSpammyEmail('contact@cheap.pw')).toBe(true); // .pw
            expect(isSpammyEmail('spam@domain.click')).toBe(true); // .click
        });
    });
});
