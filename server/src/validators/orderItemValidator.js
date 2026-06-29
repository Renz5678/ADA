import { body } from "express-validator";

export const createOrderItemValidator = [
    body('quantity')
        .notEmpty().withMessage('Quantity must not be empty!')
        .isFloat().withMessage('Quantity must be a decimal value'),
    body('subtotal')
        .notEmpty().withMessage('Subtotal must not be empty!')
        .isFloat().withMessage('Subtotal must be a decimal value')
];

export const updateOrderItemValidator = [
    body('quantity')
        .optional()
        .isFloat().withMessage('Quantity must be a decimal value'),
    body('subtotal')
        .optional()
        .isFloat().withMessage('Subtotal must be a decimal value')
];