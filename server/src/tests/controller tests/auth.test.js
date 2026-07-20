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

    it('should return error and not save user for spam registration (too many dots)', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'NormalName',
                business_name: 'Test Business',
                email: 'j.o.h.n.d.o.e@gmail.com',
                password: 'TestPass1!'
            });

        expect(response.status).toBe(400); // 400 error instead of fake 200
        expect(response.body.message).toBe('Registration blocked: Your email or username has been flagged as spam.');

        // Verify it was NOT saved to DB
        const dbUser = await Users.findOne({ where: { email: 'j.o.h.n.d.o.e@gmail.com' } });
        expect(dbUser).toBeNull();
    });

    it('should return error and not save user for spam registration (profanity name)', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'titemomaliit',
                business_name: 'Test Business',
                email: 'normal@email.com',
                password: 'TestPass1!'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Registration blocked: Your email or username has been flagged as spam.');

        const dbUser = await Users.findOne({ where: { email: 'normal@email.com' } });
        expect(dbUser).toBeNull();
    });

    it('should return error and not save user for disposable email registration (proton.me)', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'DisposableUser',
                business_name: 'Test Business',
                email: 'fuckmedaddy23@proton.me',
                password: 'TestPass1!'
            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Disposable or temporary emails are not allowed');

        const dbUser = await Users.findOne({ where: { email: 'fuckmedaddy23@proton.me' } });
        expect(dbUser).toBeNull();
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