import { models } from '../models/index.js';

const { Users, Product } = models;

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

export const getBusinessDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const business = await Users.findOne({
            attributes: ['user_id', 'business_name', 'username', 'email'],
            where: {
                user_id: id,
                is_verified: true
            },
            include: [{
                model: Product,
                attributes: ['product_id', 'product_name', 'price']
            }]
        });

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        return res.status(200).json({ business });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
