import express from 'express';
import { getOrderItems, getOrderItemById, getOrderItemsByProductid, getOrderItemsByOrderid, createOrderItem, updateOrderItem, deleteOrderitem } from '../controllers/OrderItemController.js';
import { createOrderitemValidator, updateOrderitemValidator } from '../validators/orderItemValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';

const orderItemRouter = express.Router();

orderItemRouter.get('/', authMiddleware, getOrderItems);

orderItemRouter.get('/product/:id', authMiddleware, getOrderItemsByProductid);

orderItemRouter.get('/order/:id', authMiddleware, getOrderItemsByOrderid);

orderItemRouter.get('/:id', authMiddleware, getOrderItemById);

orderItemRouter.post('/', authMiddleware, createOrderitemValidator,)

orderItemRouter.put('/:id', authMiddleware, updateOrderItem);

orderItemRouter.delete('/:id', authMiddleware, deleteOrderitem);

export default orderItemRouter;