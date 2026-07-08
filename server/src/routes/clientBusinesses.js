import express from 'express';
import { getAllBusinesses } from '../controllers/ClientBusinessesController.js';

const clientBusinessesRouter = express.Router();

clientBusinessesRouter.get('/', getAllBusinesses);

export default clientBusinessesRouter;
