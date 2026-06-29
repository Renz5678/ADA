import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users, Product, Orders, OrderItem, Material, MaterialTransaction, Expense } = models;

// ─── Test Data ───────────────────────────────────────────────────────────────

const testUser = {
    username: 'TestUser',
    email: 'adatest@email.com',
    password: 'TestPass1!'
};

let authToken;
let userId;
let productId;
let orderId;
let orderItemId;
let materialId;
let materialTransactionId;
let expenseId;

// ─── Setup & Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
    await sequelize.sync();

    // Clean up any leftover test data
    await Users.destroy({ where: { email: testUser.email } });

    // Register test user
    await request(app).post('/auth/register').send(testUser);

    // Manually verify the user so we can log in
    await Users.update(
        { is_verified: true, verification_token: null, otp_expires_at: null },
        { where: { email: testUser.email } }
    );

    // Login and get token
    const loginRes = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password
    });

    authToken = loginRes.body.token;

    const user = await Users.findOne({ where: { email: testUser.email } });
    userId = user.user_id;
}, 30000);

afterAll(async () => {
    // Clean up in reverse dependency order
    await MaterialTransaction.destroy({ where: { material_id: materialId } });
    await OrderItem.destroy({ where: { order_item_id: orderItemId } });
    await Orders.destroy({ where: { user_id: userId } });
    await Product.destroy({ where: { user_id: userId } });
    await Material.destroy({ where: { user_id: userId } });
    await Expense.destroy({ where: { user_id: userId } });
    await Users.destroy({ where: { email: testUser.email } });
    await sequelize.close();
}, 30000);

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('Auth: Register', () => {
    it('should fail with invalid password (no uppercase)', async () => {
        const res = await request(app).post('/auth/register').send({
            username: 'Test',
            email: 'fail@email.com',
            password: 'testpass1!'
        });
        expect(res.status).toBe(400);
    });

    it('should fail with invalid email', async () => {
        const res = await request(app).post('/auth/register').send({
            username: 'Test',
            email: 'notanemail',
            password: 'TestPass1!'
        });
        expect(res.status).toBe(400);
    });

    it('should fail with duplicate email (already registered)', async () => {
        const res = await request(app).post('/auth/register').send(testUser);
        // Already registered but unverified — should resend OTP (200) or conflict (409)
        expect([200, 409]).toContain(res.status);
    });
});

describe('Auth: Login', () => {
    it('should login successfully with correct credentials', async () => {
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: 'WrongPass1!'
        });
        expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
        const res = await request(app).post('/auth/login').send({
            email: 'nobody@email.com',
            password: 'TestPass1!'
        });
        expect(res.status).toBe(401);
    });

    it('should fail without a token on protected routes', async () => {
        const res = await request(app).get('/expenses');
        expect(res.status).toBe(401);
    });
});

// ─── Products ─────────────────────────────────────────────────────────────────

describe('Products: CRUD', () => {
    it('should create a product', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                product_code: 'P001',
                product_name: 'Test Product',
                price: 99.99
            });
        expect(res.status).toBe(201);
        productId = res.body.data.product_id;
    });

    it('should fail to create a product with missing fields', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ product_code: 'P002' });
        expect(res.status).toBe(400);
    });

    it('should get all products', async () => {
        const res = await request(app)
            .get('/products')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a product by id', async () => {
        const res = await request(app)
            .get(`/products/${productId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
        const res = await request(app)
            .get('/products/999999')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(404);
    });

    it('should update a product', async () => {
        const res = await request(app)
            .put(`/products/${productId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ price: 149.99 });
        expect(res.status).toBe(200);
    });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

describe('Orders: CRUD', () => {
    it('should create an order', async () => {
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                order_date: '2026-06-01',
                total_amount: 199.99,
                status: 'Pending'
            });
        expect(res.status).toBe(201);
        orderId = res.body.data.order_id;
    });

    it('should fail with invalid status', async () => {
        const res = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                order_date: '2026-06-01',
                total_amount: 199.99,
                status: 'InvalidStatus'
            });
        expect(res.status).toBe(400);
    });

    it('should get all orders', async () => {
        const res = await request(app)
            .get('/orders')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get an order by id', async () => {
        const res = await request(app)
            .get(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should update an order', async () => {
        const res = await request(app)
            .put(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ status: 'Done' });
        expect(res.status).toBe(200);
    });
});

// ─── Order Items ──────────────────────────────────────────────────────────────

describe('Order Items: CRUD', () => {
    it('should create an order item', async () => {
        const res = await request(app)
            .post('/order-item')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                order_id: orderId,
                product_id: productId,
                quantity: 2,
                subtotal: 299.98
            });
        expect(res.status).toBe(201);
        orderItemId = res.body.data.order_item_id;
    });

    it('should fail with non-existent product', async () => {
        const res = await request(app)
            .post('/order-item')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                order_id: orderId,
                product_id: 999999,
                quantity: 2,
                subtotal: 299.98
            });
        expect(res.status).toBe(404);
    });

    it('should get all order items', async () => {
        const res = await request(app)
            .get('/order-item')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should get order items by order id', async () => {
        const res = await request(app)
            .get(`/order-item/order/${orderId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should get order items by product id', async () => {
        const res = await request(app)
            .get(`/order-item/product/${productId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should update an order item', async () => {
        const res = await request(app)
            .put(`/order-item/${orderItemId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ quantity: 3 });
        expect(res.status).toBe(200);
    });
});

// ─── Materials ────────────────────────────────────────────────────────────────

describe('Materials: CRUD', () => {
    it('should create a material', async () => {
        const res = await request(app)
            .post('/materials')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                material_code: 'M001',
                material_name: 'Cotton Fabric',
                unit_cost: 50.00,
                quantity: 100.00
            });
        expect(res.status).toBe(201);
        materialId = res.body.data.material_id;
    });

    it('should fail with missing fields', async () => {
        const res = await request(app)
            .post('/materials')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ material_code: 'M002' });
        expect(res.status).toBe(400);
    });

    it('should get all materials', async () => {
        const res = await request(app)
            .get('/materials')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a material by id', async () => {
        const res = await request(app)
            .get(`/materials/${materialId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should update a material', async () => {
        const res = await request(app)
            .put(`/materials/${materialId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ quantity: 150.00 });
        expect(res.status).toBe(200);
    });
});

// ─── Material Transactions ────────────────────────────────────────────────────

describe('Material Transactions: CRUD', () => {
    it('should create a material transaction', async () => {
        const res = await request(app)
            .post(`/material-transaction/${materialId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                type: 'in',
                quantity: 50.00,
                unit_cost: 50.00,
                date_bought: '2026-06-01'
            });
        expect(res.status).toBe(201);
        materialTransactionId = res.body.data.material_transaction_id;
    });

    it('should fail with non-existent material', async () => {
        const res = await request(app)
            .post('/material-transaction/999999')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                type: 'in',
                quantity: 50.00,
                unit_cost: 50.00,
                date_bought: '2026-06-01'
            });
        expect(res.status).toBe(404);
    });

    it('should get all material transactions', async () => {
        const res = await request(app)
            .get('/material-transaction')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should get a material transaction by id', async () => {
        const res = await request(app)
            .get(`/material-transaction/${materialTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should update a material transaction', async () => {
        const res = await request(app)
            .put(`/material-transaction/${materialTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ quantity: 75.00 });
        expect(res.status).toBe(200);
    });
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

describe('Expenses: CRUD', () => {
    it('should create an expense', async () => {
        const res = await request(app)
            .post('/expenses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Office Supplies',
                amount: 500.00,
                category: 'Office',
                expense_date: '2026-06-01'
            });
        expect(res.status).toBe(201);
        expenseId = res.body.data.expense_id;
    });

    it('should fail with missing fields', async () => {
        const res = await request(app)
            .post('/expenses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Incomplete' });
        expect(res.status).toBe(400);
    });

    it('should get all expenses', async () => {
        const res = await request(app)
            .get('/expenses')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get an expense by id', async () => {
        const res = await request(app)
            .get(`/expenses/${expenseId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent expense', async () => {
        const res = await request(app)
            .get('/expenses/999999')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(404);
    });

    it('should update an expense', async () => {
        const res = await request(app)
            .put(`/expenses/${expenseId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ amount: 750.00 });
        expect(res.status).toBe(200);
    });

    it('should delete an expense', async () => {
        const res = await request(app)
            .delete(`/expenses/${expenseId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });
});

// ─── Delete Tests (cleanup order matters) ─────────────────────────────────────

describe('Delete: Order Items, Orders, Products, Materials', () => {
    it('should delete an order item', async () => {
        const res = await request(app)
            .delete(`/order-item/${orderItemId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should delete a material transaction', async () => {
        const res = await request(app)
            .delete(`/material-transaction/${materialTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should delete an order', async () => {
        const res = await request(app)
            .delete(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should delete a product', async () => {
        const res = await request(app)
            .delete(`/products/${productId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });

    it('should delete a material', async () => {
        const res = await request(app)
            .delete(`/materials/${materialId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });
});