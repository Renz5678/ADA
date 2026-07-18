import { models } from "../models/index.js";
import { Op } from "sequelize";

const { Orders, Product, Expense, Material } = models;

const globalSearch = async (req, res) => {
    try {
        const userId = req.user.id;
        const q = req.query.q || '';

        if (!q.trim()) {
            return res.status(200).json({ orders: [], products: [], expenses: [], materials: [] });
        }

        const isNumeric = !isNaN(Number(q));

        // 1. Search Orders
        let orders = [];
        if (isNumeric) {
            orders = await Orders.findAll({
                where: { user_id: userId, order_id: Number(q) },
                limit: 5,
                order: [['order_date', 'DESC']]
            });
        }

        // 2. Search Products
        const products = await Product.findAll({
            where: {
                user_id: userId,
                [Op.or]: [
                    { product_code: { [Op.iLike]: `%${q}%` } },
                    { product_name: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 5
        });

        // 3. Search Expenses
        const expenses = await Expense.findAll({
            where: {
                user_id: userId,
                [Op.or]: [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { category: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 5
        });

        // 4. Search Materials
        const materials = await Material.findAll({
            where: {
                user_id: userId,
                [Op.or]: [
                    { material_code: { [Op.iLike]: `%${q}%` } },
                    { material_name: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 5
        });

        return res.status(200).json({
            orders,
            products,
            expenses,
            materials
        });

    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

export { globalSearch };
