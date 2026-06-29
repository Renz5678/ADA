import { models } from "../models/index.js";

const { Material } = models;

const getMaterials = async (req, res) => {
    try {
        const userId = req.user.id;

        const materials = await Material.findAll({
            where: {
                user_id: userId
            }
        });

        return res.status(200).json(materials)
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

        const { material_code, material_name, unit_cost, quantity } = req.body;

        const newMaterial = await Material.create({
            user_id: userId,
            material_code,
            material_name,
            unit_cost,
            quantity
        });

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

        const { material_code, material_name, unit_cost, quantity } = req.body;

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
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial };