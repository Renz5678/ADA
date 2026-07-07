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
import WeeklyAvailabilityFactory from '../models/weeklyAvailability.js';
import ProductMaterialFactory from '../models/productMaterial.js';
import NotificationFactory from '../models/notifications.js';

const sequelize = process.env.NODE_ENV === 'test' 
    ? new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false })
    : new Sequelize({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        logging: false
    });

const models = {
    Users: UserFactory(sequelize, DataTypes),
    Product: ProductFactory(sequelize, DataTypes),
    Orders: OrderFactory(sequelize, DataTypes),
    OrderItem: OrderItemFactory(sequelize, DataTypes),
    Material: MaterialFactory(sequelize, DataTypes),
    MaterialTransaction: MaterialTransactionFactory(sequelize, DataTypes),
    Expense: ExpenseFactory(sequelize, DataTypes),
    WeeklyAvailability: WeeklyAvailabilityFactory(sequelize, DataTypes),
    ProductMaterial: ProductMaterialFactory(sequelize, DataTypes),
    Notifications: NotificationFactory(sequelize, DataTypes)
};

Object.values(models).forEach(model => {
    if (model.associate) model.associate(models);
});

export { sequelize, models };