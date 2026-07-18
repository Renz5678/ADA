import { models } from '../models/index.js';

export const getPublicFreelancers = async (req, res) => {
    try {
        const freelancers = await models.Users.findAll({
            attributes: [
                'user_id',
                'username',
                'business_name',
                'bio',
                'profile_picture',
                'banner_image',
                'theme_color',
                'description'
            ],
            where: {
                approval_status: 'approved',
                is_deleted: false
            }
        });

        res.status(200).json(freelancers);
    } catch (e) {
        console.error('Error fetching public freelancers:', e);
        res.status(500).json({ error: 'Failed to fetch public freelancers' });
    }
};

export const getPublicFreelancerProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const freelancer = await models.Users.findByPk(id, {
            attributes: [
                'user_id',
                'username',
                'business_name',
                'bio',
                'profile_picture',
                'banner_image',
                'theme_color',
                'description'
            ],
            where: {
                approval_status: 'approved',
                is_deleted: false
            },
            include: [{
                model: models.Product,
                attributes: [
                    'product_id',
                    'product_code',
                    'product_name',
                    'price',
                    'image_url',
                    'description',
                    'estimated_days'
                ]
            }]
        });

        if (!freelancer) {
            return res.status(404).json({ error: 'Freelancer not found' });
        }

        res.status(200).json(freelancer);
    } catch (e) {
        console.error('Error fetching public freelancer profile:', e);
        res.status(500).json({ error: 'Failed to fetch freelancer profile' });
    }
};
