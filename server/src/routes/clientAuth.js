import express from 'express';
import { registerClient, loginClient } from '../controllers/ClientAuthController.js';
import { clientRegisterValidator, clientLoginValidator } from '../validators/clientValidator.js';

const clientAuthRouter = express.Router();

clientAuthRouter.post('/register', clientRegisterValidator, registerClient);
clientAuthRouter.post('/login', clientLoginValidator, loginClient);

export default clientAuthRouter;
