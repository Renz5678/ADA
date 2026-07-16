import express from 'express';
import { body } from 'express-validator';
import TaskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', TaskController.getTasks);
router.post(
    '/',
    [
        body('title').notEmpty().withMessage('Title is required')
    ],
    TaskController.createTask
);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;
