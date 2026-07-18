import { models, sequelize } from '../models/index.js';
import { validationResult } from 'express-validator';

const { Material, MaterialTransaction, Expense } = models;

const getMaterialTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const materialTransactions = await MaterialTransaction.findAll({
            include: {
                model: Material,
                where: { user_id: userId },
                attributes: ['material_id', 'material_code', 'material_name']
            }
        });

        return res.status(200).json(materialTransactions);
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

const getMaterialTransactionById = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialTransactionId = req.params.id;

        const materialTransaction = await MaterialTransaction.findOne({
            where: { material_transaction_id: materialTransactionId },
            include: {
                model: Material,
                where: { user_id: userId }
            }
        });

        if (!materialTransaction) return res.status(404).json({ message: 'Material Transaction Not Found!' });

        return res.status(200).json(materialTransaction);
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

const createMaterialTransaction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const materialId = req.params.id;

        const isMaterialToTheUser = await Material.findOne({
            where:
            {
                user_id: userId,
                material_id: materialId
            }
        });

        if (!isMaterialToTheUser) return res.status(404).json({ message: 'No material found associated with the user!' });

        const { type, quantity, unit_cost, date_bought } = req.body;

        const t = await sequelize.transaction();

        try {
            const newMaterialTransaction = await MaterialTransaction.create({
                material_id: materialId,
                type,
                quantity,
                unit_cost,
                date_bought
            }, { transaction: t });

            if (type === 'Purchase') {
                await isMaterialToTheUser.increment('quantity', { by: Number(quantity), transaction: t });
                await isMaterialToTheUser.update({ unit_cost }, { transaction: t });
                
                await Expense.create({
                    user_id: userId,
                    title: `Material Purchase: ${isMaterialToTheUser.material_name}`,
                    amount: Number(quantity) * Number(unit_cost),
                    category: 'Materials',
                    expense_date: date_bought
                }, { transaction: t });
            } else if (type === 'Usage') {
                if (Number(isMaterialToTheUser.quantity) < Number(quantity)) {
                    await t.rollback();
                    return res.status(400).json({ message: 'Not enough stock for this usage!' });
                }
                await isMaterialToTheUser.decrement('quantity', { by: Number(quantity), transaction: t });
            }

            await t.commit();

            return res.status(201).json({ message: 'Material Transaction created!', data: newMaterialTransaction });
        } catch (e) {
            await t.rollback();
            console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
        }
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

const updateMaterialTransaction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const materialTransactionId = req.params.id;

        const { type, quantity, unit_cost, date_bought } = req.body;

        const materialTransaction = await MaterialTransaction.findOne({
            where: { material_transaction_id: materialTransactionId },
            include: {
                model: Material,
                where: { user_id: userId }
            }
        });

        if (!materialTransaction) return res.status(404).json({ message: 'Material Transaction not found!' });

        const updates = {};
        if (type !== undefined) updates.type = type;
        if (quantity !== undefined) updates.quantity = quantity;
        if (unit_cost !== undefined) updates.unit_cost = unit_cost;
        if (date_bought !== undefined) updates.date_bought = date_bought

        await materialTransaction.update(updates);

        return res.status(200).json({ message: 'Material Transaction edited successfully!' });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

const deleteMaterialTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialTransactionId = req.params.id;

        const materialTransaction = await MaterialTransaction.findOne({
            where: { material_transaction_id: materialTransactionId },
            include: {
                model: Material,
                where: { user_id: userId }
            }
        });

        if (!materialTransaction) return res.status(404).json({ message: 'Material Transaction not found!' });

        await materialTransaction.destroy();

        return res.status(200).json({ message: 'Material Transaction deleted successfully!' });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

export { getMaterialTransactions, getMaterialTransactionById, createMaterialTransaction, updateMaterialTransaction, deleteMaterialTransaction };