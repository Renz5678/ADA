import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users } = models;

describe('Integration Test: Register', () => {
    it('should create a new user with hashed password', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'Renz',
                email: 'test2@email.com',
                password: 'testpassword'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('New User Created Successfully!')
    });
});

describe('Integration Test: Login', () => {
    it('should login an existing user', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@email.com',
                password: 'testpassword'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login valid!');
        expect(response.body.token).toBeDefined();
    });
});

afterAll(async () => {
    await Users.destroy({
        where: { email: 'test2@email.com' }
    });
    await sequelize.close();
});