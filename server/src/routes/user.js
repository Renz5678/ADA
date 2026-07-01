import express from 'express';

import { getUsernameAndBusinessName } from '../controllers/UserController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/', authMiddleware, getUsernameAndBusinessName);

export default userRouter;