import { models, sequelize } from '../models/index.js';
import { validationResult } from 'express-validator';

const { Material, MaterialTransaction, Expense } = models;

const getMaterialTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = req.query.page ? Number(req.query.page) : null;
        const limit = req.query.limit ? Number(req.query.limit) : null;

        const includeClause = {
            model: Material,
            where: { user_id: userId },
            attributes: ['material_id', 'material_code', 'material_name']
        };

        if (page && limit) {
            const offset = (page - 1) * limit;
            const { count, rows } = await MaterialTransaction.findAndCountAll({
                include: includeClause,
                limit,
                offset,
                order: [['date_bought', 'DESC'], ['createdAt', 'DESC']]
            });
            return res.status(200).json({
                transactions: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } else {
            const materialTransactions = await MaterialTransaction.findAll({
                include: includeClause,
                order: [['date_bought', 'DESC'], ['createdAt', 'DESC']]
            });
            return res.status(200).json(materialTransactions);
        }
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
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
        return res.status(500).json({ message: 'An internal server error occurred.' });
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
        return res.status(500).json({ message: 'An internal server error occurred.' });
        }
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
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

        const t = await sequelize.transaction();

        try {
            const material = materialTransaction.Material;
            let currentQuantity = Number(material.quantity);

            // Revert the old effect
            if (materialTransaction.type === 'Purchase') {
                currentQuantity -= Number(materialTransaction.quantity);
            } else if (materialTransaction.type === 'Usage') {
                currentQuantity += Number(materialTransaction.quantity);
            }

            const newType = type !== undefined ? type : materialTransaction.type;
            const newQuantity = quantity !== undefined ? Number(quantity) : Number(materialTransaction.quantity);

            // Apply the new effect
            if (newType === 'Purchase') {
                currentQuantity += newQuantity;
            } else if (newType === 'Usage') {
                if (currentQuantity < newQuantity) {
                    await t.rollback();
                    return res.status(400).json({ message: 'Not enough stock for this usage after update!' });
                }
                currentQuantity -= newQuantity;
            }

            await material.update({ quantity: currentQuantity }, { transaction: t });

            const updates = {};
            if (type !== undefined) updates.type = type;
            if (quantity !== undefined) updates.quantity = quantity;
            if (unit_cost !== undefined) updates.unit_cost = unit_cost;
            if (date_bought !== undefined) updates.date_bought = date_bought

            await materialTransaction.update(updates, { transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'Material Transaction edited successfully!' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
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

        const t = await sequelize.transaction();

        try {
            const material = materialTransaction.Material;
            
            // Revert the effect of the deleted transaction
            if (materialTransaction.type === 'Purchase') {
                await material.decrement('quantity', { by: Number(materialTransaction.quantity), transaction: t });
            } else if (materialTransaction.type === 'Usage') {
                await material.increment('quantity', { by: Number(materialTransaction.quantity), transaction: t });
            }

            await materialTransaction.destroy({ transaction: t });
            
            await t.commit();
            return res.status(200).json({ message: 'Material Transaction deleted successfully!' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

export { getMaterialTransactions, getMaterialTransactionById, createMaterialTransaction, updateMaterialTransaction, deleteMaterialTransaction };