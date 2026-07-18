import rateLimit from 'express-rate-limit';
import { normalizeEmail } from '../utils/emailNormalization.js';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

// Max 3 registrations per IP per hour
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
        message: 'Too many registrations from this IP, please try again later.'
    }
});

// Max 1 registration per normalized email per hour
export const normalizedEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1,
    skip: () => process.env.NODE_ENV === 'test',
    keyGenerator: (req) => {
        if (req.body && req.body.email) {
            return 'email:' + normalizeEmail(req.body.email);
        }
        return 'ip:' + (req.ip || 'unknown'); // fallback if no email is provided
    },
    message: {
        message: 'Too many registrations for this email address, please try again later.'
    }
});