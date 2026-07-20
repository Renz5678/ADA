import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'freelancer_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }] // basic optimization
  }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Extracts the Cloudinary public_id from a secure URL and destroys the asset.
 * e.g. "https://res.cloudinary.com/cloud/image/upload/v123/freelancer_profiles/abc.jpg"
 *   → destroys "freelancer_profiles/abc"
 *
 * This is intentionally non-fatal: if Cloudinary deletion fails for any reason
 * (already deleted, network issue, etc.) the error is logged but does not
 * propagate — the calling DB operation should always proceed.
 */
export const destroyCloudinaryImage = async (url) => {
    if (!url) return;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return;
        // Strip leading version segment (v1234567890/) then file extension
        const withoutVersion = parts[1].replace(/^v\d+\//, '');
        const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('[Cloudinary] Failed to delete image:', url, err.message);
    }
};

export default upload;

