import { Sequelize, DataTypes } from 'sequelize';
import UsersFactory from '../models/users.js'
import ProductFactory from '../models/product.js';
import product from '../models/product.js';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UsersFactory(sequelize, DataTypes);
const Product = ProductFactory(sequelize, DataTypes);

Users.associate({ Users, Product });
Product.associate({ Users, Product });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Product Model', () => {
    it('should create a product with a valid user', async () => {
        const user = Users.create({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const product = Product.build({
            user_id: user.user_id,
            product_code: 'P001',
            product_name: 'Test',
            price: 150.00
        });

        expect(product.product_name).toBe('Test');
        expect(product.user_id).toBe(user.user_id);
    });
});