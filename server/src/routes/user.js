import pool from '../config/postgres.js';
import express from 'express';
const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users'
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    }

    catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
});

export default userRouter;