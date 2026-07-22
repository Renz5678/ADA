import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users } = models;

beforeAll(async () => {
    process.env.ENABLE_REGISTRATION = 'true';
    await sequelize.sync({ alter: { drop: false } });
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
    it('should block registration with 403 when ENABLE_REGISTRATION is not true', async () => {
        const originalFlag = process.env.ENABLE_REGISTRATION;
        process.env.ENABLE_REGISTRATION = 'false';

        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'BlockedUser',
                business_name: 'Blocked Business',
                email: 'blocked@email.com',
                password: 'TestPass1!'
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Registration is currently paused. Please try again later.');

        // Restore flag for subsequent tests
        process.env.ENABLE_REGISTRATION = originalFlag;
    });

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

describe('Integration Test: OTP Brute Force Lockout', () => {
    let testUserEmail = 'otpbruteforce@email.com';
    beforeEach(async () => {
        await Users.destroy({ where: { email: testUserEmail } });
        await Users.create({
            username: 'OTPUser',
            business_name: 'OTP Business',
            email: testUserEmail,
            password: 'TestPass1!',
            is_verified: false,
            verification_token: '123456',
            otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
            otp_attempts: 0
        });
    });

    afterAll(async () => {
        await Users.destroy({ where: { email: testUserEmail } });
    });

    it('should successfully verify with correct OTP and reset attempts', async () => {
        const u = await Users.findOne({ where: { email: testUserEmail }});
        console.log("USER BEFORE VERIFY:", u?.toJSON());

        const response = await request(app)
            .post('/auth/verify-otp')
            .send({ email: testUserEmail, verification_token: '123456' });

        console.log("RESPONSE BODY:", response.body);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Account verified!');

        const user = await Users.findOne({ where: { email: testUserEmail } });
        expect(user.otp_attempts).toBe(0);
        expect(user.is_verified).toBe(true);
    });

    it('should lock out after 5 failed attempts and invalidate token, rejecting the 6th correct attempt', async () => {
        // 5 wrong attempts
        for (let i = 0; i < 5; i++) {
            const res = await request(app)
                .post('/auth/verify-otp')
                .send({ email: testUserEmail, verification_token: '000000' });
            
            if (i < 4) {
                expect(res.status).toBe(404);
            } else {
                expect(res.status).toBe(429);
                expect(res.body.message).toMatch(/Too many failed attempts/);
            }
        }

        // 6th attempt with correct code should fail
        const res6 = await request(app)
            .post('/auth/verify-otp')
            .send({ email: testUserEmail, verification_token: '123456' });
        
        expect(res6.status).toBe(429);

        const user = await Users.findOne({ where: { email: testUserEmail } });
        expect(user.verification_token).toBeNull();
    });

    it('should reset attempts when a new OTP is requested', async () => {
        // fail 3 times
        for (let i = 0; i < 3; i++) {
            await request(app).post('/auth/verify-otp').send({ email: testUserEmail, verification_token: '000000' });
        }
        
        const userMid = await Users.findOne({ where: { email: testUserEmail } });
        expect(userMid.otp_attempts).toBe(3);

        // resend OTP
        await request(app).post('/auth/resend-otp').send({ email: testUserEmail });

        const userAfterResend = await Users.findOne({ where: { email: testUserEmail } });
        expect(userAfterResend.otp_attempts).toBe(0);
        expect(userAfterResend.verification_token).not.toBeNull();
    });

    it('expired but not 5 times failed should return 400', async () => {
        const user = await Users.findOne({ where: { email: testUserEmail } });
        user.otp_expires_at = new Date(Date.now() - 1000); // expire it
        await user.save();

        const res = await request(app)
            .post('/auth/verify-otp')
            .send({ email: testUserEmail, verification_token: '123456' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('OTP has expired!');
    });
});

describe('Integration Test: Reset Password', () => {
    it('should return generic success for non-existent email to prevent enumeration', async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({ email: 'doesnotexist123123@email.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('If that email address exists and is verified, an OTP for password reset has been sent.');
    });

    it('should return generic success for existing email and generate verification token', async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({ email: 'test@email.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('If that email address exists and is verified, an OTP for password reset has been sent.');

        const user = await Users.findOne({ where: { email: 'test@email.com' } });
        expect(user.verification_token).toBeDefined();
        expect(user.otp_expires_at).toBeDefined();
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