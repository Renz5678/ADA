import express from 'express';
import { getPublicFreelancers, getPublicFreelancerProfile } from '../controllers/marketplaceController.js';

const marketplaceRouter = express.Router();

marketplaceRouter.get('/freelancers', getPublicFreelancers);
marketplaceRouter.get('/freelancer/:id', getPublicFreelancerProfile);

export default marketplaceRouter;
