import express from 'express';

import { getUsernameAndBusinessName, updateBusinessName } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/', authMiddleware, getUsernameAndBusinessName);
userRouter.patch('/business-name', authMiddleware, updateBusinessName);

export default userRouter;