import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { checkProductImageLimit } from '../middleware/checkUploadLimit.js';

const productRouter = express.Router();

productRouter.get('/', authMiddleware, getProducts);

productRouter.get('/:id', authMiddleware, getProductById);

// checkProductImageLimit runs before upload.single so the file is never sent
// to Cloudinary when the user is already at the 150-image cap
productRouter.post('/', authMiddleware, checkProductImageLimit, upload.single('image'), createProductValidator, createProduct);

productRouter.put('/:id', authMiddleware, upload.single('image'), updateProductValidator, updateProduct);

productRouter.delete('/:id', authMiddleware, deleteProduct);

export default productRouter;