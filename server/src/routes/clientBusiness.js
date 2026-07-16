import express from 'express';
import { getAllBusinesses, getBusinessDetails } from '../controllers/clientBusinessController.js';

const clientBusinessesRouter = express.Router();

clientBusinessesRouter.get('/', getAllBusinesses);
clientBusinessesRouter.get('/:id', getBusinessDetails);

export default clientBusinessesRouter;
