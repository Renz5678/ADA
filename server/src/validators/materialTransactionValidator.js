import { body } from "express-validator";

export const createMaterialTransactionValidator = [
    body('type')
        .notEmpty().withMessage('Type must not be empty')
        .isString().withMessage('Type must be a string'),
    body('quantity')
        .notEmpty().withMessage('Quantity must not be empty!')
        .isFloat().withMessage('Quantity must be a decimal value!'),
    body('unit_cost')
        .notEmpty().withMessage('Unit Cost must not be empty!')
        .isFloat().withMessage('Unit Cost must be a decimal value!'),
    body('date_bought')
        .notEmpty().withMessage('Date Bought must not be empty!')
        .isDate().withMessage('Date Bought must be a date')
];

export const updateMaterialTransactionValidator = [
    body('type')
        .optional()
        .isString().withMessage('Type must be a string'),
    body('quantity')
        .optional()
        .isFloat().withMessage('Quantity must be a decimal value!'),
    body('unit_cost')
        .optional()
        .isFloat().withMessage('Unit Cost must be a decimal value!'),
    body('date_bought')
        .optional()
        .isDate().withMessage('Date Bought must be a date')
];