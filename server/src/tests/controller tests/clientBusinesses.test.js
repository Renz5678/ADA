import request from 'supertest';
import app from '../../../app.js';
import { models, sequelize } from '../../../src/models/index.js';

const { Users, Clients } = models;


// --- Auto-injected Agent Wrapper ---
const _testAgent = request.agent(app);
const agent = {
    get: (url) => _testAgent.get(url).set('X-Requested-With', 'XMLHttpRequest'),
    post: (url) => _testAgent.post(url).set('X-Requested-With', 'XMLHttpRequest'),
    put: (url) => _testAgent.put(url).set('X-Requested-With', 'XMLHttpRequest'),
    delete: (url) => _testAgent.delete(url).set('X-Requested-With', 'XMLHttpRequest'),
    patch: (url) => _testAgent.patch(url).set('X-Requested-With', 'XMLHttpRequest'),
};
// -----------------------------------


beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Client Businesses Controller', () => {
    let token;

    beforeAll(async () => {
        await Users.create({
            username: 'freelancer1',
            business_name: 'Business 1',
            email: 'f1@test.com',
            password: 'testpassword',
            is_verified: true,
            approval_status: 'approved'
        });

        await Users.create({
            username: 'freelancer2',
            business_name: 'Business 2',
            email: 'f2@test.com',
            password: 'testpassword',
            is_verified: false // Should not be returned
        });

        // Create a test client and login
        const client = await Clients.create({
            name: 'Test Client',
            email: 'client@test.com',
            password: 'testpassword',
            is_verified: true
        });

        await agent.post('/client-auth/login').send({
            email: client.email,
            password: 'testpassword'
        });
    });

    it('should fetch all verified businesses', async () => {
        const res = await agent
            .get('/client-businesses')
            ;

        expect(res.statusCode).toEqual(200);
        expect(res.body.businesses.length).toBe(1);
        expect(res.body.businesses[0].business_name).toBe('Business 1');
    });
});
