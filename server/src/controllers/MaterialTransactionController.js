import { models } from '../models/index.js';

const { Material, MaterialTransaction } = models;

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
        return res.status(500).json({ message: 'Internal Server Error!' });
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
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createMaterialTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialId = req.params.id;

        const isMaterialToTheUser = await Material.findOne({ where: { user_id: userId, material_id: materialId } });

        if (!isMaterialToTheUser) return res.status(404).json({ message: 'No material found associated with the user!' });

        const { type, quantity, unit_cost, date_bought } = req.body;

        const newMaterialTransaction = await MaterialTransaction.create({
            material_id: materialId,
            type,
            quantity,
            unit_cost,
            date_bought
        });

        return res.status(201).json({ message: 'Material Transaction created!', data: newMaterialTransaction });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateMaterialTransaction = async (req, res) => {
    try {
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
        return res.status(500).json({ message: 'Internal Server Error!' });
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
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getMaterialTransactions, getMaterialTransactionById, createMaterialTransaction, updateMaterialTransaction, deleteMaterialTransaction };