import express from 'express';

import { register, login, verifyOtp, resendOtp, resetPassword, confirmResetPassword, googleLogin } from '../controllers/authController.js';
import { emailValidator, registerValidator, loginValidator, otpValidator, resetPasswordValidator } from '../validators/userValidator.js';
import { verifyTurnstile } from '../middleware/turnstileMiddleware.js';
import { registerLimiter, normalizedEmailLimiter, resetPasswordLimiter } from '../middleware/rateLimiter.js';
const authRouter = express.Router();

authRouter.post('/google', googleLogin);

authRouter.post('/register', registerLimiter, normalizedEmailLimiter, registerValidator, verifyTurnstile, register);

authRouter.post('/login', loginValidator, verifyTurnstile, login);

authRouter.post('/verify-otp', otpValidator, verifyOtp);

authRouter.post('/resend-otp', emailValidator, verifyTurnstile, resendOtp);

authRouter.post('/reset-password', resetPasswordLimiter, emailValidator, verifyTurnstile, resetPassword);

authRouter.post('/confirm-reset-password', resetPasswordValidator, verifyTurnstile, confirmResetPassword);

export default authRouter;