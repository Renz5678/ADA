import express from 'express';
import authRouter from './src/routes/auth.js';
import productRouter from './src/routes/product.js';
import orderRouter from './src/routes/order.js';
import materialRouter from './src/routes/material.js';
import materialTransactionRouter from './src/routes/materialTransaction.js';
import expenseRouter from './src/routes/expense.js';
import orderItemRouter from './src/routes/orderItem.js';
import { authLimiter, generalLimiter } from './src/middleware/rateLimiter.js'

const app = express();

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

export default app;