import { body } from "express-validator";

export const createProductMaterialValidator = [
    body('material_id')
        .notEmpty().withMessage('Material ID is required!')
        .isInt().withMessage('Material ID must be an integer'),
    body('quantity_required')
        .notEmpty().withMessage('Quantity Required is required!')
        .isFloat({ gt: 0 }).withMessage('Quantity Required must be a positive decimal number!')
];
