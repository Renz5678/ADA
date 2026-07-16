import express from 'express';
import rateLimit from 'express-rate-limit';
import { getClientOrders, createClientOrder } from '../controllers/clientOrderController.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';
import { body } from 'express-validator';

const clientOrdersRouter = express.Router();

clientOrdersRouter.use(clientAuthMiddleware);

const createOrderLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'test' ? 100 : 1, // Limit each IP to 1 create order request per `window` (here, per 1 minute), but 100 in tests
    message: { message: 'Too many orders requested from this IP, please try again after a minute.' },
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
