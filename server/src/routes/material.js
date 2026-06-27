import express from 'express';
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/MaterialController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const materialRouter = express.Router();

materialRouter.get('/', authMiddleware, getMaterials);

materialRouter.get('/:id', authMiddleware, getMaterialById);

materialRouter.post('/', authMiddleware, createMaterial);

materialRouter.put('/:id', authMiddleware, updateMaterial);

materialRouter.delete('/:id', authMiddleware, deleteMaterial);

export default materialRouter;