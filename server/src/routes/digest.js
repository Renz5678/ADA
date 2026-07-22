import express from 'express';
import { models } from '../models/index.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();
const { Digest } = models;

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const digest = await Digest.findOne({
            where: { user_id: userId },
            order: [['date', 'DESC']]
        });

        if (!digest) {
            return res.status(404).json({ message: 'Digest not found' });
        }

        res.json({ digest });
    } catch (error) {
        next(error);
    }
});

export default router;
