import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users } = models;

beforeAll(async () => {
    await sequelize.sync();
    await Users.destroy({ where: { email: 'test@email.com' } });
    await Users.create({
        username: 'LoginUser',
        business_name: 'Test Business',
        email: 'test@email.com',
        password: 'TestPass1!',
        is_verified: true
    });
});

describe('Integration Test: Register', () => {
    it('should create a new user with hashed password', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'Renz',
                business_name: 'Test Business',
                email: 'test2@email.com',
                password: 'TestPass1!'
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
                password: 'TestPass1!'
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
    await Users.destroy({
        where: { email: 'test@email.com' }
    });
    await sequelize.close();
});