import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRouter from './src/routes/auth.js';
import clientAuthRouter from './src/routes/clientAuth.js';
import clientBusinessesRouter from './src/routes/clientBusinesses.js';
import clientOrdersRouter from './src/routes/clientOrders.js';
import clientNotificationRouter from './src/routes/clientNotifications.js';
import productRouter from './src/routes/product.js';
import orderRouter from './src/routes/order.js';
import materialRouter from './src/routes/material.js';
import materialTransactionRouter from './src/routes/materialTransaction.js';
import expenseRouter from './src/routes/expense.js';
import orderItemRouter from './src/routes/orderItem.js';
import userRouter from './src/routes/user.js';
import analyticsRouter from './src/routes/analytics.js';
import scheduleRouter from './src/routes/schedule.js';
import searchRouter from './src/routes/search.js';
import notificationRouter from './src/routes/notification.js';
import productMaterialRouter from './src/routes/productMaterial.js';
import taskRouter from './src/routes/task.js';
import profileRoutes from './src/routes/profileRoutes.js';
import sseRouter from './src/routes/sse.js';
import pendingOrdersRouter from './src/routes/pendingOrders.js';

import { authLimiter, generalLimiter } from './src/middleware/rateLimiter.js'

const app = express();
app.set('trust proxy', 1);

// Initialize SSE client registry
app.locals.sseClients = new Map();

app.use(helmet());
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ada-pied-iota.vercel.app'
];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "healthy",
        message: "ADA v1"
    })
});

app.use('/auth', authLimiter, authRouter);
app.use('/client-auth', authLimiter, clientAuthRouter);
app.use('/client-businesses', clientBusinessesRouter);
app.use('/client-orders', clientOrdersRouter);
app.use('/client-notifications', clientNotificationRouter);
app.use(generalLimiter);
app.use('/products', productRouter);
app.use('/products/:productId/materials', productMaterialRouter);
app.use('/orders', orderRouter);
app.use('/materials', materialRouter);
app.use('/material-transaction', materialTransactionRouter);
app.use('/expenses', expenseRouter);
app.use('/order-item', orderItemRouter);
app.use('/user-details', userRouter);
app.use('/analytics', analyticsRouter);
app.use('/schedule', scheduleRouter);
app.use('/search', searchRouter);
app.use('/notifications', notificationRouter);
app.use('/tasks', taskRouter);
app.use('/profile', profileRoutes);
app.use('/sse', sseRouter);
app.use('/pending-orders', pendingOrdersRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Constraint Error',
            message: 'This record cannot be modified or deleted because it is tied to another existing record.'
        });
    }
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

export default app;