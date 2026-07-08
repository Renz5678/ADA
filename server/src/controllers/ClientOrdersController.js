import { models } from '../models/index.js';
import { validationResult } from 'express-validator';

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
        const { freelancer_id, total_amount, deadline } = req.body;

        const client = await Clients.findByPk(client_id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        // Ensure the freelancer they are requesting from is the one they are assigned to, or valid
        if (client.freelancer_id !== freelancer_id) {
            return res.status(403).json({ message: 'You can only request orders from your assigned freelancer.' });
        }

        const newOrder = await Orders.create({
            user_id: freelancer_id,
            client_id: client_id,
            customer_name: client.name,
            order_date: new Date().toISOString().split('T')[0],
            total_amount: total_amount,
            deadline: deadline || null,
            status: 'Awaiting Freelancer Confirmation'
        });

        return res.status(201).json({ message: 'Order requested successfully', order: newOrder });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
