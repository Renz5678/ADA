import { models, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

const { Orders, OrderItem, Expense, Product } = models;

const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || 'month';
        
        let dateFilter = {};
        const now = new Date();
        if (period === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { [Op.gte]: startOfDay };
        } else if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { [Op.gte]: startOfWeek };
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { [Op.gte]: startOfMonth };
        }

        const totalSales = await Orders.sum('total_amount', {
            where: { user_id: userId, status: { [Op.in]: ['Done', 'Delivered'] }, order_date: dateFilter }
        }) || 0;

        const totalExpenses = await Expense.sum('amount', {
            where: { user_id: userId, expense_date: dateFilter }
        }) || 0;

        const netProfit = totalSales - totalExpenses;

        return res.status(200).json({ totalSales, totalExpenses, netProfit });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity']
            ],
            include: [{
                model: Orders,
                attributes: [],
                where: { user_id: userId, status: { [Op.in]: ['Done', 'Delivered'] } }
            }, {
                model: Product,
                attributes: ['product_name', 'product_code']
            }],
            group: ['OrderItem.product_id', 'Product.product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5
        });

        return res.status(200).json(topProducts);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getWeakProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const weakProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity']
            ],
            include: [{
                model: Orders,
                attributes: [],
                where: { user_id: userId, status: { [Op.in]: ['Done', 'Delivered'] } }
            }, {
                model: Product,
                attributes: ['product_name', 'product_code']
            }],
            group: ['OrderItem.product_id', 'Product.product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'ASC']],
            limit: 5
        });

        return res.status(200).json(weakProducts);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getSalesByMonth = async (req, res) => {
    try {
        const userId = req.user.id;
        const sales = await Orders.findAll({
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('order_date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales']
            ],
            where: { user_id: userId, status: { [Op.in]: ['Done', 'Delivered'] } },
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('order_date'))],
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('order_date')), 'ASC']]
        });

        return res.status(200).json(sales);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getSummary, getTopProducts, getWeakProducts, getSalesByMonth };
