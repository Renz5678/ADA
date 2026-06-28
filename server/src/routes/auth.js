import express from 'express';

import { register, login, verifyOtp, resendOtp } from '../controllers/AuthController.js';
const authRouter = express.Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/verify-otp', verifyOtp);

authRouter.post('/resend-otp', resendOtp);

export default authRouter;