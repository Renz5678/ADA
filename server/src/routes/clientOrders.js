import express from 'express';
import { getClientOrders, createClientOrder } from '../controllers/ClientOrdersController.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';
import { body } from 'express-validator';

const clientOrdersRouter = express.Router();

clientOrdersRouter.use(clientAuthMiddleware);

const createOrderValidator = [
    body('freelancer_id').notEmpty().isInt().withMessage('Freelancer ID is required'),
    body('total_amount').notEmpty().isFloat({ min: 0 }).withMessage('Total amount must be a positive number')
];

clientOrdersRouter.get('/', getClientOrders);
clientOrdersRouter.post('/', createOrderValidator, createClientOrder);

export default clientOrdersRouter;
