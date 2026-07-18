import { models } from '../models/index.js';

export const getUsers = async (req, res) => {
    try {
        const users = await models.Users.findAll({
            attributes: [
                'user_id', 'username', 'email', 'business_name', 'role', 
                'approval_status', 'is_deleted', 'is_verified', 'createdAt',
                'profile_picture', 'banner_image', 'bio'
            ],
            include: [{
                model: models.Product,
                attributes: ['product_id', 'product_name', 'price', 'image_url', 'description']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { approval_status, is_deleted, warning_message } = req.body;
        
        const user = await models.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (approval_status !== undefined) user.approval_status = approval_status;
        if (is_deleted !== undefined) user.is_deleted = is_deleted;
        if (warning_message !== undefined) user.warning_message = warning_message;

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req, res) => {
    // Keeping this as an option for hard delete if needed, but normally we use soft delete
    try {
        const { id } = req.params;
        const user = await models.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ message: 'User hard deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await models.Feedback.findAll({
            include: [{
                model: models.Users,
                as: 'user',
                attributes: ['user_id', 'username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const feedback = await models.Feedback.findByPk(id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        feedback.status = status;
        await feedback.save();
        res.status(200).json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
};
