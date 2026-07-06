import { models } from '../models/index.js';

const { Notifications } = models;

const NotificationController = {
    // Get all notifications for the current user
    async getNotifications(req, res) {
        try {
            const { user_id } = req.user;
            const notifications = await Notifications.findAll({
                where: { user_id },
                order: [['createdAt', 'DESC']],
                limit: 50 // Limit to latest 50 notifications
            });
            res.json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Error fetching notifications', error: error.message });
        }
    },

    // Get unread notification count
    async getUnreadCount(req, res) {
        try {
            const { user_id } = req.user;
            const count = await Notifications.count({
                where: { user_id, is_read: false }
            });
            res.json({ unreadCount: count });
        } catch (error) {
            console.error('Error fetching unread count:', error);
            res.status(500).json({ message: 'Error fetching unread count', error: error.message });
        }
    },

    // Mark a specific notification as read
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const { user_id } = req.user;
            
            const notification = await Notifications.findOne({
                where: { notification_id: id, user_id }
            });

            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            notification.is_read = true;
            await notification.save();

            res.json({ message: 'Notification marked as read', notification });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Error marking notification as read', error: error.message });
        }
    },

    // Mark all notifications as read for the user
    async markAllAsRead(req, res) {
        try {
            const { user_id } = req.user;
            await Notifications.update(
                { is_read: true },
                { where: { user_id, is_read: false } }
            );
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
        }
    }
};

export default NotificationController;
