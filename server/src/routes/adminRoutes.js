import express from 'express';
import { getUsers, updateUserStatus, deleteUser, getFeedbacks, updateFeedbackStatus, getAdminDigest } from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authMiddleware);
router.use(isAdmin);
router.use(adminLimiter);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/feedback', getFeedbacks);
router.put('/feedback/:id/status', updateFeedbackStatus);

router.get('/digest', getAdminDigest);

export default router;
