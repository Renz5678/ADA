import { body } from 'express-validator';

export const createOrderValidator = [
    body('order_date')
        .notEmpty().withMessage('Order Date must not be empty!')
        .isDate().withMessage('Order Date must be a valid date'),
    body('total_amount')
        .notEmpty().withMessage('Total Amount must not be empty')
        .isFloat().withMessage('Total Amount must be a decimal value!'),
    body('status')
        .notEmpty().withMessage('Status must not be empty')
        .isIn(['Pending', 'Done', 'Delivered', 'Cancelled']).withMessage('Status must be Pending, Done, Delivered, or Cancelled')
];

export const updateOrderValidator = [
    body('order_date')
        .optional()
        .isDate().withMessage('Order Date must be a valid date'),
    body('total_amount')
        .optional()
        .isFloat().withMessage('Total Amount must be a decimal value!'),
    body('status')
        .optional()
        .isIn(['Pending', 'Done', 'Delivered', 'Cancelled']).withMessage('Status must be Pending, Done, Delivered, or Cancelled')
];