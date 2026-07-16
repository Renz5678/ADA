import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const searchRouter = express.Router();

searchRouter.get('/', authMiddleware, globalSearch);

export default searchRouter;
