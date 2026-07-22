import express from 'express';
import { registerClient, loginClient, verifyOtp, resendOtp, googleLoginClient, me, logout } from '../controllers/clientAuthController.js';
import { clientRegisterValidator, clientLoginValidator, clientVerifyOtpValidator, clientResendOtpValidator } from '../validators/clientValidator.js';
import { verifyTurnstile } from '../middleware/turnstileMiddleware.js';
import { registerLimiter, normalizedEmailLimiter } from '../middleware/rateLimiter.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';

const clientAuthRouter = express.Router();

clientAuthRouter.post('/register', registerLimiter, normalizedEmailLimiter, clientRegisterValidator, verifyTurnstile, registerClient);
clientAuthRouter.post('/login', clientLoginValidator, verifyTurnstile, loginClient);
clientAuthRouter.post('/verify-otp', clientVerifyOtpValidator, verifyOtp);
clientAuthRouter.post('/resend-otp', clientResendOtpValidator, verifyTurnstile, resendOtp);
clientAuthRouter.post('/google', googleLoginClient);

clientAuthRouter.get('/me', clientAuthMiddleware, me);
clientAuthRouter.post('/logout', logout);

export default clientAuthRouter;
