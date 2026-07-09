import express from 'express';
import { registerClient, loginClient, verifyOtp, resendOtp, googleLoginClient } from '../controllers/ClientAuthController.js';
import { clientRegisterValidator, clientLoginValidator, clientVerifyOtpValidator, clientResendOtpValidator } from '../validators/clientValidator.js';

const clientAuthRouter = express.Router();

clientAuthRouter.post('/register', clientRegisterValidator, registerClient);
clientAuthRouter.post('/login', clientLoginValidator, loginClient);
clientAuthRouter.post('/verify-otp', clientVerifyOtpValidator, verifyOtp);
clientAuthRouter.post('/resend-otp', clientResendOtpValidator, resendOtp);
clientAuthRouter.post('/google', googleLoginClient);

export default clientAuthRouter;
