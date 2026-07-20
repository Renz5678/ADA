import { models } from '../models/index.js';
import { Op } from 'sequelize';

const { Product } = models;

// Configurable via MAX_PRODUCT_IMAGES_PER_USER env var, defaults to 50
const MAX_PRODUCT_IMAGES = parseInt(process.env.MAX_PRODUCT_IMAGES_PER_USER ?? '50', 10);

/**
 * Middleware that blocks a new product image upload if the user already has
 * MAX_PRODUCT_IMAGES products with images stored.
 *
 * Must be placed BEFORE upload.single('image') in the route chain so that
 * no file is transmitted to Cloudinary when the limit is exceeded.
 *
 * Only applies when the incoming request actually contains a file upload.
 * Requests without an image (text-only product creation) pass through freely.
 */
export const checkProductImageLimit = async (req, res, next) => {
    // Only enforce the limit when a file is actually being sent.
    // Use a more robust check: the boundary param is always present in
    // legitimate multipart requests, so check for that specifically.
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data') || !contentType.includes('boundary=')) {
        return next();
    }

    try {
        const userId = req.user.id;
        const count = await Product.count({
            where: {
                user_id: userId,
                image_url: { [Op.ne]: null }
            }
        });

        if (count >= MAX_PRODUCT_IMAGES) {
            return res.status(429).json({
                message: `Image limit reached. You can have at most ${MAX_PRODUCT_IMAGES} product images. Delete or update existing products to free up space.`
            });
        }

        next();
    } catch (err) {
        console.error('[checkProductImageLimit] Error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
