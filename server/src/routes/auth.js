import express from 'express';

import { register, login } from '../controllers/AuthController.js';
import { verifyOtp } from '../controllers/OTPVerificationController.js';
const authRouter = express.Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/verify-otp', verifyOtp);

export default authRouter;