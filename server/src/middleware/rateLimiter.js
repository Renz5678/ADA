import rateLimit from 'express-rate-limit';
import { normalizeEmail } from '../utils/emailNormalization.js';

const getIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

const chatLimiterFreelancer = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 25,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    message: {
        message: 'AI Chat limit reached (25 per hour). Please try again later.'
    }
});

const chatLimiterAdmin = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    message: {
        message: 'AI Chat limit reached (100 per hour). Please try again later.'
    }
});

export const chatLimiter = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return chatLimiterAdmin(req, res, next);
    }
    return chatLimiterFreelancer(req, res, next);
};

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    message: {
        message: 'Too many requests, please try again later.'
    }
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Strict limit for admin endpoints
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    message: {
        message: 'Too many administrative requests, please try again later.'
    }
});

// Max 15 registrations per IP per hour to allow for shared networks
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
        message: 'Too many registrations from this IP, please try again later.'
    }
});

// Max 1 registration per normalized email per hour
export const normalizedEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    validate: { xForwardedForHeader: false, default: true },
    keyGenerator: (req, res) => {
        if (req.body && req.body.email) {
            return 'email:' + normalizeEmail(req.body.email);
        }
        // Fallback to IP address if no email is provided
        return getIp(req);
    },
    message: {
        message: 'Too many registrations for this email address, please try again later.'
    }
});