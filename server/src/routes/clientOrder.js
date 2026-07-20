import express from 'express';
import rateLimit from 'express-rate-limit';
import { getClientOrders, createClientOrder } from '../controllers/clientOrderController.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';
import { body } from 'express-validator';

const clientOrdersRouter = express.Router();

clientOrdersRouter.use(clientAuthMiddleware);

const createOrderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 100 : 10, // Limit each IP to 10 create order requests per 15 minutes
    message: { message: 'Too many orders requested from this IP, please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const createOrderValidator = [
    body('freelancer_id').notEmpty().isInt().withMessage('Freelancer ID is required'),
    body('total_amount').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('items').optional().isArray().withMessage('Items must be an array of products')
];

clientOrdersRouter.get('/', getClientOrders);
clientOrdersRouter.post('/', createOrderLimiter, createOrderValidator, createClientOrder);

export default clientOrdersRouter;
