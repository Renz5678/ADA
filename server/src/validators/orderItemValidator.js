import { body } from "express-validator";

export const createOrderItemValidator = [
    body('order_id')
        .notEmpty().withMessage('Order ID is required')
        .isInt().withMessage('Order ID must be an integer'),
    body('product_id')
        .notEmpty().withMessage('Product ID is required')
        .isInt().withMessage('Product ID must be an integer'),
    body('quantity')
        .notEmpty().withMessage('Quantity must not be empty!')
        .isFloat({ gt: 0 }).withMessage('Quantity must be a positive decimal value')
];

export const updateOrderItemValidator = [
    body('quantity')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Quantity must be a positive decimal value')
];