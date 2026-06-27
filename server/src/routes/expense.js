import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/ExpenseController.js'

const expenseRouter = express.Router();

expenseRouter.get('/', authMiddleware, getExpenses);

expenseRouter.get('/:id', authMiddleware, getExpenseById);

expenseRouter.post('/', authMiddleware, createExpense);

expenseRouter.put('/:id', authMiddleware, updateExpense);

expenseRouter.delete('/:id', authMiddleware, deleteExpense);

export default expenseRouter;