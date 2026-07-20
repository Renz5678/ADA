import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { checkProductImageLimit } from '../middleware/checkUploadLimit.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const productRouter = express.Router();

productRouter.get('/', authMiddleware, getProducts);

productRouter.get('/:id', authMiddleware, getProductById);

// checkProductImageLimit and uploadLimiter run before upload.single so the file is
// never sent to Cloudinary when the user is at the cap or rate-limited.
productRouter.post('/', authMiddleware, uploadLimiter, checkProductImageLimit, upload.single('image'), createProductValidator, createProduct);

// PUT also enforces the upload rate limiter to prevent spam via repeated updates.
productRouter.put('/:id', authMiddleware, uploadLimiter, upload.single('image'), updateProductValidator, updateProduct);

productRouter.delete('/:id', authMiddleware, deleteProduct);

export default productRouter;