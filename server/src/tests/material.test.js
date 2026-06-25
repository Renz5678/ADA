import { Sequelize, DataTypes } from "sequelize";
import UsersFactory from '../models/users.js';
import MaterialFactory from '../models/material.js';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UsersFactory(sequelize, DataTypes);
const Material = MaterialFactory(sequelize, DataTypes);

Users.associate({ Users, Material });
Material.associate({ Users, Material });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Material', () => {
    it('should create a material associated with a certain user', async () => {
        const user = await Users.create({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const material = await Material.create({
            user_id: user.user_id,
            material_code: 'TEST001',
            material_name: 'Test',
            unit_cost: 300.50,
            quantity: 4
        });

        expect(material.user_id).toBe(user.user_id);
    });
})