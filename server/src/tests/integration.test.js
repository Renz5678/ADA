import { sequelize, models } from '../models/index.js';

const { Users, Product, Orders, OrderItem, Material, MaterialTransaction, Expense } = models;

let user, product, orders, orderItem, material, materialTransaction, expense;

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
})

describe('Integration: Users', () => {
    it('should create a user', async () => {
        user = await Users.create({
            username: 'renz',
            email: 'renz@test.com',
            password: 'testpassword'
        })

        expect(user.user_id).toBeDefined();
        expect(user.username).toBe('renz');
    });
});

describe('integration: Product', () => {
    it('should create a new product', async () => {
        product = await Product.create({
            user_id: user.user_id,
            product_code: 'P001',
            product_name: 'Test',
            price: 150.00
        });
    });
});

describe('Integration: Order', () => {
    it('should create a new order', async () => {
        order = await Orders.create({
            user_id: user.user_id,
            order_date: '2026-06-25',
            total_amount: 150.50,
            status: 'Pending'
        });
    });
});

describe('Integration: OrderItem', () => {
    it('should create a new order item', async () => {
        orderItem = await OrderItem.create({
            order_id: order.order_id,
            product_id: product.product_id,
            quantity: 3,
            subtotal: (product.price * 3)
        })
    });
});

describe('Integration: Material', () => {
    it('should create a new material', async () => {
        material = await Material.create({
            user_id = user.user_id,
            material_code = 'TEST001',
            material_name: 'Test Material',
            unit_cost: 350.00,
            quantity: 10
        })
    });
});

describe('Integration: Material Transaction', () => {
    it('should create a new material transaction', async () => {
        materialTransaction = await MaterialTransaction.create({
            material_id: material.material_id,
            type: 'Purchase',
            quantity: 3,
            unit_cost: 300.00,
            date_bought: '2024-12-16'
        });
    });
});

describe('Integration: Expense', () => {
    it('should create a new expense', async () => {
        expense = await Expense.create({
            user_id: user.user_id,
            title: 'Test',
            amount: 350.50,
            category: 'Shipping Fee',
            expense_date: '2026-06-25',
        });
    });
});

describe('Integration: Relationships', () => {
    it('should fetch material with its transaction', async () => {
        const result = await Material.findOne({
            where: { material_id: material.material_id },
            include: [{ model: MaterialTransaction }]
        });

        expect(result.MaterialTransaction).toHaveLength(1);
        expect(result.MaterialTransaction[0].type).toBe('Purchase')
    });

    it('should fetch order with its items', async () => {
        const result = await OrderItem.findAll({
            where: { order_id: order.order_id },
            include: [{ model: OrderItem }]
        })

        expect(result.OrderItem).toHaveLength(1);
    });

    it('should fetch user with all their data', async () => {
        const result = await Users.findAll({
            where: { user_id: user.user_id },
            include: [
                { model: Material },
                { model: Orders },
                { model: Expense }
            ]
        })

        expect(result.Materials).toHaveLength(1);
        expect(result.Orders).toHaveLength(1);
        expect(result.Expenses).toHaveLength(1);
    });
});