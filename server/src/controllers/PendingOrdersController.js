import { models } from '../models/index.js';

/**
 * GET /pending-orders
 * Returns all pending order requests for the currently authenticated freelancer.
 */
export const getPendingOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const pendingOrders = await models.PendingOrders.findAll({
            where: { freelancer_id: userId },
            include: [
                {
                    model: models.Clients,
                    attributes: ['name', 'email']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json(pendingOrders);
    } catch (e) {
        console.error('[getPendingOrders]', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
