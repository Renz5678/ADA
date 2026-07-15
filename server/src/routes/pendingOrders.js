import express from 'express';
import { getPendingOrders } from '../controllers/PendingOrdersController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const pendingOrdersRouter = express.Router();

pendingOrdersRouter.get('/', authMiddleware, getPendingOrders);

export default pendingOrdersRouter;
