import { models } from '../models/index.js';

const { Users } = models;

export const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await Users.findAll({
            attributes: ['user_id', 'business_name', 'username', 'email'],
            where: {
                is_verified: true
            }
        });

        return res.status(200).json({ businesses });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
