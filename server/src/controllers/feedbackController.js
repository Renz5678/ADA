import { models } from '../models/index.js';

export const createFeedback = async (req, res) => {
    try {
        const { type, title, description } = req.body;
        const user_id = req.user.id; // from authMiddleware

        if (!type || !title || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // The rate limiting is handled by the middleware in routes
        const feedback = await models.Feedback.create({
            user_id,
            type,
            title,
            description,
            status: 'open'
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};
