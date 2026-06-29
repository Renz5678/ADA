import { body } from "express-validator";

export const createMaterialValidator = [
    body('material_code')
        .notEmpty().withMessage('Material Code is required!')
        .isString().withMessage('Material Code must be a string')
        .isLength({ max: 15 }).withMessage('Material Code must be at most 15 characters'),
    body('material_name')
        .notEmpty().withMessage('Material Name is required!')
        .isString().withMessage('Material Name must be a string')
        .isLength({ max: 20 }).withMessage('Material Name must be at most 20 characters'),
    body('unit_cost')
        .notEmpty().withMessage('Unit Cost is required!')
        .isFloat().withMessage('Unit cost must be a decimal number!'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required!')
        .isNumeric().withMessage('Quantity must be an integer!')
];

export const updateMaterialValidator = [

];