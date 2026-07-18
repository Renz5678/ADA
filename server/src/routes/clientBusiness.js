import express from 'express';
import { getAllBusinesses, getBusinessDetails } from '../controllers/clientBusinessController.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';

const clientBusinessesRouter = express.Router();

clientBusinessesRouter.use(clientAuthMiddleware);

clientBusinessesRouter.get('/', getAllBusinesses);
clientBusinessesRouter.get('/:id', getBusinessDetails);

export default clientBusinessesRouter;
