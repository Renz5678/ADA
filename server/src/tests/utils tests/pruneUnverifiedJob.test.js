import { pruneUnverifiedAccounts } from '../../utils/pruneUnverifiedJob.js';
import { models, sequelize } from '../../models/index.js';
import transporter from '../../utils/mailer.js';

const { Users } = models;

describe('Prune Unverified Accounts Job', () => {
    
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        // Mock email sending so we don't accidentally send real emails during tests
        jest.spyOn(transporter, 'sendMail').mockResolvedValue(true);
        // Clear users before each test
        await Users.destroy({ where: {} });
    });

    it('should NOT delete legacy accounts (is_verified: false, verification_token: null)', async () => {
        const legacyUser = await Users.create({
            username: 'legacy_user',
            email: 'legacy@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Legacy Business',
            is_verified: false,
            verification_token: null
        });

        // Artificially age the account to 50 hours ago
        const pastDate = new Date(Date.now() - 50 * 60 * 60 * 1000);
        // In Sequelize, passing silent: true prevents the hooks/timestamps from resetting our manual date changes
        await Users.update({ createdAt: pastDate }, { where: { user_id: legacyUser.user_id }, silent: true });

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist
        const checkUser = await Users.findByPk(legacyUser.user_id);
        expect(checkUser).not.toBeNull();
        expect(checkUser.username).toBe('legacy_user');
    });

    it('should DELETE unverified accounts that have a verification_token (abandoned signups)', async () => {
        const abandonedUser = await Users.create({
            username: 'abandoned_user',
            email: 'abandoned@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Abandoned Business',
            is_verified: false,
            verification_token: '123456'
        });

        // Artificially age the account to 50 hours ago
        const pastDate = new Date(Date.now() - 50 * 60 * 60 * 1000);
        await Users.update({ createdAt: pastDate }, { where: { user_id: abandonedUser.user_id }, silent: true });

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should be deleted
        const checkUser = await Users.findByPk(abandonedUser.user_id);
        expect(checkUser).toBeNull();
    });

    it('should NOT delete verified accounts', async () => {
        const verifiedUser = await Users.create({
            username: 'verified_user',
            email: 'verified@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Verified Business',
            is_verified: true,
            verification_token: null
        });

        // Artificially age the account to 50 hours ago
        const pastDate = new Date(Date.now() - 50 * 60 * 60 * 1000);
        await Users.update({ createdAt: pastDate }, { where: { user_id: verifiedUser.user_id }, silent: true });

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist
        const checkUser = await Users.findByPk(verifiedUser.user_id);
        expect(checkUser).not.toBeNull();
    });

    it('should SEND a reminder email to accounts between 24 and 48 hours old', async () => {
        const reminderUser = await Users.create({
            username: 'reminder_user',
            email: 'reminder@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Reminder Business',
            is_verified: false,
            verification_token: '654321'
        });

        // Artificially age the account to 30 hours ago (between 24 and 48)
        const pastDate = new Date(Date.now() - 30 * 60 * 60 * 1000);
        await Users.update({ createdAt: pastDate }, { where: { user_id: reminderUser.user_id }, silent: true });

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist (not older than 48 hours yet)
        const checkUser = await Users.findByPk(reminderUser.user_id);
        expect(checkUser).not.toBeNull();

        // A reminder email should have been sent
        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        const mailArgs = transporter.sendMail.mock.calls[0][0];
        expect(mailArgs.to).toBe('reminder@example.com');
        expect(mailArgs.subject).toContain('Reminder: Complete Your ADA Registration');
        expect(mailArgs.text).toContain('654321'); // Ensure token is in the email
    });
});
