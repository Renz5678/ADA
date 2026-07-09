import request from 'supertest';
import app from '../../../app.js';
import { models, sequelize } from '../../../src/models/index.js';

const { Users, Clients } = models;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Client Authentication Controller', () => {
    let freelancerId;
    let validToken;
    let verificationToken;

    beforeAll(async () => {
        const freelancer = await Users.create({
            username: 'testfreelancer',
            business_name: 'Test Business',
            email: 'freelancer@test.com',
            password: 'testpassword',
            is_verified: true
        });
        freelancerId = freelancer.user_id;
    });

    it('should register a new client successfully (unverified)', async () => {
        const res = await request(app)
            .post('/client-auth/register')
            .send({
                name: 'Test Client',
                email: 'client@test.com',
                password: 'clientpassword',
                freelancer_id: freelancerId
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Client registered successfully!');
        expect(res.body.client.email).toBe('client@test.com');
        expect(res.body.client.is_verified).toBe(false);

        const clientInDb = await Clients.findOne({ where: { email: 'client@test.com' } });
        verificationToken = clientInDb.verification_token;
    });

    it('should fail login when account is not verified', async () => {
        const res = await request(app)
            .post('/client-auth/login')
            .send({
                email: 'client@test.com',
                password: 'clientpassword'
            });

        expect(res.statusCode).toEqual(403);
    });

    it('should resend OTP successfully', async () => {
        const res = await request(app)
            .post('/client-auth/register') // Calling register again on unverified account resends OTP
            .send({
                name: 'Test Client',
                email: 'client@test.com',
                password: 'clientpassword'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('OTP resent!');
        
        const clientInDb = await Clients.findOne({ where: { email: 'client@test.com' } });
        verificationToken = clientInDb.verification_token; // grab new token
    });

    it('should verify OTP successfully', async () => {
        const res = await request(app)
            .post('/client-auth/verify-otp')
            .send({
                email: 'client@test.com',
                verification_token: verificationToken
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Account verified!');
    });

    it('should fail registration with existing verified email', async () => {
        const res = await request(app)
            .post('/client-auth/register')
            .send({
                name: 'Another Client',
                email: 'client@test.com',
                password: 'clientpassword',
                freelancer_id: freelancerId
            });

        expect(res.statusCode).toEqual(409);
    });

    it('should login a registered client successfully', async () => {
        const res = await request(app)
            .post('/client-auth/login')
            .send({
                email: 'client@test.com',
                password: 'clientpassword'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        validToken = res.body.token;
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app)
            .post('/client-auth/login')
            .send({
                email: 'client@test.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
