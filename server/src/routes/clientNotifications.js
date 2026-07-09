import express from 'express';
import { 
    getClientNotifications, 
    getClientUnreadCount, 
    markClientNotificationAsRead, 
    markAllClientNotificationsAsRead 
} from '../controllers/ClientNotificationsController.js';
import clientAuthMiddleware from '../middleware/clientAuthMiddleware.js';

const clientNotificationRouter = express.Router();

clientNotificationRouter.use(clientAuthMiddleware);

clientNotificationRouter.get('/', getClientNotifications);
clientNotificationRouter.get('/unread-count', getClientUnreadCount);
clientNotificationRouter.put('/mark-all-read', markAllClientNotificationsAsRead);
clientNotificationRouter.put('/:id/read', markClientNotificationAsRead);

export default clientNotificationRouter;
