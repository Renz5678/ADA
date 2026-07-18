import { body } from 'express-validator';
import fs from 'fs';
import path from 'path';

const disposableDomains = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'node_modules/disposable-email-domains/index.json'), 'utf8'));

export const clientRegisterValidator = [
    body('name').notEmpty().withMessage('Name must not be empty').isString().withMessage('Name must be a string'),
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email')
        .custom(value => {
            const domain = value.split('@')[1];
            if (disposableDomains.includes(domain)) {
                throw new Error('Disposable or temporary emails are not allowed');
            }
            return true;
        }),
    body('password').notEmpty().withMessage('Password must not be empty').isString().withMessage('Password must be a string'),
    body('freelancer_id').optional({ checkFalsy: true }).isInt().withMessage('Freelancer ID must be an integer')
];

export const clientLoginValidator = [
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password must not be empty').isString().withMessage('Password must be a string')
];

export const clientVerifyOtpValidator = [
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email'),
    body('verification_token').notEmpty().withMessage('OTP must not be empty').isString().withMessage('OTP must be a string')
];

export const clientResendOtpValidator = [
    body('email').notEmpty().withMessage('Email must not be empty').isEmail().withMessage('Please provide a valid email')
];
