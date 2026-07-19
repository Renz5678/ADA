import express from 'express';
import { getChatHistory, sendMessage, clearChatHistory } from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);
router.post('/message', chatLimiter, sendMessage);

export default router;
