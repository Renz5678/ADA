import { Sequelize, DataTypes } from "sequelize";
import UserFactory from '../../models/user.js';
import MaterialFactory from '../../models/material.js';
import MaterialTransactionFactory from '../../models/materialTransaction.js'

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UserFactory(sequelize, DataTypes);
const Material = MaterialFactory(sequelize, DataTypes);
const MaterialTransaction = MaterialTransactionFactory(sequelize, DataTypes);

Users.associate({ Users, Material, MaterialTransaction });
Material.associate({ Users, Material, MaterialTransaction });
MaterialTransaction.associate({ Users, Material, MaterialTransaction });

beforeAll(async () => {
    await sequelize.sync({ force: true });
})

describe('Material Transaction', () => {
    it('should create a material transaction, anchroed on a user and a material', async () => {
        const user = await Users.build({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const material = await Material.build({
            user_id: user.user_id,
            material_code: 'TEST001',
            material_name: 'Test',
            unit_cost: 300.50,
            quantity: 4
        });

        const materialTransaction = await MaterialTransaction.build({
            material_id: material.material_id,
            type: 'Purchase',
            quantity: 3,
            unit_cost: 300.00,
            date_bought: '2024-12-16'
        });

        expect(material.user_id).toBe(user.user_id);
        expect(materialTransaction.material_id).toBe(material.material_id);
    });
});

