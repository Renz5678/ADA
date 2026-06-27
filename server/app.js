import express from 'express';
import authRouter from './src/routes/auth.js';
import productRouter from './src/routes/product.js';
import orderRouter from './src/routes/order.js';
import materialRouter from './src/routes/material.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "healthy",
        message: "ADA v1"
    })
});

app.use('/auth', authRouter)
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/materials', materialRouter);

export default app;