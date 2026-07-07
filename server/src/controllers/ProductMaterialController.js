import { models } from "../models/index.js";
import { validationResult } from "express-validator";

const { Product, Material, ProductMaterial } = models;

const getProductMaterials = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Verify product belongs to user
        const product = await Product.findOne({ where: { product_id: productId, user_id: userId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const materials = await ProductMaterial.findAll({
            where: { product_id: productId },
            include: [{ model: Material, attributes: ['material_name', 'material_code', 'unit_cost'] }]
        });

        return res.status(200).json(materials);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const addProductMaterial = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const productId = req.params.productId;
        const { material_id, quantity_required } = req.body;

        // Check if product belongs to user
        const product = await Product.findOne({ where: { product_id: productId, user_id: userId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if material belongs to user
        const material = await Material.findOne({ where: { material_id, user_id: userId } });
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Check if already exists
        let productMaterial = await ProductMaterial.findOne({ where: { product_id: productId, material_id } });

        if (productMaterial) {
            productMaterial.quantity_required = quantity_required;
            await productMaterial.save();
            return res.status(200).json({ message: 'Product Material updated', data: productMaterial });
        }

        productMaterial = await ProductMaterial.create({
            product_id: productId,
            material_id,
            quantity_required
        });

        return res.status(201).json({ message: 'Product Material added', data: productMaterial });
    } catch (e) {
        console.error('Error adding product material:', e);
        return res.status(500).json({ message: 'Internal Server Error', error: e.message });
    }
};

const removeProductMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const materialId = req.params.materialId;

        const product = await Product.findOne({ where: { product_id: productId, user_id: userId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const productMaterial = await ProductMaterial.findOne({
            where: { product_id: productId, material_id: materialId }
        });

        if (!productMaterial) return res.status(404).json({ message: 'Product Material link not found' });

        await productMaterial.destroy();

        return res.status(200).json({ message: 'Product Material removed' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export { getProductMaterials, addProductMaterial, removeProductMaterial };
