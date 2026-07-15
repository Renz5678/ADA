import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrderStats, getScheduledOrders, approveOrder, declineOrder } from '../controllers/OrderController.js';
import { createOrderValidator, updateOrderValidator } from '../validators/orderValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.get('/', authMiddleware, getOrders);

orderRouter.get('/stats', authMiddleware, getOrderStats);
orderRouter.get('/scheduled', authMiddleware, getScheduledOrders);

orderRouter.get('/:id', authMiddleware, getOrderById);

orderRouter.post('/', authMiddleware, createOrderValidator, createOrder);

orderRouter.put('/:id', authMiddleware, updateOrderValidator, updateOrder);

orderRouter.delete('/:id', authMiddleware, deleteOrder);

// Pending order approval/decline
orderRouter.post('/approve/:pendingId', authMiddleware, approveOrder);
orderRouter.post('/decline/:pendingId', authMiddleware, declineOrder);

export default orderRouter;