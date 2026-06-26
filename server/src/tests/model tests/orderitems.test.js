import { Sequelize, DataTypes } from "sequelize";
import UserFactory from '../../models/users.js';
import ProductFactory from '../../models/product.js';
import OrdersFactory from '../../models/orders.js';
import OrderItemFactory from '../../models/orderItem.js';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UserFactory(sequelize, DataTypes);
const Product = ProductFactory(sequelize, DataTypes);
const Orders = OrdersFactory(sequelize, DataTypes);
const OrderItem = OrderItemFactory(sequelize, DataTypes);

Users.associate({ Users, Product, Orders, OrderItem });
Product.associate({ Users, Product, Orders, OrderItem });
Orders.associate({ Users, Product, Orders, OrderItem });
OrderItem.associate({ Users, Product, Orders, OrderItem });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Order Items', () => {
    it('should create an order item from a user which has a product, and an order with said order item', async () => {
        const user = await Users.build({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const product = await Product.build({
            user_id: user.user_id,
            product_code: 'P001',
            product_name: 'Test',
            price: 150.00
        });

        const order = await Orders.build({
            user_id: user.user_id,
            order_date: '2026-06-25',
            total_amount: 150.50,
            status: 'Pending'
        });

        const orderItem = await OrderItem.build({
            order_id: order.order_id,
            product_id: product.product_id,
            quantity: 3,
            subtotal: (product.price * 3)
        })

        expect(orderItem.quantity).toBe(3);
        expect(orderItem.subtotal).toBe(450);
        expect(orderItem.order_id).toBe(order.order_id);
        expect(orderItem.product_id).toBe(product.product_id);
    });
});