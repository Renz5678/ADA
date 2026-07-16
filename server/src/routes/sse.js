import express from 'express';
import { connectSse } from '../controllers/sseController.js';

const sseRouter = express.Router();

// GET /sse?token=<jwt>
// No authMiddleware here — SseController handles its own JWT validation
// because EventSource cannot send Authorization headers.
sseRouter.get('/', connectSse);

export default sseRouter;
