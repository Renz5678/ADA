import { models } from '../models/index.js';
import { validationResult } from 'express-validator';

const { OrderItem, Orders, Product } = models;

const getOrderItems = async (req, res) => {
    try {
        const userId = req.user.id;

        const orderItems = await OrderItem.findAll({
            include: {
                model: Orders,
                where: { user_id: userId },
                attributes: []
            }
        });

        return res.status(200).json(orderItems);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getOrderItemById = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderItemId = req.params.id;

        const orderItem = await OrderItem.findOne({
            where: { order_item_id: orderItemId },
            include: {
                model: Orders,
                where: { user_id: userId },
                attributes: []
            }
        });

        if (!orderItem) return res.status(404).json({ message: 'Order Item not found!' });

        return res.status(200).json(orderItem);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getOrderItemsByOrderid = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const orderItem = await OrderItem.findAll({
            include: {
                model: Orders,
                where: {
                    user_id: userId,
                    order_id: orderId
                },
                attributes: []
            }
        });

        if (orderItem.length === 0) return res.status(404).json({ message: 'Order Item not found!' });

        return res.status(200).json(orderItem);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getOrderItemsByProductid = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const orderItem = await OrderItem.findAll({
            include: {
                model: Product,
                where: {
                    user_id: userId,
                    product_id: productId
                },
                attributes: []
            }
        });

        if (orderItem.length === 0) return res.status(404).json({ message: 'Order Item not found!' });

        return res.status(200).json(orderItem);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createOrderItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const productId = req.body.product_id;
        const orderId = req.body.order_id;

        const { quantity, subtotal } = req.body;

        const product = await Product.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (!product) return res.status(404).json({ message: 'Product not found!' });

        const order = await Orders.findOne({
            where: {
                user_id: userId,
                order_id: orderId
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        const newOrderitem = await OrderItem.create({
            order_id: orderId,
            product_id: productId,
            quantity, subtotal
        });

        return res.status(201).json({ message: 'New Order Item created!', data: newOrderitem });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateOrderItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const orderItemId = req.params.id;

        const { quantity, subtotal } = req.body;

        const orderItem = await OrderItem.findOne({
            where: { order_item_id: orderItemId },
            include: {
                model: Orders,
                where: { user_id: userId },
                attributes: []
            }
        });

        if (!orderItem) return res.status(404).json({ message: 'Order Item not found!' });

        const updates = {};
        if (quantity !== undefined) updates.quantity = quantity;
        if (subtotal !== undefined) updates.subtotal = subtotal;

        await orderItem.update(updates);

        res.status(200).json({ message: 'Order Item updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteOrderitem = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderItemId = req.params.id;

        const orderItem = await OrderItem.findOne({
            where: { order_item_id: orderItemId },
            include: {
                model: Orders,
                where: { user_id: userId },
                attributes: []
            }
        });

        if (!orderItem) return res.status(404).json({ message: 'Order Item not found!' });

        await orderItem.destroy();

        return res.status(200).json({ message: 'Order item deleted!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getOrderItems, getOrderItemById, getOrderItemsByProductid, getOrderItemsByOrderid, createOrderItem, updateOrderItem, deleteOrderitem };