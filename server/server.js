import express from 'express';
import userRouter from './src/routes/user.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.json({
        status: "healthy",
        message: "ADA v1"
    })
});

app.use('/user', userRouter);

app.listen(port, () => {
    console.log(`Server is staring at port ${port}`);
});