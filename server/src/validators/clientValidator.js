import { body } from 'express-validator';

export const clientRegisterValidator = [
    body('name').notEmpty().withMessage('Name must not be empty').isString().withMessage('Name must be a string'),
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password must not be empty').isString().withMessage('Password must be a string'),
    body('freelancer_id').notEmpty().withMessage('Freelancer ID is required').isInt().withMessage('Freelancer ID must be an integer')
];

export const clientLoginValidator = [
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password must not be empty').isString().withMessage('Password must be a string')
];
