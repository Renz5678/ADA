import { models } from "../models/index.js";
import { validationResult } from "express-validator";

const { Product } = models;
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
                order: [['createdAt', 'DESC']]
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
                order: [['product_name', 'ASC']]
            });
            return res.status(200).json(products);
        }
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
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
            }
        });

        if (!product) return res.status(404).json({ message: 'Product not found!' });

        return res.status(200).json(product);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { product_code, product_name, price } = req.body;

        const newProduct = await Product.create({
            user_id: userId,
            product_code,
            product_name,
            price
        });

        return res.status(201).json({ message: 'Product created!', data: newProduct });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
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

        const { product_code, product_name, price } = req.body;

        const product = await Product.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });
        if (!product) return res.status(404).json({ message: 'Product not found!' });

        const updates = {};
        if (product_code !== undefined) updates.product_code = product_code;
        if (product_name !== undefined) updates.product_name = product_name;
        if (price !== undefined) updates.price = price;

        await product.update(updates)

        return res.status(200).json({ message: 'Product updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
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
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };