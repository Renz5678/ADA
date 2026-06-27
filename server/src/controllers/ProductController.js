import { models } from "../models/index.js";

const { Product } = models;

const getProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const products = await Product.findAll({ where: { user_id: userId } });

        return res.status(200).json(products);
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

        if (product === null) return res.status(404).json({ message: 'Product not found!' });

        return res.status(200).json(product);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createProduct = async (req, res) => {
    try {
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
        const userId = req.user.id;
        const productId = req.params.id;

        const { product_code, product_name, price } = req.body;

        const product = await Product.findOne({ where: { user_id: userId, product_id: productId } });
        if (!product) return res.status(404).json({ message: 'Product not found!' });

        product.product_code = product_code;
        product.product_name = product_name;
        product.price = price;

        await product.save();

        return res.status(200).json({ message: 'Product updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const product = await Product.findOne({ where: { user_id: userId, product_id: productId } });
        if (!product) return res.status(404).json({ message: 'Product not found!' });

        await product.destroy();

        return res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };