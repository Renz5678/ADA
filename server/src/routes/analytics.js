import express from 'express';
import { getSummary, getTopProducts, getWeakProducts, getSalesByMonth, getSuggestedFocus } from '../controllers/AnalyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/summary', authMiddleware, getSummary);
analyticsRouter.get('/top-products', authMiddleware, getTopProducts);
analyticsRouter.get('/weak-products', authMiddleware, getWeakProducts);
analyticsRouter.get('/sales-by-month', authMiddleware, getSalesByMonth);
analyticsRouter.get('/suggested-focus', authMiddleware, getSuggestedFocus);

export default analyticsRouter;
