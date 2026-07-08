import { Sequelize, DataTypes } from "sequelize";
import UsersFactory from '../../models/users.js';
import ClientsFactory from '../../models/clients.js';
import bcrypt from 'bcrypt';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UsersFactory(sequelize, DataTypes);
const Clients = ClientsFactory(sequelize, DataTypes);

Users.associate({ Users, Clients });
Clients.associate({ Users, Clients });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Clients Model', () => {
    let user;

    beforeAll(async () => {
        user = await Users.create({
            username: 'Freelancer for Clients',
            business_name: 'Freelancer Business',
            email: 'freelancer4clients@email.com',
            password: 'password123'
        });
    });

    it('should create a valid client', async () => {
        const client = await Clients.create({
            freelancer_id: user.user_id,
            name: 'Client A',
            email: 'clienta@email.com',
            password: 'clientpassword'
        });

        expect(client.client_id).toBeDefined();
        expect(client.name).toBe('Client A');
        expect(client.email).toBe('clienta@email.com');
        expect(client.is_verified).toBe(false);
    });

    it('should hash the password on creation', async () => {
        const client = await Clients.create({
            freelancer_id: user.user_id,
            name: 'Client B',
            email: 'clientb@email.com',
            password: 'clientpassword'
        });

        expect(client.password).not.toBe('clientpassword');
        const isMatch = await Clients.comparePassword('clientpassword', client);
        expect(isMatch).toBe(true);
    });
});
