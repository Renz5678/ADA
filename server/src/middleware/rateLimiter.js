import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { normalizeEmail } from '../utils/emailNormalization.js';


const getIp = (req, _res) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return ipKeyGenerator(forwarded.split(',')[0].trim());
    }
    return ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
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
        return getIp(req, res);
    },
    message: {
        message: 'Too many registrations for this email address, please try again later.'
    }
});

/**
 * Per-user upload rate limiter.
 * Keys by user ID from the JWT so that a single verified account cannot
 * spam-upload images even from different IPs or browser sessions.
 *
 * Limits: 20 image uploads per 10 minutes per user.
 * Apply this BEFORE upload.single/upload.fields in any route that writes to Cloudinary.
 */
export const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    // Fall back to IP if somehow called before authMiddleware (should never happen)
    keyGenerator: (req) => {
        if (req.user && req.user.id) return `upload:user:${req.user.id}`;
        return `upload:ip:${ipKeyGenerator(req.ip || 'unknown')}`;
    },
    message: {
        message: 'Upload limit reached. You can upload at most 20 images every 10 minutes. Please wait before uploading more.'
    }
});

/**
 * Global mutation rate limiter.
 * Limits the number of POST, PUT, DELETE requests to prevent spam creation of resources
 * (like orders, materials, expenses, etc.)
 * Limits: 100 requests per 10 minutes per user/IP.
 */
export const mutationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        if (req.user && req.user.id) return `mutation:user:${req.user.id}`;
        return `mutation:ip:${ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown')}`;
    },
    skip: (req) => req.method === 'GET' || req.method === 'OPTIONS',
    message: {
        message: 'Too many actions performed. Please wait a few minutes before creating or modifying more data.'
    }
});

export const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIp,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
        message: 'Too many password reset requests from this IP, please try again later.'
    }
});