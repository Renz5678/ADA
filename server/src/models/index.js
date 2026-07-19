import { Sequelize, DataTypes } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

import UserFactory from '../models/user.js';
import ProductFactory from '../models/product.js';
import OrderFactory from '../models/order.js';
import OrderItemFactory from '../models/orderItem.js';
import MaterialFactory from '../models/material.js';
import MaterialTransactionFactory from '../models/materialTransaction.js';
import ExpenseFactory from '../models/expense.js';
import WeeklyAvailabilityFactory from '../models/weeklyAvailability.js';
import ProductMaterialFactory from '../models/productMaterial.js';
import NotificationFactory from '../models/notification.js';
import TaskFactory from '../models/task.js';
import ClientFactory from '../models/client.js';
import PendingOrdersFactory from '../models/pendingOrder.js';
import FeedbackFactory from '../models/feedback.js';
import DigestFactory from '../models/digest.js';
import ChatHistoryFactory from '../models/chatHistory.js';

let sequelize;

if (process.env.NODE_ENV === 'test') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    });
} else {
    const connectionString = process.env.DATABASE_URL ||
      `postgres://${process.env.POSTGRES_USER || process.env.PGUSER || 'test_user'}:` +
      `${process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'test_password'}@` +
      `${process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost'}:` +
      `${process.env.POSTGRES_PORT || process.env.PGPORT || 5432}/` +
      `${process.env.POSTGRES_DATABASE || process.env.POSTGRES_DB || process.env.PGDATABASE || 'test_db'}`;

    const isSupabaseOrRender = connectionString.includes('supabase') || process.env.NODE_ENV === 'production';

    sequelize = new Sequelize(connectionString, {
        dialect: 'postgres',
        logging: false,
        ...(isSupabaseOrRender && {
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        })
    });
}

// --- SAFEGUARD TO PREVENT ACCIDENTAL DATA LOSS ---
const originalSync = sequelize.sync.bind(sequelize);
sequelize.sync = async (options) => {
    if (sequelize.getDialect() !== 'sqlite') {
        if (options && options.force) {
            throw new Error('CRITICAL WARNING: Attempted to run sequelize.sync({ force: true }) on a non-SQLite database! This drops all tables. Operation aborted to protect your database.');
        }
        if (options && options.alter) {
            if (options.alter !== true && options.alter.drop === false) {
                // Safe alter allowed
            } else {
                throw new Error('CRITICAL WARNING: Attempted to run sequelize.sync({ alter: true }) without { drop: false } on a non-SQLite database! This can drop existing columns and data. Operation aborted.');
            }
        }
    }
    return await originalSync(options);
};
// -------------------------------------------------

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
    Notifications: NotificationFactory(sequelize, DataTypes),
    Tasks: TaskFactory(sequelize, DataTypes),
    Clients: ClientFactory(sequelize, DataTypes),
    PendingOrders: PendingOrdersFactory(sequelize, DataTypes),
    Feedback: FeedbackFactory(sequelize, DataTypes),
    Digest: DigestFactory(sequelize, DataTypes),
    ChatHistory: ChatHistoryFactory(sequelize, DataTypes)
};

Object.values(models).forEach(model => {
    if (model.associate) model.associate(models);
});

export { sequelize, models };