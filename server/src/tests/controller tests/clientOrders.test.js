import request from 'supertest';
import app from '../../../app.js';
import { models, sequelize } from '../../../src/models/index.js';
import jwt from 'jsonwebtoken';

const { Users, Clients, Orders, PendingOrders } = models;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Client Orders Controller', () => {
    let freelancerId;
    let clientToken;
    let clientId;
    let freelancerToken;

    beforeAll(async () => {
        const freelancer = await Users.create({
            username: 'orderfreelancer',
            business_name: 'Order Business',
            email: 'ofreelancer@test.com',
            password: 'testpassword',
            is_verified: true
        });
        freelancerId = freelancer.user_id;

        freelancerToken = jwt.sign(
            { id: freelancerId, email: freelancer.email, role: 'freelancer' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

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

    it('should submit an order request to PendingOrders (not Orders) successfully', async () => {
        const res = await request(app)
            .post('/client-orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                freelancer_id: freelancerId,
                total_amount: 150.00,
                deadline: '2026-07-20'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Order request submitted. Awaiting freelancer approval.');
        expect(res.body.pending_id).toBeDefined();

        // Order must NOT yet exist in the Orders table
        const ordersCount = await Orders.count({ where: { user_id: freelancerId } });
        expect(ordersCount).toBe(0);

        // It should exist in PendingOrders
        const pending = await PendingOrders.findByPk(res.body.pending_id);
        expect(pending).not.toBeNull();
        expect(Number(pending.total_amount)).toBe(150.00);
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

    it('should get client orders (empty until approved)', async () => {
        const res = await request(app)
            .get('/client-orders')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.statusCode).toEqual(200);
        // No orders have been approved yet, so should be empty
        expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should approve a pending order and persist it to Orders', async () => {
        // Create a fresh pending order directly
        const pending = await PendingOrders.create({
            freelancer_id: freelancerId,
            client_id: clientId,
            customer_name: 'Order Client',
            total_amount: 200.00,
            deadline: null,
            items_snapshot: [],
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });

        const res = await request(app)
            .post(`/orders/approve/${pending.pending_id}`)
            .set('Authorization', `Bearer ${freelancerToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Order approved and created successfully.');
        expect(res.body.order).toBeDefined();
        expect(res.body.order.status).toBe('Pending');

        // PendingOrder should be gone
        const stillPending = await PendingOrders.findByPk(pending.pending_id);
        expect(stillPending).toBeNull();

        // Order should exist
        const order = await Orders.findOne({ where: { user_id: freelancerId } });
        expect(order).not.toBeNull();
        expect(Number(order.total_amount)).toBe(200.00);
    });

    it('should decline a pending order and remove it', async () => {
        const pending = await PendingOrders.create({
            freelancer_id: freelancerId,
            client_id: clientId,
            customer_name: 'Order Client',
            total_amount: 100.00,
            deadline: null,
            items_snapshot: [],
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });

        const res = await request(app)
            .post(`/orders/decline/${pending.pending_id}`)
            .set('Authorization', `Bearer ${freelancerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Order request declined.');

        // PendingOrder should be gone
        const stillPending = await PendingOrders.findByPk(pending.pending_id);
        expect(stillPending).toBeNull();
    });
});
