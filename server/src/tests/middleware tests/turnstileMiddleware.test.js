import axios from 'axios';
import { verifyTurnstile } from '../../middleware/turnstileMiddleware.js';

jest.mock('axios');

describe('Turnstile Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = 'test';
    });

    it('should call next() if NODE_ENV is test', async () => {
        process.env.NODE_ENV = 'test';
        await verifyTurnstile(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if turnstileToken is missing', async () => {
        await verifyTurnstile(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'CAPTCHA token is required.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if verification is successful', async () => {
        req.body.turnstileToken = 'valid-token';
        axios.post.mockResolvedValue({ data: { success: true } });

        await verifyTurnstile(req, res, next);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 if verification fails', async () => {
        req.body.turnstileToken = 'invalid-token';
        axios.post.mockResolvedValue({ data: { success: false } });

        await verifyTurnstile(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'CAPTCHA verification failed. Please try again.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if axios throws an error', async () => {
        req.body.turnstileToken = 'some-token';
        axios.post.mockRejectedValue(new Error('Network Error'));

        await verifyTurnstile(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to verify CAPTCHA. Please try again later.' });
        expect(next).not.toHaveBeenCalled();
    });
});
