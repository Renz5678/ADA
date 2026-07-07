import { models } from "../models/index.js";
import { validationResult } from "express-validator";

const { Material, Expense } = models;

const getMaterials = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = req.query.page ? Number(req.query.page) : null;
        const limit = req.query.limit ? Number(req.query.limit) : null;
        
        const whereClause = { user_id: userId };

        if (page && limit) {
            const offset = (page - 1) * limit;
            const { count, rows } = await Material.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['material_name', 'ASC']]
            });
            const totalQuantity = await Material.sum('quantity', { where: whereClause }) || 0;
            return res.status(200).json({
                materials: rows,
                totalCount: count,
                totalQuantity,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } else {
            const materials = await Material.findAll({
                where: whereClause,
                order: [['material_name', 'ASC']]
            });
            return res.status(200).json(materials);
        }
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getMaterialById = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialId = req.params.id;

        const material = await Material.findOne({
            where: {
                user_id: userId,
                material_id: materialId
            }
        });

        if (!material) return res.status(404).json({ message: 'Material not found' });

        return res.status(200).json(material);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createMaterial = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { material_code, material_name, unit_cost, quantity, low_stock_threshold } = req.body;

        if (!material_name || unit_cost === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Default threshold = 20% of initial quantity if not provided
        const threshold = low_stock_threshold !== undefined
            ? Number(low_stock_threshold)
            : Number(quantity) * 0.20;

        const newMaterial = await Material.create({
            user_id: userId,
            material_code,
            material_name,
            unit_cost,
            quantity,
            low_stock_threshold: threshold
        });
        
        if (Number(quantity) > 0) {
            await Expense.create({
                user_id: userId,
                title: `Initial Stock: ${material_name}`,
                amount: Number(quantity) * Number(unit_cost),
                category: 'Materials',
                expense_date: new Date().toISOString().split('T')[0]
            });
        }

        return res.status(201).json({ message: 'Material created!', data: newMaterial });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateMaterial = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const materialId = req.params.id;

        const { material_code, material_name, unit_cost, quantity, low_stock_threshold } = req.body;

        const material = await Material.findOne({
            where: {
                user_id: userId,
                material_id: materialId
            }
        });

        if (!material) return res.status(404).json({ message: 'Material not found!' });

        const updates = {};
        if (material_code !== undefined) updates.material_code = material_code;
        if (material_name !== undefined) updates.material_name = material_name;
        if (unit_cost !== undefined) updates.unit_cost = unit_cost;
        if (quantity !== undefined) updates.quantity = quantity;
        if (low_stock_threshold !== undefined) updates.low_stock_threshold = low_stock_threshold;

        await material.update(updates);

        return res.status(200).json({ message: 'Material updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const materialId = req.params.id;

        const material = await Material.findOne({
            where: {
                user_id: userId,
                material_id: materialId
            }
        });

        if (!material) return res.status(404).json({ message: 'Material not found!' });

        await material.destroy();
        return res.status(200).json({ message: 'Material deleted successfully!' });
    } catch (e) {
        if (e.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Cannot delete material because it is associated with existing transactions or products.' });
        }
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial };