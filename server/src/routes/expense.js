import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/ExpenseController.js'
import { createExpenseValidator, updateExpenseValidator } from '../validators/expenseValidator.js';

const expenseRouter = express.Router();

expenseRouter.get('/', authMiddleware, getExpenses);

expenseRouter.get('/:id', authMiddleware, getExpenseById);

expenseRouter.post('/', authMiddleware, createExpenseValidator, createExpense);

expenseRouter.put('/:id', authMiddleware, updateExpenseValidator, updateExpense);

expenseRouter.delete('/:id', authMiddleware, deleteExpense);

export default expenseRouter;