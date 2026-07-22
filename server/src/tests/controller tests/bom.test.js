const request = require('supertest');
const app = require('../../../app.js').default;
const { sequelize, models } = require('../../../src/models/index.js');
const { Users, Product, Material, ProductMaterial, MaterialTransaction, Orders, OrderItem } = models;


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

const jwt = require('jsonwebtoken');

describe('BOM & Auto-Deduction Logic', () => {
    
    let userId;
    let productId;
    let materialId;
    let orderId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // 1. Create User
        const user = await Users.create({
            username: 'bomtester',
            business_name: 'BOM Inc',
            email: 'bomtest2@example.com',
            password: 'password123',
            is_verified: true
        });
        userId = user.user_id;

        // 2. Login
        const loginRes = await agent
            .post('/auth/login')
            .send({
                email: 'bomtest2@example.com',
                password: 'password123'
            });

        

        // 3. Create Product
        const productRes = await agent
            .post('/products')
            
            .send({
                product_code: 'BOM-002',
                product_name: 'Test BOM Product',
                price: 100.00
            });
        productId = productRes.body.data.product_id;

        // 4. Create Material (Starting Quantity: 100)
        const materialRes = await agent
            .post('/materials')
            
            .send({
                material_code: 'MAT-002',
                material_name: 'Test BOM Material',
                unit_cost: 10.00,
                quantity: 100
            });
        materialId = materialRes.body.data.material_id;

        // 5. Create Order
        const orderRes = await agent
            .post('/orders')
            
            .send({
                order_date: '2026-07-07',
                status: 'Pending'
            });
        orderId = orderRes.body.data.order_id;
    });

    afterAll(async () => {
        await OrderItem.destroy({ where: {} });
        await Orders.destroy({ where: {} });
        await MaterialTransaction.destroy({ where: {} });
        await ProductMaterial.destroy({ where: {} });
        await Material.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Users.destroy({ where: {} });
        await sequelize.close();
    });

    it('should link material to product', async () => {
        const res = await agent
            .post(`/products/${productId}/materials`)
            
            .send({
                material_id: materialId,
                quantity_required: 5 // requires 5 material per 1 product
            });

        expect(res.status).toBe(201);
    });

    it('should fail to create order item if material stock is insufficient', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({
                order_id: orderId,
                product_id: productId,
                quantity: 25 // 25 * 5 = 125 (we only have 100)
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Not enough stock/);
    });

    it('should auto-deduct material when order item is created successfully', async () => {
        const res = await agent
            .post('/order-item')
            
            .send({
                order_id: orderId,
                product_id: productId,
                quantity: 10 // 10 * 5 = 50 required
            });

        expect(res.status).toBe(201);
        
        const orderItemId = res.body.data.order_item_id;

        // Check if material was deducted
        const material = await Material.findByPk(materialId);
        expect(Number(material.quantity)).toBe(50); // 100 - 50 = 50

        // Check material transaction
        const transactions = await MaterialTransaction.findAll();
        expect(transactions.length).toBe(1);
        expect(transactions[0].type).toBe('Usage');
        expect(Number(transactions[0].quantity)).toBe(50);
    });
});
