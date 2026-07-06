import express from 'express';
import cors from 'cors'

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

import { authLimiter, generalLimiter } from './src/middleware/rateLimiter.js'

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
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
app.use('/orders', orderRouter);
app.use('/materials', materialRouter);
app.use('/material-transaction', materialTransactionRouter);
app.use('/expenses', expenseRouter);
app.use('/order-item', orderItemRouter);
app.use('/user-details', userRouter);
app.use('/analytics', analyticsRouter);
app.use('/schedule', scheduleRouter);

export default app;