import request from 'supertest';
import app from '../../../app.js';
import { models, sequelize } from '../../../src/models/index.js';

const { Users } = models;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Client Businesses Controller', () => {
    beforeAll(async () => {
        await Users.create({
            username: 'freelancer1',
            business_name: 'Business 1',
            email: 'f1@test.com',
            password: 'testpassword',
            is_verified: true
        });

        await Users.create({
            username: 'freelancer2',
            business_name: 'Business 2',
            email: 'f2@test.com',
            password: 'testpassword',
            is_verified: false // Should not be returned
        });
    });

    it('should fetch all verified businesses', async () => {
        const res = await request(app)
            .get('/client-businesses');

        expect(res.statusCode).toEqual(200);
        expect(res.body.businesses.length).toBe(1);
        expect(res.body.businesses[0].business_name).toBe('Business 1');
    });
});
