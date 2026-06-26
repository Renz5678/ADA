import express from 'express';
import userRouter from './src/routes/user.js';
import authRouter from './src/routes/auth.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "healthy",
        message: "ADA v1"
    })
});

app.use('/user', userRouter);
app.use('/auth', authRouter)

export default app;