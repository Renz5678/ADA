import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from '../controllers/OrderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.get('/', authMiddleware, getOrders);

orderRouter.get('/:id', authMiddleware, getOrderById);

orderRouter.post('/', authMiddleware, createOrder);

orderRouter.put('/:id', authMiddleware, updateOrder);

orderRouter.delete('/:id', authMiddleware, deleteOrder);

export default orderRouter;