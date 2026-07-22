import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users, Product, Orders, OrderItem, Material, MaterialTransaction } = models;


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
    username: 'FlowTestUser',
    business_name: 'Flow Test Business',
    email: 'adaflowtest@email.com',
    password: 'TestPass1!'
};


let userId;
let productId;
let materialId;
let orderId;
let firstOrderItemId;

// ─── Setup & Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
    process.env.ENABLE_REGISTRATION = 'true';
    await sequelize.sync();

    await Users.destroy({ where: { email: testUser.email } });

    await agent.post('/auth/register').send(testUser);

    await Users.update(
        { is_verified: true, verification_token: null, otp_expires_at: null },
        { where: { email: testUser.email } }
    );

    const loginRes = await agent.post('/auth/login').send({
        email: testUser.email,
        password: testUser.password
    });

    

    const user = await Users.findOne({ where: { email: testUser.email } });
    userId = user.user_id;

    // Seed a product (price: 100.00) that order items will reference
    const productRes = await agent
        .post('/products')
        
        .send({ product_code: 'FLOW01', product_name: 'Flow Test Product', price: 100.00 });
    productId = productRes.body.data.product_id;

    // Seed a material (starting quantity: 20) that stock transactions will reference
    const materialRes = await agent
        .post('/materials')
        
        .send({ material_code: 'FLOWMAT01', material_name: 'Flow Test Material', unit_cost: 10.00, quantity: 20.00 });
    materialId = materialRes.body.data.material_id;
}, 30000);

afterAll(async () => {
    if (materialId) await MaterialTransaction.destroy({ where: { material_id: materialId } });
    if (orderId) await OrderItem.destroy({ where: { order_id: orderId } });
    if (userId) {
        await Orders.destroy({ where: { user_id: userId } });
        await Product.destroy({ where: { user_id: userId } });
        await Material.destroy({ where: { user_id: userId } });
    }
    await Users.destroy({ where: { email: testUser.email } });
    await sequelize.close();
}, 30000);

// ─── Material Stock Auto-Calculation ───────────────────────────────────────────

describe('Material Transactions: stock auto-calculation', () => {
    it('rejects an invalid type value', async () => {
        const res = await agent
            .post(`/material-transaction/${materialId}`)
            
            .send({ type: 'in', quantity: 5, unit_cost: 10.00, date_bought: '2026-06-01' });

        expect(res.status).toBe(400);
    });

    it('a Purchase increases material quantity and updates unit_cost', async () => {
        const before = await Material.findByPk(materialId);

        const res = await agent
            .post(`/material-transaction/${materialId}`)
            
            .send({ type: 'Purchase', quantity: 15, unit_cost: 12.50, date_bought: '2026-06-01' });

        expect(res.status).toBe(201);

        const after = await Material.findByPk(materialId);
        expect(Number(after.quantity)).toBe(Number(before.quantity) + 15);
        expect(Number(after.unit_cost)).toBe(12.50);
    });

    it('a Usage decreases material quantity', async () => {
        const before = await Material.findByPk(materialId);

        const res = await agent
            .post(`/material-transaction/${materialId}`)
            
            .send({ type: 'Usage', quantity: 5, unit_cost: 12.50, date_bought: '2026-06-02' });

        expect(res.status).toBe(201);

        const after = await Material.findByPk(materialId);
        expect(Number(after.quantity)).toBe(Number(before.quantity) - 5);
    });

    it('rejects a Usage that exceeds available stock and leaves quantity unchanged', async () => {
        const before = await Material.findByPk(materialId);

        const res = await agent
            .post(`/material-transaction/${materialId}`)
            
            .send({ type: 'Usage', quantity: 9999, unit_cost: 12.50, date_bought: '2026-06-03' });

        expect(res.status).toBe(400);

        const after = await Material.findByPk(materialId);
        expect(Number(after.quantity)).toBe(Number(before.quantity));
    });
});

// ─── Order Total Auto-Sum ──────────────────────────────────────────────────────

describe('Orders: total auto-sums from order items', () => {
    it('creates an order with total_amount forced to 0, ignoring any client-sent value', async () => {
        const res = await agent
            .post('/orders')
            
            .send({ order_date: '2026-06-01', status: 'Pending', total_amount: 999999 });

        expect(res.status).toBe(201);
        expect(Number(res.body.data.total_amount)).toBe(0);

        orderId = res.body.data.order_id;
    });

    it('rejects an order item missing order_id or product_id', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({ quantity: 1 });

        expect(res.status).toBe(400);
    });

    it('rejects an order item for a non-existent product', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({ order_id: orderId, product_id: 999999, quantity: 1 });

        expect(res.status).toBe(404);
    });

    it('computes subtotal server-side (ignoring any client-sent subtotal) and adds it to the order total', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({ order_id: orderId, product_id: productId, quantity: 2, subtotal: 1 });

        expect(res.status).toBe(201);
        expect(Number(res.body.data.subtotal)).toBe(200); // 100.00 price * 2

        firstOrderItemId = res.body.data.order_item_id;

        const order = await Orders.findByPk(orderId);
        expect(Number(order.total_amount)).toBe(200);
    });

    it('a second item sums onto the existing order total', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({ order_id: orderId, product_id: productId, quantity: 3 });

        expect(res.status).toBe(201);

        const order = await Orders.findByPk(orderId);
        expect(Number(order.total_amount)).toBe(500); // 200 + 300
    });

    it('updating an item quantity adjusts the order total by the delta, not the full new value', async () => {
        const res = await agent
            .put(`/order-item/${firstOrderItemId}`)
            
            .send({ quantity: 5 }); // was 2 (subtotal 200) -> now 5 (subtotal 500), delta +300

        expect(res.status).toBe(200);

        const order = await Orders.findByPk(orderId);
        expect(Number(order.total_amount)).toBe(800); // 500 + 300
    });

    it('deleting an item decrements the order total by that item\'s subtotal', async () => {
        const res = await agent
            .delete(`/order-item/${firstOrderItemId}`)
            ;

        expect(res.status).toBe(200);

        const order = await Orders.findByPk(orderId);
        expect(Number(order.total_amount)).toBe(300); // 800 - 500, leaving only the second item
    });
});