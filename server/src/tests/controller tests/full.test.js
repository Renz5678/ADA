import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users, Product, Orders, OrderItem, Material, MaterialTransaction, Expense } = models;


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


// ─── Test Data ───────────────────────────────────────────────────────────────

const testUser = {
    username: 'TestUser',
    business_name: 'Test Business',
    email: 'adatest@email.com',
    password: 'TestPass1!'
};


let userId;
let productId;
let orderId;
let orderItemId;
let materialId;
let materialTransactionId;
let expenseId;

// ─── Setup & Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
    process.env.ENABLE_REGISTRATION = 'true';
    await sequelize.sync();

    // Clean up any leftover test data
    await Users.destroy({ where: { email: testUser.email } });

    // Register test user
    await agent.post('/auth/register').send(testUser);

    // Manually verify the user so we can log in
    await Users.update(
        { is_verified: true, verification_token: null, otp_expires_at: null },
        { where: { email: testUser.email } }
    );

    // Login and get token
    const loginRes = await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password
    });

    

    const user = await Users.findOne({ where: { email: testUser.email } });
    userId = user.user_id;
}, 30000);

afterAll(async () => {
    console.log('--- STARTING AFTERALL ---');
    // Clean up in reverse dependency order
    console.log('Destroying MaterialTransaction...');
    if (materialId) await MaterialTransaction.destroy({ where: { material_id: materialId } });
    console.log('Destroying OrderItem...');
    if (orderItemId) await OrderItem.destroy({ where: { order_item_id: orderItemId } });
    console.log('Destroying Orders...');
    if (userId) await Orders.destroy({ where: { user_id: userId } });
    console.log('Destroying Product...');
    if (userId) await Product.destroy({ where: { user_id: userId } });
    console.log('Destroying Material...');
    if (userId) await Material.destroy({ where: { user_id: userId } });
    console.log('Destroying Expense...');
    if (userId) await Expense.destroy({ where: { user_id: userId } });
    console.log('Destroying Users...');
    await Users.destroy({ where: { email: testUser.email } });
    console.log('Closing sequelize...');
    await sequelize.close();
    console.log('--- AFTERALL COMPLETE ---');
}, 30000);

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('Auth: Register', () => {
    it('should fail with invalid password (no uppercase)', async () => {
        const res = await agent.post('/auth/register').send({
            username: 'Test',
            business_name: 'Test Business',
            email: 'fail@email.com',
            password: 'testpass1!'
        });
        expect(res.status).toBe(400);
    });

    it('should fail with invalid email', async () => {
        const res = await agent.post('/auth/register').send({
            username: 'Test',
            business_name: 'Test Business',
            email: 'notanemail',
            password: 'TestPass1!'
        });
        expect(res.status).toBe(400);
    });

    it('should fail with duplicate email (already registered)', async () => {
        const res = await agent.post('/auth/register').send(testUser);
        // Already registered but unverified — should resend OTP (200) or conflict (409)
        expect([200, 409]).toContain(res.status);
    });
});

describe('Auth: Login', () => {
    it('should login successfully with correct credentials', async () => {
        const res = await agent.post('/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        expect(res.status).toBe(200);
    });

    it('should fail with wrong password', async () => {
        const res = await agent.post('/auth/login').send({
            email: testUser.email,
            password: 'WrongPass1!'
        });
        expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
        const res = await agent.post('/auth/login').send({
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
        const res = await agent
            .post('/products')
            
            .send({
                product_code: 'P001',
                product_name: 'Test Product',
                price: 99.99
            });
        expect(res.status).toBe(201);
        productId = res.body.data.product_id;
    });

    it('should fail to create a product with missing fields', async () => {
        const res = await agent
            .post('/products')
            
            .send({ product_code: 'P002' });
        expect(res.status).toBe(400);
    });

    it('should get all products', async () => {
        const res = await agent
            .get('/products')
            ;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a product by id', async () => {
        const res = await agent
            .get(`/products/${productId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
        const res = await agent
            .get('/products/999999')
            ;
        expect(res.status).toBe(404);
    });

    it('should update a product', async () => {
        const res = await agent
            .put(`/products/${productId}`)
            
            .send({ price: 149.99 });
        expect(res.status).toBe(200);
    });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

describe('Orders: CRUD', () => {
    it('should create an order', async () => {
        const res = await agent
            .post('/orders')
            
            .send({
                order_date: '2026-06-01',
                total_amount: 199.99,
                status: 'Pending'
            });
        expect(res.status).toBe(201);
        orderId = res.body.data.order_id;
    });

    it('should fail with invalid status', async () => {
        const res = await agent
            .post('/orders')
            
            .send({
                order_date: '2026-06-01',
                total_amount: 199.99,
                status: 'InvalidStatus'
            });
        expect(res.status).toBe(400);
    });

    it('should get all orders', async () => {
        const res = await agent
            .get('/orders')
            ;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should get an order by id', async () => {
        const res = await agent
            .get(`/orders/${orderId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should update an order', async () => {
        const res = await agent
            .put(`/orders/${orderId}`)
            
            .send({ status: 'Done' });
        expect(res.status).toBe(200);
    });
});

// ─── Order Items ──────────────────────────────────────────────────────────────

describe('Order Items: CRUD', () => {
    it('should create an order item', async () => {
        const res = await agent
            .post('/order-item')
            
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
        const res = await agent
            .post('/order-item')
            
            .send({
                order_id: orderId,
                product_id: 999999,
                quantity: 2,
                subtotal: 299.98
            });
        expect(res.status).toBe(404);
    });

    it('should get all order items', async () => {
        const res = await agent
            .get('/order-item')
            ;
        expect(res.status).toBe(200);
    });

    it('should get order items by order id', async () => {
        const res = await agent
            .get(`/order-item/order/${orderId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should get order items by product id', async () => {
        const res = await agent
            .get(`/order-item/product/${productId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should update an order item', async () => {
        const res = await agent
            .put(`/order-item/${orderItemId}`)
            
            .send({ quantity: 3 });
        expect(res.status).toBe(200);
    });
});

// ─── Materials ────────────────────────────────────────────────────────────────

describe('Materials: CRUD', () => {
    it('should create a material', async () => {
        const res = await agent
            .post('/materials')
            
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
        const res = await agent
            .post('/materials')
            
            .send({ material_code: 'M002' });
        expect(res.status).toBe(400);
    });

    it('should get all materials', async () => {
        const res = await agent
            .get('/materials')
            ;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a material by id', async () => {
        const res = await agent
            .get(`/materials/${materialId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should update a material', async () => {
        const res = await agent
            .put(`/materials/${materialId}`)
            
            .send({ quantity: 150.00 });
        expect(res.status).toBe(200);
    });
});

// ─── Material Transactions ────────────────────────────────────────────────────

describe('Material Transactions: CRUD', () => {
    it('should create a material transaction', async () => {
        const res = await agent
            .post(`/material-transaction/${materialId}`)
            
            .send({
                type: 'Purchase',
                quantity: 50.00,
                unit_cost: 50.00,
                date_bought: '2026-06-01'
            });
        expect(res.status).toBe(201);
        materialTransactionId = res.body.data.material_transaction_id;
    });

    it('should fail with non-existent material', async () => {
        const res = await agent
            .post('/material-transaction/999999')
            
            .send({
                type: 'Purchase',
                quantity: 50.00,
                unit_cost: 50.00,
                date_bought: '2026-06-01'
            });
        expect(res.status).toBe(404);
    });

    it('should get all material transactions', async () => {
        const res = await agent
            .get('/material-transaction')
            ;
        expect(res.status).toBe(200);
    });

    it('should get a material transaction by id', async () => {
        const res = await agent
            .get(`/material-transaction/${materialTransactionId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should update a material transaction', async () => {
        const res = await agent
            .put(`/material-transaction/${materialTransactionId}`)
            
            .send({ quantity: 75.00 });
        expect(res.status).toBe(200);
    });
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

describe('Expenses: CRUD', () => {
    it('should create an expense', async () => {
        const res = await agent
            .post('/expenses')
            
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
        const res = await agent
            .post('/expenses')
            
            .send({ title: 'Incomplete' });
        expect(res.status).toBe(400);
    });

    it('should get all expenses', async () => {
        const res = await agent
            .get('/expenses')
            ;
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get an expense by id', async () => {
        const res = await agent
            .get(`/expenses/${expenseId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent expense', async () => {
        const res = await agent
            .get('/expenses/999999')
            ;
        expect(res.status).toBe(404);
    });

    it('should update an expense', async () => {
        const res = await agent
            .put(`/expenses/${expenseId}`)
            
            .send({ amount: 750.00 });
        expect(res.status).toBe(200);
    });

    it('should delete an expense', async () => {
        const res = await agent
            .delete(`/expenses/${expenseId}`)
            ;
        expect(res.status).toBe(200);
    });
});

// ─── Delete Tests (cleanup order matters) ─────────────────────────────────────

describe('Delete: Order Items, Orders, Products, Materials', () => {
    it('should delete an order item', async () => {
        const res = await agent
            .delete(`/order-item/${orderItemId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should delete a material transaction', async () => {
        const res = await agent
            .delete(`/material-transaction/${materialTransactionId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should delete an order', async () => {
        const res = await agent
            .delete(`/orders/${orderId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should delete a product', async () => {
        const res = await agent
            .delete(`/products/${productId}`)
            ;
        expect(res.status).toBe(200);
    });

    it('should delete a material', async () => {
        const res = await agent
            .delete(`/materials/${materialId}`)
            ;
        expect(res.status).toBe(200);
    });
});