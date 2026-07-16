import { models, sequelize } from '../models/index.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

const { Orders } = models;

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        let pageNumber = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;

        if (pageNumber < 1) pageNumber = 1;
        if (limit < 1) limit = 10;

        const offset = (pageNumber - 1) * limit;

        const whereClause = {
            [Op.and]: [
                { user_id: userId }
            ]
        };

        if (req.query.status) {
            whereClause[Op.and].push({ status: req.query.status });
        }

        if (req.query.search) {
            whereClause[Op.and].push(
                sequelize.where(
                    sequelize.cast(sequelize.col('order_id'), 'varchar'),
                    { [Op.like]: `%${req.query.search}%` }
                )
            );
        }

        const { count, rows } = await Orders.findAndCountAll({
            where: whereClause,
            include: [{
                model: models.Clients,
                attributes: ['name', 'email']
            }],
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
            },
            include: [{
                model: models.Clients,
                attributes: ['name', 'email']
            }]
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
        const { order_date, status, deadline, customer_name } = req.body;
        const newOrder = await Orders.create({
            user_id: userId,
            order_date,
            deadline: deadline || null,
            customer_name: customer_name || null,
            total_amount: 0,
            status
        });

        const { Tasks } = models;
        if (Tasks) {
            await Tasks.create({
                user_id: userId,
                title: `Fulfill Order #${newOrder.order_id}`,
                deadline: deadline || null,
                status: 'Not Started',
                related_order_id: newOrder.order_id
            });
        }

        return res.status(201).json({ message: 'Order created!', data: newOrder });
    } catch (e) {
        console.error('Error creating order:', e);
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
        const { order_date, status, deadline, customer_name } = req.body;

        const order = await Orders.findOne({
            where: {
                user_id: userId,
                order_id: orderId
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found!' });

        const updates = {};
        if (order_date !== undefined) updates.order_date = order_date;
        
        if (status !== undefined && status !== order.status) {
            updates.status = status;
            
            if (order.client_id) {
                await models.Notifications.create({
                    client_id: order.client_id,
                    title: 'Order Status Updated',
                    message: `Your order #${order.order_id} has been updated to: ${status}`,
                    type: 'INFO',
                    reference_id: order.order_id,
                    reference_type: 'ORDER'
                });
            }
        } else if (status !== undefined) {
            updates.status = status;
        }

        if (deadline !== undefined) updates.deadline = deadline;
        if (customer_name !== undefined) updates.customer_name = customer_name;

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

        const { OrderItem, ProductMaterial, Material, MaterialTransaction } = models;
        const orderItems = await OrderItem.findAll({ where: { order_id: orderId } });

        const t = await sequelize.transaction();

        try {
            for (const item of orderItems) {
                const productMaterials = await ProductMaterial.findAll({
                    where: { product_id: item.product_id },
                    include: [{ model: Material, where: { user_id: userId } }]
                });

                for (const pm of productMaterials) {
                    const refundAmount = Number(pm.quantity_required) * Number(item.quantity);
                    const material = pm.Material;

                    await material.increment('quantity', { by: refundAmount, transaction: t });
                    await MaterialTransaction.create({
                        material_id: material.material_id,
                        type: 'Purchase', // Refund
                        quantity: refundAmount,
                        unit_cost: material.unit_cost,
                        date_bought: new Date().toISOString().split('T')[0]
                    }, { transaction: t });
                }
                await item.destroy({ transaction: t });
            }

            await order.destroy({ transaction: t });
            await t.commit();
            return res.status(200).json({ message: 'Order deleted successfully!' });
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ message: 'Internal Server Error!' });
        }
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalRevenue = await Orders.sum('total_amount', {
            where: { user_id: userId, status: { [Op.in]: ['Done', 'Delivered'] } }
        });
        const activeOrdersCount = await Orders.count({
            where: { user_id: userId, status: { [Op.notIn]: ['Cancelled', 'Done', 'Delivered'] } }
        });

        return res.status(200).json({
            totalRevenue: totalRevenue || 0,
            activeOrdersCount: activeOrdersCount || 0
        });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const getScheduledOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const scheduledOrders = await Orders.findAll({
            where: {
                user_id: userId,
                status: { [Op.notIn]: ['Done', 'Delivered', 'Cancelled'] }
            },
            order: [
                ['deadline', 'ASC'],
                ['total_amount', 'DESC']
            ],
            limit: 5
        });

        return res.status(200).json(scheduledOrders);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrderStats, getScheduledOrders };

// ─── Approve a pending client order request ───────────────────────────────────
export const approveOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const pendingId = req.params.pendingId;

        const { PendingOrders, Clients } = models;

        const pending = await PendingOrders.findOne({
            where: { pending_id: pendingId, freelancer_id: userId }
        });

        if (!pending) {
            return res.status(404).json({ message: 'Pending order not found or already processed.' });
        }

        const t = await sequelize.transaction();
        try {
            // Create the real Order
            const newOrder = await Orders.create({
                user_id: userId,
                client_id: pending.client_id,
                customer_name: pending.customer_name,
                order_date: new Date().toISOString().split('T')[0],
                total_amount: pending.total_amount,
                deadline: pending.deadline || null,
                status: 'Pending'
            }, { transaction: t });

            // Create OrderItems from snapshot
            const itemsSnapshot = pending.items_snapshot || [];
            if (itemsSnapshot.length > 0) {
                await models.OrderItem.bulkCreate(
                    itemsSnapshot.map(item => ({
                        order_id: newOrder.order_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        subtotal: item.subtotal
                    })),
                    { transaction: t }
                );
            }

            // Create a Task for this order
            if (models.Tasks) {
                await models.Tasks.create({
                    user_id: userId,
                    title: `Fulfill Order #${newOrder.order_id}`,
                    deadline: pending.deadline || null,
                    status: 'Not Started',
                    related_order_id: newOrder.order_id
                }, { transaction: t });
            }

            // Notify client
            await models.Notifications.create({
                client_id: pending.client_id,
                title: 'Order Approved! 🎉',
                message: `Your order request has been approved by your freelancer. Order #${newOrder.order_id} is now being processed.`,
                type: 'INFO',
                reference_id: newOrder.order_id,
                reference_type: 'ORDER'
            }, { transaction: t });

            // Delete the pending record
            await pending.destroy({ transaction: t });

            await t.commit();

            // Return the new order to the freelancer
            return res.status(201).json({
                message: 'Order approved and created successfully.',
                order: newOrder
            });
        } catch (err) {
            await t.rollback();
            console.error('[approveOrder]', err);
            return res.status(500).json({ message: 'Failed to approve order.' });
        }
    } catch (e) {
        console.error('[approveOrder]', e);
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

// ─── Decline a pending client order request ───────────────────────────────────
export const declineOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const pendingId = req.params.pendingId;

        const { PendingOrders } = models;

        const pending = await PendingOrders.findOne({
            where: { pending_id: pendingId, freelancer_id: userId }
        });

        if (!pending) {
            return res.status(404).json({ message: 'Pending order not found or already processed.' });
        }

        // Notify client of the decline
        await models.Notifications.create({
            client_id: pending.client_id,
            title: 'Order Request Declined',
            message: `Unfortunately, your order request was declined by your freelancer. Please reach out for more details.`,
            type: 'INFO',
            reference_id: pending.pending_id,
            reference_type: 'ORDER'
        });

        await pending.destroy();

        return res.status(200).json({ message: 'Order request declined.' });
    } catch (e) {
        console.error('[declineOrder]', e);
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};