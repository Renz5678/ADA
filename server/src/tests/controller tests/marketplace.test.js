import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users, Product } = models;


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


let testUserId;
let testProductId;

beforeAll(async () => {
    await sequelize.sync();
    // Setup test user
    const user = await Users.create({
        username: 'marketplaceUser',
        business_name: 'Marketplace Business',
        email: 'marketplace@email.com',
        password: 'TestPass1!',
        is_verified: true,
        bio: 'I make cool things',
        profile_picture: 'pic.png',
        banner_image: 'banner.png',
        approval_status: 'approved'
    });
    testUserId = user.user_id;

    const product = await Product.create({
        user_id: testUserId,
        product_code: 'MKTP1',
        product_name: 'Cool Thing',
        price: 19.99,
        description: 'A very cool thing',
        image_url: 'thing.png',
        estimated_days: 5
    });
    testProductId = product.product_id;
});

describe('Integration Test: Marketplace', () => {
    it('should fetch public freelancers without exposing sensitive data', async () => {
        const response = await agent.get('/marketplace/freelancers');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const testUser = response.body.find(u => u.user_id === testUserId);
        expect(testUser).toBeDefined();
        
        // Assert public fields are present
        expect(testUser.business_name).toBe('Marketplace Business');
        expect(testUser.bio).toBe('I make cool things');
        
        // Assert sensitive fields are NOT present
        expect(testUser.password).toBeUndefined();
        expect(testUser.email).toBeUndefined();
        expect(testUser.verification_token).toBeUndefined();
    });

    it('should fetch a public freelancer profile with products securely', async () => {
        const response = await agent.get(`/marketplace/freelancer/${testUserId}`);
        expect(response.status).toBe(200);
        
        // Assert public fields
        expect(response.body.user_id).toBe(testUserId);
        expect(response.body.business_name).toBe('Marketplace Business');

        // Assert sensitive fields are NOT present
        expect(response.body.password).toBeUndefined();
        expect(response.body.email).toBeUndefined();

        // Assert products are included and secure
        expect(response.body.Products).toBeDefined();
        expect(Array.isArray(response.body.Products)).toBe(true);
        expect(response.body.Products.length).toBe(1);

        const product = response.body.Products[0];
        expect(product.product_name).toBe('Cool Thing');
        expect(Number(product.price)).toBe(19.99);
        // E.g., if Product had sensitive fields in the future, we verify they aren't here
    });

    it('should return 404 for a non-existent freelancer', async () => {
        const response = await agent.get('/marketplace/freelancer/999999');
        expect(response.status).toBe(404);
    });
});

afterAll(async () => {
    await Product.destroy({ where: { product_id: testProductId } });
    await Users.destroy({ where: { user_id: testUserId } });
});
