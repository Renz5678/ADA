import { body } from "express-validator";

export const createExpenseValidator = [
    body('title')
        .notEmpty().withMessage('Title is required!')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 50 }).withMessage('Max length is 50 characters'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat().withMessage('Amount must be a decimal value'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isString().withMessage('Category must be a string'),
    body('expense_date')
        .notEmpty().withMessage('Must have an expense date!')
        .isDate().withMessage('Must be a valid date')
];

export const updateExpenseValidator = [
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .isLength({ max: 50 }).withMessage('Max length is 50 characters'),
    body('amount')
        .optional()
        .isFloat().withMessage('Amount must be a decimal value'),
    body('category')
        .optional()
        .isString().withMessage('Category must be a string'),
    body('expense_date')
        .optional()
        .isDate().withMessage('Must be a valid date')
];