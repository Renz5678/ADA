import { models, sequelize } from "../models/index.js";
import { validationResult } from "express-validator";

const { Product, ProductMaterial } = models;
import { Op } from 'sequelize';

const getProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = req.query.page ? Number(req.query.page) : null;
        const limit = req.query.limit ? Number(req.query.limit) : null;
        const search = req.query.search || '';

        const whereClause = { user_id: userId };

        if (search) {
            whereClause[Op.or] = [
                { product_code: { [Op.iLike]: `%${search}%` } },
                { product_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (page && limit) {
            const offset = (page - 1) * limit;
            const { count, rows } = await Product.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                include: [{ model: ProductMaterial }],
                distinct: true
            });
            return res.status(200).json({
                products: rows,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } else {
            const products = await Product.findAll({
                where: whereClause,
                order: [['product_name', 'ASC']],
                include: [{ model: ProductMaterial }]
            });
            return res.status(200).json(products);
        }
    } catch (e) {
        console.error('[ProductController] getProducts error:', e);
        return res.status(500).json({ message: e.message || 'Internal Server Error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const product = await Product.findOne({
            where: {
                user_id: userId,
                product_id: productId
            },
            include: [{ model: ProductMaterial }]
        });

        if (!product) return res.status(404).json({ message: 'Product not found!' });

        return res.status(200).json(product);
    } catch (e) {
        console.error('[ProductController] getProductById error:', e);
        return res.status(500).json({ message: e.message || 'Internal Server Error' });
    }
};

const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { product_code, product_name, price, description, estimated_days } = req.body;
        let materials = req.body.materials;

        if (!product_name || price === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        if (typeof materials === 'string') {
            try {
                materials = JSON.parse(materials);
            } catch (e) {
                materials = [];
            }
        }
        
        let image_url = null;
        if (req.file && req.file.path) {
            image_url = req.file.path;
        }

        const t = await sequelize.transaction();
        try {
            const newProduct = await Product.create({
                user_id: userId,
                product_code,
                product_name,
                price,
                description: description || null,
                estimated_days: estimated_days ? parseInt(estimated_days, 10) : null,
                image_url
            }, { transaction: t });

            if (materials && Array.isArray(materials)) {
                for (const m of materials) {
                    await ProductMaterial.create({
                        product_id: newProduct.product_id,
                        material_id: m.material_id,
                        quantity_required: m.quantity_required
                    }, { transaction: t });
                }
            }

            await t.commit();
            return res.status(201).json({ message: 'Product created!', data: newProduct });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (e) {
        console.error('[ProductController] createProduct error:', e);
        return res.status(500).json({ message: e.message || 'Internal Server Error' });
    }
};


const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const productId = req.params.id;

        const { product_code, product_name, price, description, estimated_days } = req.body;
        let materials = req.body.materials;

        const product = await Product.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });
        if (!product) return res.status(404).json({ message: 'Product not found!' });
        
        if (typeof materials === 'string') {
            try {
                materials = JSON.parse(materials);
            } catch (e) {
                materials = [];
            }
        }

        const t = await sequelize.transaction();
        try {
            const updates = {};
            if (product_code !== undefined) updates.product_code = product_code;
            if (product_name !== undefined) updates.product_name = product_name;
            if (price !== undefined) updates.price = price;
            if (description !== undefined) updates.description = description || null;
            if (estimated_days !== undefined) updates.estimated_days = estimated_days ? parseInt(estimated_days, 10) : null;
            if (req.file && req.file.path) updates.image_url = req.file.path;

            await product.update(updates, { transaction: t });

            if (materials && Array.isArray(materials)) {
                // Clear existing materials and insert new ones
                await ProductMaterial.destroy({ where: { product_id: productId }, transaction: t });
                for (const m of materials) {
                    await ProductMaterial.create({
                        product_id: productId,
                        material_id: m.material_id,
                        quantity_required: m.quantity_required
                    }, { transaction: t });
                }
            }

            await t.commit();
            return res.status(200).json({ message: 'Product updated successfully!' });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (e) {
        console.error('[ProductController] updateProduct error:', e);
        return res.status(500).json({ message: e.message || 'Internal Server Error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const product = await Product.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });
        if (!product) return res.status(404).json({ message: 'Product not found!' });

        await product.destroy();

        return res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (e) {
        console.error('[ProductController] deleteProduct error:', e);
        if (e.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Cannot delete product because it is associated with existing orders.' });
        }
        return res.status(500).json({ message: e.message || 'Internal Server Error' });
    }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };