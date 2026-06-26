import { Sequelize, DataTypes } from "sequelize";
import UsersFactory from '../models/users.js';
import OrdersFactory from '../models/orders.js';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UsersFactory(sequelize, DataTypes);
const Orders = OrdersFactory(sequelize, DataTypes);

Users.associate({ Users, Orders });
Orders.associate({ Users, Orders });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Orders Model', () => {
    it('should create an order with a valid user', async () => {
        const user = Users.build({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const order = Orders.build({
            user_id: user.user_id,
            order_date: '2026-06-25',
            total_amount: 150.50,
            status: 'Pending'
        });

        expect(order.user_id).toBe(user.user_id);
    });
});