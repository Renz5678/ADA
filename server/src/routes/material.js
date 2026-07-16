import express from 'express';
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createMaterialValidator, updateMaterialValidator } from '../validators/materialValidator.js';
const materialRouter = express.Router();

materialRouter.get('/', authMiddleware, getMaterials);

materialRouter.get('/:id', authMiddleware, getMaterialById);

materialRouter.post('/', authMiddleware, createMaterialValidator, createMaterial);

materialRouter.put('/:id', authMiddleware, updateMaterialValidator, updateMaterial);

materialRouter.delete('/:id', authMiddleware, deleteMaterial);

export default materialRouter;