import rateLimit from 'express-rate-limit';
import { normalizeEmail } from '../utils/emailNormalization.js';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

export const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        message: 'AI Chat limit reached (10 per hour). Please try again later.'
    }
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Strict limit for admin endpoints
    message: {
        message: 'Too many administrative requests, please try again later.'
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
    validate: { xForwardedForHeader: false, default: true },
    keyGenerator: (req, res) => {
        if (req.body && req.body.email) {
            return 'email:' + normalizeEmail(req.body.email);
        }
        // Fallback to IP address if no email is provided
        return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    },
    message: {
        message: 'Too many registrations for this email address, please try again later.'
    }
});