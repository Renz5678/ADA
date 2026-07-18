import express from 'express';
import rateLimit from 'express-rate-limit';
import { createFeedback } from '../controllers/feedbackController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting: maximum 3 requests per 15 minutes per IP
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { error: 'Too many feedback requests from this IP, please try again after 15 minutes' }
});

router.post('/', authMiddleware, feedbackLimiter, createFeedback);

export default router;
