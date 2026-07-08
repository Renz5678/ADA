import request from 'supertest';
import app from '../../../app.js';
import { models, sequelize } from '../../../src/models/index.js';
import jwt from 'jsonwebtoken';

const { Users, Clients, Orders } = models;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Client Orders Controller', () => {
    let freelancerId;
    let clientToken;
    let clientId;

    beforeAll(async () => {
        const freelancer = await Users.create({
            username: 'orderfreelancer',
            business_name: 'Order Business',
            email: 'ofreelancer@test.com',
            password: 'testpassword',
            is_verified: true
        });
        freelancerId = freelancer.user_id;

        const client = await Clients.create({
            name: 'Order Client',
            email: 'oclient@test.com',
            password: 'clientpassword',
            freelancer_id: freelancerId,
            is_verified: true
        });
        clientId = client.client_id;

        clientToken = jwt.sign(
            { id: clientId, email: client.email, role: 'client' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );
    });

    it('should create an order successfully', async () => {
        const res = await request(app)
            .post('/client-orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                freelancer_id: freelancerId,
                total_amount: 150.00,
                deadline: '2026-07-20'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Order requested successfully');
        expect(res.body.order.status).toBe('Awaiting Freelancer Confirmation');
        expect(res.body.order.total_amount).toBe(150.00);
    });

    it('should forbid creating an order for an unassigned freelancer', async () => {
        const res = await request(app)
            .post('/client-orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                freelancer_id: 9999, // Unknown
                total_amount: 150.00
            });

        expect(res.statusCode).toEqual(403);
    });

    it('should get client orders successfully', async () => {
        const res = await request(app)
            .get('/client-orders')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.orders.length).toBeGreaterThan(0);
        expect(res.body.orders[0].User.business_name).toBe('Order Business');
    });
});
