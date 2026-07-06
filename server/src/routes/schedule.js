import express from 'express';
import { getAvailabilities, createAvailability, updateAvailability, deleteAvailability } from '../controllers/ScheduleController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const scheduleRouter = express.Router();

scheduleRouter.get('/', authMiddleware, getAvailabilities);
scheduleRouter.post('/', authMiddleware, createAvailability);
scheduleRouter.put('/:id', authMiddleware, updateAvailability);
scheduleRouter.delete('/:id', authMiddleware, deleteAvailability);

export default scheduleRouter;
