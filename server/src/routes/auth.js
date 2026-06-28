import express from 'express';

import { register, login, verifyOtp, resendOtp, resetPassword, confirmResetPassword } from '../controllers/AuthController.js';
import { emailValidator, registerValidator, loginValidator, otpValidator, resetPasswordValidator } from '../validators/userValidator.js';
const authRouter = express.Router();

authRouter.post('/register', registerValidator, register);

authRouter.post('/login', loginValidator, login);

authRouter.post('/verify-otp', otpValidator, verifyOtp);

authRouter.post('/resend-otp', emailValidator, resendOtp);

authRouter.post('/reset-password', emailValidator, resetPassword);

authRouter.post('/confirm-reset-password', resetPasswordValidator, confirmResetPassword);

export default authRouter;