import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { getMaterialTransactions, getMaterialTransactionById, createMaterialTransaction, updateMaterialTransaction, deleteMaterialTransaction } from '../controllers/MaterialTransactionController.js';
import { createMaterialTransactionValidator, updateMaterialTransactionValidator } from '../validators/materialTransactionValidator.js';

const materialTransactionRouter = express.Router();

materialTransactionRouter.get('/', authMiddleware, getMaterialTransactions);

materialTransactionRouter.get('/:id', authMiddleware, getMaterialTransactionById);

materialTransactionRouter.post('/:id', authMiddleware, createMaterialTransactionValidator, createMaterialTransaction);

materialTransactionRouter.put('/:id', authMiddleware, updateMaterialTransactionValidator, updateMaterialTransaction);

materialTransactionRouter.delete('/:id', authMiddleware, deleteMaterialTransaction);

export default materialTransactionRouter;