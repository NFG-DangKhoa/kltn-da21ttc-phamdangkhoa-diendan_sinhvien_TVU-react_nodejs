const Notification = require('../models/Notification');
const User = require('../models/User');

// Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const userId = req.user.id;

        const query = {
            recipient: userId,
            isVisible: true
        };

        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'fullName username avatarUrl')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalNotifications = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
            isVisible: true
        });

        res.json({
            notifications,
            totalNotifications,
            unreadCount,
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit)
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông báo' });
    }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        res.json({ message: 'Đã đánh dấu đọc thông báo', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Lỗi khi đánh dấu thông báo' });
    }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'Đã đánh dấu tất cả thông báo đã đọc' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Lỗi khi đánh dấu thông báo' });
    }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isVisible: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        res.json({ message: 'Đã xóa thông báo' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Lỗi khi xóa thông báo' });
    }
};

// Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
            isVisible: true
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Lỗi khi lấy số thông báo chưa đọc' });
    }
};

// ADMIN: Tạo thông báo broadcast
exports.createBroadcastNotification = async (req, res) => {
    try {
        const { title, message, targetRole, priority = 'normal', expiresAt } = req.body;
        const adminId = req.user._id;

        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền thực hiện' });
        }

        let users;
        if (targetRole && targetRole !== 'all') {
            users = await User.find({ role: targetRole });
        } else {
            users = await User.find({});
        }

        const notifications = [];
        for (const user of users) {
            const notification = new Notification({
                recipient: user._id,
                sender: adminId,
                type: 'announcement',
                title,
                message,
                priority,
                icon: 'campaign',
                color: '#9c27b0',
                expiresAt: expiresAt ? new Date(expiresAt) : null
            });

            await notification.save();
            notifications.push(notification);

            // Gửi realtime notification
            req.io.to(`user_${user._id}`).emit('newNotification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                priority: notification.priority,
                icon: notification.icon,
                color: notification.color,
                timeAgo: 'Vừa xong',
                createdAt: notification.createdAt
            });
        }

        res.json({
            message: `Đã gửi thông báo đến ${users.length} người dùng`,
            notificationCount: notifications.length
        });
    } catch (error) {
        console.error('Error creating broadcast notification:', error);
        res.status(500).json({ message: 'Lỗi khi tạo thông báo broadcast' });
    }
};

// ADMIN: Gửi thông báo cho user cụ thể
exports.createUserNotification = async (req, res) => {
    try {
        const { userId, title, message, type = 'announcement', priority = 'normal' } = req.body;
        const adminId = req.user._id;

        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền thực hiện' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const notification = new Notification({
            recipient: userId,
            sender: adminId,
            type,
            title,
            message,
            priority,
            icon: 'admin_panel_settings',
            color: '#f44336'
        });

        await notification.save();

        // Gửi realtime notification
        req.io.to(`user_${userId}`).emit('newNotification', {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            icon: notification.icon,
            color: notification.color,
            timeAgo: 'Vừa xong',
            createdAt: notification.createdAt
        });

        res.json({
            message: 'Đã gửi thông báo đến người dùng',
            notification
        });
    } catch (error) {
        console.error('Error creating user notification:', error);
        res.status(500).json({ message: 'Lỗi khi tạo thông báo cho user' });
    }
};

// ADMIN: Lấy thống kê thông báo
exports.getNotificationStats = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền thực hiện' });
        }

        const stats = await Notification.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unreadCount: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalNotifications = await Notification.countDocuments();
        const totalUnread = await Notification.countDocuments({ isRead: false });

        res.json({
            stats,
            totalNotifications,
            totalUnread
        });
    } catch (error) {
        console.error('Error getting notification stats:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê thông báo' });
    }
};
