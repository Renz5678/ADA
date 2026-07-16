import { models } from "../models/index.js";

const { Users } = models;

const getUsernameAndBusinessName = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await Users.findOne({
            where: { user_id: userId },
            attributes: ['username', 'business_name', 'email']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to fetch user' });
    }
};
const updateBusinessName = async (req, res) => {
    try {
        const userId = req.user.id;
        const { business_name } = req.body;

        if (!business_name || business_name.trim() === '') {
            return res.status(400).json({ message: 'Business name is required' });
        }

        const user = await Users.findOne({ where: { user_id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.business_name = business_name;
        await user.save();

        return res.status(200).json({ message: 'Business name updated successfully', user: { username: user.username, business_name: user.business_name, email: user.email } });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to update business name' });
    }
};

export { getUsernameAndBusinessName, updateBusinessName };