import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/ProductController.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const productRouter = express.Router();

productRouter.get('/', authMiddleware, getProducts);

productRouter.get('/:id', authMiddleware, getProductById);

productRouter.post('/', authMiddleware, upload.single('image'), createProductValidator, createProduct);

productRouter.put('/:id', authMiddleware, upload.single('image'), updateProductValidator, updateProduct);

productRouter.delete('/:id', authMiddleware, deleteProduct);

export default productRouter;