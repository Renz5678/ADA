import { models } from '../models/index.js';

const { Orders } = models;

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Orders.findAll({ where: { user_id: userId } });

        return res.status(200).json(orders);
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

        if (order === null) return res.status(404).json({ message: 'Order not found!' });

        return res.status(200).json(order);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const { order_date, total_amount, status } = req.body;
        const newOrder = await Orders.create({
            user_id: userId,
            order_date,
            total_amount,
            status
        });

        return res.status(201).json({ message: 'Order created!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const { order_date, total_amount, status } = req.body;

        const order = await Orders.findOne({
            where: { user_id: userId, order_id: orderId }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        order.order_date = order_date;
        order.total_amount = total_amount;
        order.status = status;
        await order.save();

        return res.status(200).json({ message: 'Order updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderid = req.params.id;

        const order = await Orders.findOne({
            where: { user_id: userId, order_id: orderId }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        await order.destroy();
        return res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};