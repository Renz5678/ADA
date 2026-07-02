import { models } from '../models/index.js';
import { validationResult } from 'express-validator';

const { Orders } = models;

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        let pageNumber = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;

        if (pageNumber < 1) pageNumber = 1;
        if (limit < 1) limit = 10;

        const offset = (pageNumber - 1) * limit;

        const { count, rows } = await Orders.findAndCountAll({
            where: {
                user_id: userId
            },
            order: [['order_date', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            orders: rows,
            totalCount: count,
            totalPages,
            currentPage: pageNumber
        });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Orders.findOne({
            where: {
                user_id: userId,
                order_id: orderId
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        return res.status(200).json(order);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;

        const { order_date, status } = req.body;
        const newOrder = await Orders.create({
            user_id: userId,
            order_date,
            total_amount: 0,
            status
        });

        return res.status(201).json({ message: 'Order created!', data: newOrder });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const orderId = req.params.id;
        const { order_date, status } = req.body;

        const order = await Orders.findOne({
            where: {
                user_id: userId,
                order_id: orderId
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        const updates = {};
        if (order_date !== undefined) updates.order_date = order_date;
        if (status !== undefined) updates.status = status;

        await order.update(updates);

        return res.status(200).json({ message: 'Order updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Orders.findOne({
            where: {
                user_id: userId,
                order_id: orderId
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        await order.destroy();
        return res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getOrders, getOrderById, createOrder, updateOrder, deleteOrder };