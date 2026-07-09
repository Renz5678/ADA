import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { updateProfile, uploadProfileImages, getProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

router.post('/upload', authMiddleware, upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'banner_image', maxCount: 1 }
]), uploadProfileImages);

export default router;
