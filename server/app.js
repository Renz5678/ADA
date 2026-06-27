import express from 'express';
import authRouter from './src/routes/auth.js';
import productRouter from './src/routes/product.js';

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

export default app;