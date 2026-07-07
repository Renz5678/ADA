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

let sequelize;

const connectionString = process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || process.env.PGUSER || 'test_user'}:` +
  `${process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'test_password'}@` +
  `${process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost'}:` +
  `${process.env.POSTGRES_PORT || process.env.PGPORT || 5432}/` +
  `${process.env.POSTGRES_DATABASE || process.env.POSTGRES_DB || process.env.PGDATABASE || 'test_db'}`;

sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false
});

if (process.env.NODE_ENV === 'test') {
    console.log('DB connection string:', connectionString);
}

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