import { Sequelize, DataTypes } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

import UserFactory from '../models/users.js';
import ProductFactory from '../models/product.js';
import OrderFactory from '../models/orders.js';
import OrderItemFactory from '../models/orderItem.js';
import MaterialFactory from '../models/material.js';
import MaterialTransactionFactory from '../models/material_transaction.js';
import ExpenseFactory from '../models/expense.js';

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    logging: false
});

const models = {
    Users: UserFactory(Sequelize, DataTypes),
    Product: ProductFactory(Sequelize, DataTypes),
    Orders: OrderFactory(Sequelize, DataTypes),
    OrderItem: OrderItemFactory(Sequelize, DataTypes),
    Material: MaterialFactory(Sequelize, DataTypes),
    MaterialTransaction: MaterialTransactionFactory(Sequelize, DataTypes),
    Expense: ExpenseFactory(Sequelize, DataTypes)
};

Object.values(models).forEach(model => {
    if (model.associate) model.associate(models);
});

export { sequelize, models };