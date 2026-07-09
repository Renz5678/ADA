import { models, sequelize } from '../models/index.js';
import { validationResult } from 'express-validator';
import transporter from '../utils/mailer.js';

const { Orders, Clients, Users } = models;

export const getClientOrders = async (req, res) => {
    try {
        const client_id = req.client.id;

        const orders = await Orders.findAll({
            where: { client_id },
            include: [{
                model: Users,
                attributes: ['business_name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ orders });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const createClientOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const client_id = req.client.id;
        const { freelancer_id, total_amount, deadline, items } = req.body;

        const client = await Clients.findByPk(client_id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        // Ensure the freelancer they are requesting from is the one they are assigned to, or valid
        if (client.freelancer_id && client.freelancer_id !== Number(freelancer_id)) {
            return res.status(403).json({ message: 'You can only request orders from your assigned freelancer.' });
        }

        const t = await sequelize.transaction();
        
        try {
            let calculated_total = 0;
            const orderItemsToCreate = [];

            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    const product = await models.Product.findOne({
                        where: { product_id: item.product_id, user_id: freelancer_id },
                        transaction: t
                    });

                    if (!product) {
                        throw new Error(`Product ${item.product_id} not found or doesn't belong to this freelancer.`);
                    }

                    const subtotal = Number(product.price) * Number(item.quantity);
                    calculated_total += subtotal;

                    orderItemsToCreate.push({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        subtotal: subtotal
                    });
                }
            } else {
                // Fallback to manual total_amount if no items are provided (backwards compatibility)
                calculated_total = Number(total_amount);
            }

            const newOrder = await Orders.create({
                user_id: freelancer_id,
                client_id: client_id,
                customer_name: client.name,
                order_date: new Date().toISOString().split('T')[0],
                total_amount: calculated_total,
                deadline: deadline || null,
                status: 'Awaiting Freelancer Confirmation'
            }, { transaction: t });

            if (orderItemsToCreate.length > 0) {
                const finalOrderItems = orderItemsToCreate.map(item => ({
                    ...item,
                    order_id: newOrder.order_id
                }));
                await models.OrderItem.bulkCreate(finalOrderItems, { transaction: t });
            }

            await models.Notifications.create({
                user_id: freelancer_id,
                title: 'New Order Request',
                message: `You have received a new order request from ${client.name}`,
                type: 'INFO',
                reference_id: newOrder.order_id,
                reference_type: 'ORDER'
            }, { transaction: t });

            await t.commit();

            // Fetch freelancer email to send the alert
            const freelancer = await Users.findByPk(freelancer_id);
            if (freelancer && freelancer.email) {
                try {
                    await transporter.sendMail({
                        to: freelancer.email,
                        subject: 'New Order Request on ADA',
                        text: `Hello ${freelancer.business_name || freelancer.first_name || 'Freelancer'},\n\nYou have received a new order request from ${client.name} for a total of ₱${calculated_total.toFixed(2)}.\n\nPlease log in to your ADA dashboard to review and confirm the order.\n\nBest regards,\nThe ADA Team`
                    });
                } catch (emailError) {
                    console.error('Failed to send order notification email:', emailError);
                }
            }

            return res.status(201).json({ message: 'Order requested successfully', order: newOrder });
        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(400).json({ message: error.message || 'Failed to create order' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
