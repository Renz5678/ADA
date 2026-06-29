import { body } from "express-validator";

export const createProductValidator = [
    body('product_code')
        .notEmpty().withMessage('Product Code must not be empty!')
        .isString().withMessage('Product Code must be a string'),
    body('product_name')
        .notEmpty().withMessage('Product Name must not be empty')
        .isString().withMessage('Product Name must be a string'),
    body('price')
        .notEmpty().withMessage('Price must not be empty!')
        .isFloat().withMessage('Price must be a decimal value')
];

export const updateProductValidator = [
    body('product_code')
        .optional()
        .isString().withMessage('Product Code must be a string'),
    body('product_name')
        .optional()
        .isString().withMessage('Product Name must be a string'),
    body('price')
        .optional()
        .isFloat().withMessage('Price must be a decimal value')
];