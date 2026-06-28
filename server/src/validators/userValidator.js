import { body } from 'express-validator';

export const emailValidator = [
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Email must be a valid email')
];

export const registerValidator = [
    body('username')
        .notEmpty().withMessage('Username is required!')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Email must be a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Minimum length for password is 8')
        .matches(/[A-Z]/).withMessage('Password must have an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must have a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must have a number')
        .matches(/[@#$%?!&*]/).withMessage('Password must have a special character')
];

export const loginValidator = [
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Email must be a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Minimum length for password is 8')
];

export const otpValidator = [
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Email must be a valid email'),
    body('verification_token')
        .notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters long')
];

export const resetPasswordValidator = [
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Email must be a valid email'),
    body('verification_token')
        .notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters long'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Minimum length for password is 8')
        .matches(/[A-Z]/).withMessage('Password must have an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must have a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must have a number')
        .matches(/[@#$%?!&*]/).withMessage('Password must have a special character')
];