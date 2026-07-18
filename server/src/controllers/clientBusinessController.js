import { models } from '../models/index.js';

const { Users, Product } = models;

export const getAllBusinesses = async (req, res) => {
    try {
        const businesses = await Users.findAll({
            attributes: ['user_id', 'business_name', 'username', 'email', 'profile_picture', 'bio', 'banner_image', 'theme_color', 'description', 'social_facebook', 'social_instagram', 'social_shopee', 'social_tiktok', 'social_twitter', 'social_linkedin'],
            where: {
                is_verified: true
            }
        });

        return res.status(200).json({ businesses });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};

export const getBusinessDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const business = await Users.findOne({
            attributes: ['user_id', 'business_name', 'username', 'email', 'profile_picture', 'banner_image', 'bio', 'description', 'theme_color', 'social_facebook', 'social_instagram', 'social_shopee', 'social_tiktok', 'social_twitter', 'social_linkedin'],
            where: {
                user_id: id,
                is_verified: true
            },
            include: [{
                model: Product,
                attributes: ['product_id', 'product_name', 'price', 'image_url', 'description', 'estimated_days']
            }]
        });

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        return res.status(200).json({ business });
    } catch (e) {
        console.error('Error in controller:', e);
        return res.status(500).json({ message: `Server Error: ${e.message || 'An unexpected error occurred.'}`, error: e.name });
    }
};
