import express from 'express';
import { getProductMaterials, addProductMaterial, removeProductMaterial } from '../controllers/ProductMaterialController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createProductMaterialValidator } from '../validators/productMaterialValidator.js';

const productMaterialRouter = express.Router({ mergeParams: true });

// Note: Mounted usually on /products/:productId/materials
productMaterialRouter.get('/', authMiddleware, getProductMaterials);
productMaterialRouter.post('/', authMiddleware, createProductMaterialValidator, addProductMaterial);
productMaterialRouter.delete('/:materialId', authMiddleware, removeProductMaterial);

export default productMaterialRouter;
