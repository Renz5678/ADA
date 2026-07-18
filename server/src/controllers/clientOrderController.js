import { models } from '../models/index.js';
import { validationResult } from 'express-validator';
import transporter from '../utils/mailer.js';
import { getNewOrderRequestHtml } from '../utils/emailTemplates.js';
import { sendToUser } from '../controllers/sseController.js';

const { PendingOrders, Clients, Users } = models;

export const getClientOrders = async (req, res) => {
    try {
        const client_id = req.client.id;

        const orders = await models.Orders.findAll({
            where: { client_id },
            include: [
                {
                    model: Users,
                    attributes: ['business_name', 'email']
                },
                {
                    model: models.OrderItem,
                    include: [{
                        model: models.Product,
                        attributes: ['product_name', 'image_url']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ orders });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
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

        // Ensure the client can only request from their assigned freelancer
        if (client.freelancer_id && client.freelancer_id !== Number(freelancer_id)) {
            return res.status(403).json({ message: 'You can only request orders from your assigned freelancer.' });
        }

        // --- Build item snapshot ---
        let calculated_total = 0;
        const itemsSnapshot = [];

        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const product = await models.Product.findOne({
                    where: { product_id: item.product_id, user_id: freelancer_id }
                });

                if (!product) {
                    return res.status(400).json({ message: `Product ${item.product_id} not found or doesn't belong to this freelancer.` });
                }

                const subtotal = Number(product.price) * Number(item.quantity);
                calculated_total += subtotal;

                itemsSnapshot.push({
                    product_id: item.product_id,
                    product_name: product.product_name,
                    quantity: item.quantity,
                    unit_price: Number(product.price),
                    subtotal
                });
            }
        } else {
            // Backwards compatibility: manual total with no items
            calculated_total = Number(total_amount);
        }

        // --- Save to PendingOrders (NOT Orders) ---
        const pending = await PendingOrders.create({
            freelancer_id: Number(freelancer_id),
            client_id,
            customer_name: client.name,
            total_amount: calculated_total,
            deadline: deadline || null,
            items_snapshot: itemsSnapshot,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h TTL
        });

        // Notify the client that their request is pending approval
        await models.Notifications.create({
            client_id,
            title: 'Order Request Submitted',
            message: `Your order request has been sent to your freelancer and is awaiting approval.`,
            type: 'INFO',
            reference_id: pending.pending_id,
            reference_type: 'ORDER'
        });

        // --- Push real-time SSE event to the freelancer (if online) ---
        sendToUser(req.app, Number(freelancer_id), 'new_order_request', {
            pending_id: pending.pending_id,
            client_name: client.name,
            total_amount: calculated_total,
            deadline: deadline || null,
            items: itemsSnapshot
        });

        // --- Send email to freelancer (async, non-blocking) ---
        Users.findByPk(freelancer_id).then(freelancer => {
            if (freelancer && freelancer.email) {
                const displayName = freelancer.business_name || freelancer.first_name || 'Freelancer';
                transporter.sendMail({
                    to: freelancer.email,
                    subject: `New Order Request from ${client.name} — ADA`,
                    html: getNewOrderRequestHtml(
                        displayName,
                        client.name,
                        itemsSnapshot,
                        calculated_total,
                        deadline || null
                    )
                }).catch(emailError => {
                    console.error('[Email] Failed to send order notification email:', emailError);
                });
            }
        }).catch(err => {
            console.error('[Email] Failed to fetch freelancer for email:', err);
        });

        return res.status(201).json({
            message: 'Order request submitted. Awaiting freelancer approval.',
            pending_id: pending.pending_id
        });
    } catch (e) {
        console.error('[createClientOrder]', e);
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};
