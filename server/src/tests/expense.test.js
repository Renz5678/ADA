import { Sequelize, DataTypes } from "sequelize";
import UserFactory from '../models/users.js'
import ExpenseFactory from '../models/expense.js'

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const Users = UserFactory(sequelize, DataTypes);
const Expense = ExpenseFactory(sequelize, DataTypes);

Users.associate({ Users, Expense });
Expense.associate({ Users, Expense });

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

describe('Expense', () => {
    it('should create an expense anchored on a user id', async () => {
        const user = await Users.create({
            username: 'renz',
            email: 'test@email.com',
            password: 'testpassword'
        });

        const expense = await Expense.create({
            user_id: user.user_id,
            title: 'Test',
            amount: 350.50,
            category: 'Shipping Fee',
            expense_date: '2026-06-25',
        });

        expect(expense.user_id).toBe(user.user_id);
    });
});