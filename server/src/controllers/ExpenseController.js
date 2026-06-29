import { models } from "../models/index.js";
import { validationResult } from "express-validator";

const { Expense } = models;

const getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: { user_id: userId }
        });

        return res.status(200).json(expenses);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getExpenseById = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const expense = await Expense.findOne({
            where: {
                user_id: userId,
                expense_id: expenseId
            }
        });

        if (!expense) return res.status(404).json({ message: 'Expense not found!' });

        return res.status(200).json(expense)
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createExpense = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { title, amount, category, expense_date } = req.body;

        const newExpense = await Expense.create({
            user_id: userId,
            title,
            amount,
            category,
            expense_date
        });

        return res.status(201).json({ message: 'Expense created!', data: newExpense });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateExpense = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const expenseId = req.params.id;

        const { title, amount, category, expense_date } = req.body;

        const expense = await Expense.findOne({
            where: {
                user_id: userId,
                expense_id: expenseId
            }
        });

        if (!expense) return res.status(404).json({ message: 'Expense not found!' });

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (amount !== undefined) updates.amount = amount;
        if (category !== undefined) updates.category = category;
        if (expense_date !== undefined) updates.expense_date = expense_date;

        await expense.update(updates);

        return res.status(200).json({ message: 'Expense updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const expense = await Expense.findOne({
            where: {
                user_id: userId,
                expense_id: expenseId
            }
        });

        if (!expense) return res.status(404).json({ message: 'Expense not found!' });

        await expense.destroy();

        return res.status(200).json({ message: 'Expense deleted successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };