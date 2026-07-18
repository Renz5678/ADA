/* global URLSearchParams */
import axios from 'axios';

export const verifyTurnstile = async (req, res, next) => {
    // Bypass in test environment
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const { turnstileToken } = req.body;

    if (!turnstileToken) {
        return res.status(400).json({ message: 'CAPTCHA token is required.' });
    }

    try {
        const verifyRes = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: req.ip
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!verifyRes.data.success) {
            return res.status(400).json({ message: 'CAPTCHA verification failed. Please try again.' });
        }

        next();
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return res.status(500).json({ message: 'Failed to verify CAPTCHA. Please try again later.' });
    }
};
