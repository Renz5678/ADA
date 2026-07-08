import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRouter from './src/routes/auth.js';
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

import { authLimiter, generalLimiter } from './src/middleware/rateLimiter.js'

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173' || 'https://ada-pied-iota.vercel.app/',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "healthy",
        message: "ADA v1"
    })
});

app.use('/auth', authLimiter, authRouter)
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

export default app;