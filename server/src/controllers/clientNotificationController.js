import { models } from '../models/index.js';

export const getClientNotifications = async (req, res) => {
    try {
        const clientId = req.client.id;
        const notifications = await models.Notifications.findAll({
            where: { client_id: clientId },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json(notifications);
    } catch (e) {
        console.error('Error fetching client notifications:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getClientUnreadCount = async (req, res) => {
    try {
        const clientId = req.client.id;
        const count = await models.Notifications.count({
            where: { client_id: clientId, is_read: false }
        });
        return res.status(200).json({ count });
    } catch (e) {
        console.error('Error fetching unread count:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const markClientNotificationAsRead = async (req, res) => {
    try {
        const clientId = req.client.id;
        const notificationId = req.params.id;

        const notification = await models.Notifications.findOne({
            where: { client_id: clientId, notification_id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.update({ is_read: true });
        return res.status(200).json({ message: 'Notification marked as read' });
    } catch (e) {
        console.error('Error marking notification as read:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const markAllClientNotificationsAsRead = async (req, res) => {
    try {
        const clientId = req.client.id;
        await models.Notifications.update(
            { is_read: true },
            { where: { client_id: clientId, is_read: false } }
        );
        return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (e) {
        console.error('Error marking all notifications as read:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
