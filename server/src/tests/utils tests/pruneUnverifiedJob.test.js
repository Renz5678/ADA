import { pruneUnverifiedAccounts } from '../../utils/pruneUnverifiedJob.js';
import { models, sequelize } from '../../models/index.js';

const { Users } = models;

describe('Prune Unverified Accounts Job', () => {
    
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Users.destroy({ where: {} });
        jest.useRealTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
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

        // Fast forward 15 minutes
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.now() + 15 * 60 * 1000));

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist
        const checkUser = await Users.findByPk(legacyUser.user_id);
        expect(checkUser).not.toBeNull();
        expect(checkUser.username).toBe('legacy_user');
    });

    it('should DELETE unverified accounts that have a verification_token AND are older than 10 minutes', async () => {
        const abandonedUser = await Users.create({
            username: 'abandoned_user',
            email: 'abandoned@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Abandoned Business',
            is_verified: false,
            verification_token: '123456'
        });

        // Fast forward 15 minutes
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.now() + 15 * 60 * 1000));

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should be deleted
        const checkUser = await Users.findByPk(abandonedUser.user_id);
        expect(checkUser).toBeNull();
    });

    it('should NOT delete unverified accounts if they interacted recently (under 10 minutes)', async () => {
        const recentUser = await Users.create({
            username: 'recent_user',
            email: 'recent@example.com',
            password_hash: 'hash123',
            password: 'hash123',
            business_name: 'Recent Business',
            is_verified: false,
            verification_token: '123456'
        });

        // Fast forward ONLY 5 minutes
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.now() + 5 * 60 * 1000));

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist
        const checkUser = await Users.findByPk(recentUser.user_id);
        expect(checkUser).not.toBeNull();
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

        // Fast forward 15 minutes
        jest.useFakeTimers();
        jest.setSystemTime(new Date(Date.now() + 15 * 60 * 1000));

        // Run the pruning job
        await pruneUnverifiedAccounts();

        // The user should still exist
        const checkUser = await Users.findByPk(verifiedUser.user_id);
        expect(checkUser).not.toBeNull();
    });
});
