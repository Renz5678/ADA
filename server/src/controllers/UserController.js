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

export { getUsernameAndBusinessName };