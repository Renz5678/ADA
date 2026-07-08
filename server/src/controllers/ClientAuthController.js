import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { models } from '../models/index.js';
import { validationResult } from 'express-validator';

const { Clients, Users } = models;

export const registerClient = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, freelancer_id } = req.body;

        // Verify freelancer exists
        const freelancer = await Users.findByPk(freelancer_id);
        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer not found!' });
        }

        const existingClient = await Clients.findOne({ where: { email } });
        if (existingClient) {
            return res.status(409).json({ message: 'Email already in use!' });
        }

        const newClient = await Clients.create({
            name,
            email,
            password,
            freelancer_id,
            is_verified: true // Assuming auto-verified for now since it's an invite flow
        });

        return res.status(201).json({ message: 'Client registered successfully!', client: newClient });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const loginClient = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const client = await Clients.findOne({ where: { email } });
        if (!client) return res.status(401).json({ message: 'Invalid credentials!' });

        const isPasswordCorrect = await bcrypt.compare(password, client.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials!' });

        const token = jwt.sign(
            {
                id: client.client_id,
                email: client.email,
                role: 'client'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        return res.status(200).json({ message: 'Login valid!', token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
