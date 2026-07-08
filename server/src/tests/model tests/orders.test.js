import { Sequelize, DataTypes } from "sequelize";
import UsersFactory from '../../models/users.js';
import OrdersFactory from '../../models/orders.js';
import ClientsFactory from '../../models/clients.js';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UsersFactory(sequelize, DataTypes);
const Orders = OrdersFactory(sequelize, DataTypes);
const Clients = ClientsFactory(sequelize, DataTypes);

Users.associate({ Users, Orders, Clients });
Orders.associate({ Users, Orders, Clients });
Clients.associate({ Users, Orders, Clients });

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

    it('should create an order with a client and Awaiting Freelancer Confirmation status', async () => {
        const user = await Users.create({
            username: 'renz2',
            business_name: 'test biz2',
            email: 'test2@email.com',
            password: 'testpassword'
        });

        const client = await Clients.create({
            freelancer_id: user.user_id,
            name: 'Client 1',
            email: 'client1@email.com',
            password: 'clientpw'
        });

        const order = Orders.build({
            user_id: user.user_id,
            client_id: client.client_id,
            order_date: '2026-06-26',
            total_amount: 200.00,
            status: 'Awaiting Freelancer Confirmation'
        });

        expect(order.user_id).toBe(user.user_id);
        expect(order.client_id).toBe(client.client_id);
        expect(order.status).toBe('Awaiting Freelancer Confirmation');
    });
});