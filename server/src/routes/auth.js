import express from 'express';

import { register, login, verifyOtp, resendOtp, resetPassword, confirmResetPassword } from '../controllers/AuthController.js';
const authRouter = express.Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/resend-otp', resendOtp);

authRouter.post('/reset-password', resetPassword);

authRouter.post('/confirm-reset-password', confirmResetPassword);

export default authRouter;