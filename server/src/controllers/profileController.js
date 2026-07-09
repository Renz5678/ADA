import { models } from '../models/index.js';

const { Users } = models;

export const updateProfile = async (req, res) => {
    try {
        const { bio, description, theme_color } = req.body;
        const user_id = req.user.id; // From verifyToken middleware

        if (bio && bio.length > 200) {
            return res.status(400).json({ message: "Bio must be 200 characters or less." });
        }

        const user = await Users.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.bio = bio !== undefined ? bio : user.bio;
        user.description = description !== undefined ? description : user.description;
        user.theme_color = theme_color !== undefined ? theme_color : user.theme_color;

        await user.save();

        res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const uploadProfileImages = async (req, res) => {
    try {
        const user_id = req.user.id;
        const user = await Users.findByPk(user_id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let updated = false;

        if (req.files) {
            if (req.files.profile_picture && req.files.profile_picture.length > 0) {
                user.profile_picture = req.files.profile_picture[0].path; // Cloudinary secure URL
                updated = true;
            }
            if (req.files.banner_image && req.files.banner_image.length > 0) {
                user.banner_image = req.files.banner_image[0].path;
                updated = true;
            }
        }

        if (updated) {
            await user.save();
            return res.status(200).json({ message: "Images uploaded successfully.", user });
        } else {
            return res.status(400).json({ message: "No images provided." });
        }
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const user = await Users.findByPk(user_id, {
            attributes: { exclude: ['password', 'verification_token'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
