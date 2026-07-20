import { models } from '../models/index.js';
import { destroyCloudinaryImage } from '../middleware/upload.js';
import { moderateText, moderateImage } from '../utils/geminiModeration.js';

const { Users } = models;

export const updateProfile = async (req, res) => {
    try {
        const { bio, description, theme_color, business_name, social_facebook, social_instagram, social_shopee, social_tiktok, social_twitter, social_linkedin } = req.body;
        const user_id = req.user.id; // From verifyToken middleware

        if (bio && bio.length > 200) {
            return res.status(400).json({ message: "Bio must be 200 characters or less." });
        }

        const user = await Users.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Text Moderation for unapproved users
        if (user.approval_status !== 'approved') {
            const textToModerate = `${bio || ''} ${description || ''} ${business_name || ''}`;
            const modResult = await moderateText(textToModerate);
            if (modResult.isFlagged) {
                return res.status(403).json({ message: `Profile update blocked by moderation: ${modResult.reason || 'Spam or inappropriate content detected'}` });
            }
        }

        user.bio = bio !== undefined ? bio : user.bio;
        user.description = description !== undefined ? description : user.description;
        user.theme_color = theme_color !== undefined ? theme_color : user.theme_color;
        if (business_name !== undefined && business_name.trim() !== '') {
            user.business_name = business_name.trim();
        }
        user.social_facebook = social_facebook !== undefined ? social_facebook : user.social_facebook;
        user.social_instagram = social_instagram !== undefined ? social_instagram : user.social_instagram;
        user.social_shopee = social_shopee !== undefined ? social_shopee : user.social_shopee;
        user.social_tiktok = social_tiktok !== undefined ? social_tiktok : user.social_tiktok;
        user.social_twitter = social_twitter !== undefined ? social_twitter : user.social_twitter;
        user.social_linkedin = social_linkedin !== undefined ? social_linkedin : user.social_linkedin;

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

        if (user.approval_status !== 'approved') {
            // Clean up uploaded files in req if they exist
            if (req.files) {
                if (req.files.profile_picture && req.files.profile_picture.length > 0) {
                    await destroyCloudinaryImage(req.files.profile_picture[0].path);
                }
                if (req.files.banner_image && req.files.banner_image.length > 0) {
                    await destroyCloudinaryImage(req.files.banner_image[0].path);
                }
            }
            return res.status(403).json({ message: 'You must be verified by an admin to upload pictures.' });
        }

        let updated = false;

        if (req.files) {
            if (req.files.profile_picture && req.files.profile_picture.length > 0) {
                const imgPath = req.files.profile_picture[0].path;
                const modResult = await moderateImage(imgPath);
                if (modResult.isFlagged) {
                    await destroyCloudinaryImage(imgPath);
                    return res.status(403).json({ message: `Profile picture blocked: ${modResult.reason || 'Inappropriate content detected'}` });
                }

                // Delete the old image from Cloudinary before replacing it
                await destroyCloudinaryImage(user.profile_picture);
                user.profile_picture = imgPath;
                updated = true;
            }
            if (req.files.banner_image && req.files.banner_image.length > 0) {
                const imgPath = req.files.banner_image[0].path;
                const modResult = await moderateImage(imgPath);
                if (modResult.isFlagged) {
                    await destroyCloudinaryImage(imgPath);
                    return res.status(403).json({ message: `Banner image blocked: ${modResult.reason || 'Inappropriate content detected'}` });
                }

                // Delete the old image from Cloudinary before replacing it
                await destroyCloudinaryImage(user.banner_image);
                user.banner_image = imgPath;
                updated = true;
            }
        }

        if (updated) {
            try {
                await user.save();
                return res.status(200).json({ message: "Images uploaded successfully.", user });
            } catch (saveError) {
                // Cleanup: If DB save fails, remove the newly uploaded images from Cloudinary
                if (req.files && req.files.profile_picture && req.files.profile_picture.length > 0) {
                    await destroyCloudinaryImage(req.files.profile_picture[0].path);
                }
                if (req.files && req.files.banner_image && req.files.banner_image.length > 0) {
                    await destroyCloudinaryImage(req.files.banner_image[0].path);
                }
                throw saveError;
            }
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
