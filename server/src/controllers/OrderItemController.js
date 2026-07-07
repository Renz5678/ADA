import { models, sequelize } from '../models/index.js';
import { validationResult } from 'express-validator';

const { OrderItem, Orders, Product, ProductMaterial, Material, MaterialTransaction } = models;

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
            include: [
                {
                    model: Orders,
                    where: {
                        user_id: userId,
                        order_id: orderId
                    },
                    attributes: []
                },
                {
                    model: Product,
                    attributes: ['product_id', 'product_name', 'product_code', 'price']
                }
            ]
        });

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

        if (!productId || !orderId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const { quantity } = req.body;

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

        const subtotal = Number(product.price) * Number(quantity);

        const productMaterials = await ProductMaterial.findAll({
            where: { product_id: productId },
            include: [{ model: Material, where: { user_id: userId } }]
        });

        const t = await sequelize.transaction();

        try {
            // Check materials and deduct
            for (const pm of productMaterials) {
                const requiredAmount = Number(pm.quantity_required) * Number(quantity);
                const material = pm.Material;

                if (Number(material.quantity) < requiredAmount) {
                    await t.rollback();
                    return res.status(400).json({ message: `Not enough stock for material: ${material.material_name}` });
                }

                await material.decrement('quantity', { by: requiredAmount, transaction: t });
                await MaterialTransaction.create({
                    material_id: material.material_id,
                    type: 'Usage',
                    quantity: requiredAmount,
                    unit_cost: material.unit_cost,
                    date_bought: new Date().toISOString().split('T')[0]
                }, { transaction: t });
            }

            const newOrderitem = await OrderItem.create({
                order_id: orderId,
                product_id: productId,
                quantity,
                subtotal
            }, { transaction: t });

            await order.increment('total_amount', { by: subtotal, transaction: t });

            await t.commit();

            return res.status(201).json({ message: 'New Order Item created!', data: newOrderitem });
        } catch (e) {
            await t.rollback();
            return res.status(500).json({ message: 'Internal Server Error!' });
        }
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

        const { quantity } = req.body;

        const orderItem = await OrderItem.findOne({
            where: { order_item_id: orderItemId },
            include: {
                model: Orders,
                where: { user_id: userId },
                attributes: []
            }
        });

        if (!orderItem) return res.status(404).json({ message: 'Order Item not found!' });

        if (quantity === undefined) {
            return res.status(200).json({ message: 'Nothing to update!' });
        }

        const product = await Product.findOne({ where: { product_id: orderItem.product_id } });
        const order = await Orders.findOne({ where: { order_id: orderItem.order_id } });

        const newSubtotal = Number(product.price) * Number(quantity);
        const subtotalDelta = newSubtotal - Number(orderItem.subtotal);
        const quantityDelta = Number(quantity) - Number(orderItem.quantity);

        const productMaterials = await ProductMaterial.findAll({
            where: { product_id: orderItem.product_id },
            include: [{ model: Material, where: { user_id: userId } }]
        });

        const t = await sequelize.transaction();

        try {
            if (quantityDelta > 0) {
                // Deduct more materials
                for (const pm of productMaterials) {
                    const requiredAmount = Number(pm.quantity_required) * quantityDelta;
                    const material = pm.Material;

                    if (Number(material.quantity) < requiredAmount) {
                        await t.rollback();
                        return res.status(400).json({ message: `Not enough stock for material: ${material.material_name}` });
                    }

                    await material.decrement('quantity', { by: requiredAmount, transaction: t });
                    await MaterialTransaction.create({
                        material_id: material.material_id,
                        type: 'Usage',
                        quantity: requiredAmount,
                        unit_cost: material.unit_cost,
                        date_bought: new Date().toISOString().split('T')[0]
                    }, { transaction: t });
                }
            } else if (quantityDelta < 0) {
                // Refund materials
                for (const pm of productMaterials) {
                    const refundAmount = Number(pm.quantity_required) * Math.abs(quantityDelta);
                    const material = pm.Material;

                    await material.increment('quantity', { by: refundAmount, transaction: t });
                    await MaterialTransaction.create({
                        material_id: material.material_id,
                        type: 'Purchase',
                        quantity: refundAmount,
                        unit_cost: material.unit_cost,
                        date_bought: new Date().toISOString().split('T')[0]
                    }, { transaction: t });
                }
            }

            await orderItem.update({ quantity, subtotal: newSubtotal }, { transaction: t });
            await order.increment('total_amount', { by: subtotalDelta, transaction: t });

            await t.commit();

            res.status(200).json({ message: 'Order Item updated successfully!' });
        } catch (e) {
            await t.rollback();
            return res.status(500).json({ message: 'Internal Server Error!' });
        }
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

        const order = await Orders.findOne({ where: { order_id: orderItem.order_id } });

        const productMaterials = await ProductMaterial.findAll({
            where: { product_id: orderItem.product_id },
            include: [{ model: Material, where: { user_id: userId } }]
        });

        const t = await sequelize.transaction();

        try {
            // Refund materials
            for (const pm of productMaterials) {
                const refundAmount = Number(pm.quantity_required) * Number(orderItem.quantity);
                const material = pm.Material;

                await material.increment('quantity', { by: refundAmount, transaction: t });
                await MaterialTransaction.create({
                    material_id: material.material_id,
                    type: 'Purchase', // Using Purchase to represent restock/refund
                    quantity: refundAmount,
                    unit_cost: material.unit_cost,
                    date_bought: new Date().toISOString().split('T')[0]
                }, { transaction: t });
            }

            await orderItem.destroy({ transaction: t });

            if (order) {
                await order.decrement('total_amount', { by: Number(orderItem.subtotal), transaction: t });
            }

            await t.commit();

            return res.status(200).json({ message: 'Order item deleted!' });
        } catch (e) {
            await t.rollback();
            return res.status(500).json({ message: 'Internal Server Error!' });
        }
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getOrderItems, getOrderItemById, getOrderItemsByProductid, getOrderItemsByOrderid, createOrderItem, updateOrderItem, deleteOrderitem };