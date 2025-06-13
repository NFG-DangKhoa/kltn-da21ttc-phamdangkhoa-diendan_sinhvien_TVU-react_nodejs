const Notification = require('../models/Notification');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

class AdminNotificationController {
    constructor() {
        this.io = null; // Will be injected by middleware
    }

    // Lấy danh sách thông báo với phân trang và filter
    async getNotifications(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                type,
                priority,
                isRead,
                dateFrom,
                dateTo,
                search
            } = req.query;

            // Build filter object
            const filter = {};

            if (type) filter.type = type;
            if (priority) filter.priority = priority;
            if (isRead !== undefined) filter.isRead = isRead === 'true';

            if (dateFrom || dateTo) {
                filter.createdAt = {};
                if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
                if (dateTo) filter.createdAt.$lte = new Date(dateTo);
            }

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const [notifications, totalCount] = await Promise.all([
                Notification.find(filter)
                    .populate('recipient', 'fullName email avatarUrl')
                    .populate('sender', 'fullName email avatarUrl')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Notification.countDocuments(filter)
            ]);

            res.json({
                success: true,
                notifications,
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit)
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách thông báo',
                error: error.message
            });
        }
    }

    // Lấy thống kê thông báo
    async getNotificationStats(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [
                totalNotifications,
                totalUnread,
                totalRead,
                todayNotifications,
                typeStats,
                priorityStats
            ] = await Promise.all([
                Notification.countDocuments(),
                Notification.countDocuments({ isRead: false }),
                Notification.countDocuments({ isRead: true }),
                Notification.countDocuments({ createdAt: { $gte: today } }),
                Notification.aggregate([
                    { $group: { _id: '$type', count: { $sum: 1 } } }
                ]),
                Notification.aggregate([
                    { $group: { _id: '$priority', count: { $sum: 1 } } }
                ])
            ]);

            res.json({
                success: true,
                totalNotifications,
                totalUnread,
                totalRead,
                todayNotifications,
                typeStats,
                priorityStats
            });
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê thông báo',
                error: error.message
            });
        }
    }

    // Gửi thông báo broadcast
    async sendBroadcastNotification(req, res) {
        try {
            const {
                title,
                message,
                type = 'announcement',
                priority = 'normal',
                targetRole = 'all',
                expiresAt,
                actionUrl
            } = req.body;

            // Validation
            if (!title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Tiêu đề và nội dung thông báo là bắt buộc'
                });
            }

            // Lấy danh sách users theo targetRole
            let userFilter = {};
            if (targetRole !== 'all') {
                userFilter.role = targetRole;
            }

            const users = await User.find(userFilter).select('_id');

            // Tạo thông báo cho từng user
            const notifications = [];
            for (const user of users) {
                const notification = new Notification({
                    recipient: user._id,
                    sender: req.user.id, // Admin gửi
                    type,
                    title,
                    message,
                    priority,
                    actionUrl,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    metadata: {
                        isBroadcast: true,
                        targetRole,
                        sentBy: req.user.id
                    }
                });

                await notification.save();
                await notification.populate([
                    { path: 'sender', select: 'fullName username avatarUrl' },
                    { path: 'recipient', select: 'fullName username' }
                ]);

                // Gửi realtime notification
                if (this.io) {
                    const roomName = `user_${user._id}`;
                    this.io.to(roomName).emit('newNotification', {
                        id: notification._id,
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        sender: notification.sender,
                        priority: notification.priority,
                        actionUrl: notification.actionUrl,
                        createdAt: notification.createdAt
                    });
                }

                notifications.push(notification);
            }

            res.json({
                success: true,
                message: `Đã gửi thông báo đến ${notifications.length} người dùng`,
                sentCount: notifications.length
            });
        } catch (error) {
            console.error('Error sending broadcast notification:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi gửi thông báo broadcast',
                error: error.message
            });
        }
    }

    // Gửi thông báo cá nhân
    async sendIndividualNotification(req, res) {
        try {
            const {
                userId,
                title,
                message,
                type = 'announcement',
                priority = 'normal',
                actionUrl
            } = req.body;

            // Validation
            if (!userId || !title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, tiêu đề và nội dung thông báo là bắt buộc'
                });
            }

            // Kiểm tra user tồn tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Tạo thông báo
            const notification = new Notification({
                recipient: userId,
                sender: req.user.id, // Admin gửi
                type,
                title,
                message,
                priority,
                actionUrl,
                metadata: {
                    isBroadcast: false,
                    sentBy: req.user.id
                }
            });

            await notification.save();
            await notification.populate([
                { path: 'sender', select: 'fullName username avatarUrl' },
                { path: 'recipient', select: 'fullName username' }
            ]);

            // Gửi realtime notification
            if (this.io) {
                const roomName = `user_${userId}`;
                this.io.to(roomName).emit('newNotification', {
                    id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    sender: notification.sender,
                    priority: notification.priority,
                    actionUrl: notification.actionUrl,
                    createdAt: notification.createdAt
                });
            }

            res.json({
                success: true,
                message: 'Đã gửi thông báo thành công',
                notification
            });
        } catch (error) {
            console.error('Error sending individual notification:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi gửi thông báo cá nhân',
                error: error.message
            });
        }
    }

    // Xóa thông báo
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;

            const notification = await Notification.findById(id);
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }

            await Notification.findByIdAndDelete(id);

            res.json({
                success: true,
                message: 'Đã xóa thông báo thành công'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa thông báo',
                error: error.message
            });
        }
    }

    // Xóa nhiều thông báo
    async bulkDeleteNotifications(req, res) {
        try {
            const { ids } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Danh sách ID thông báo không hợp lệ'
                });
            }

            const result = await Notification.deleteMany({
                _id: { $in: ids }
            });

            res.json({
                success: true,
                message: `Đã xóa ${result.deletedCount} thông báo`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error bulk deleting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa nhiều thông báo',
                error: error.message
            });
        }
    }

    // Đánh dấu thông báo đã đọc
    async markAsRead(req, res) {
        try {
            const { id } = req.params;

            const notification = await Notification.findByIdAndUpdate(
                id,
                {
                    isRead: true,
                    readAt: new Date()
                },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }

            res.json({
                success: true,
                message: 'Đã đánh dấu thông báo đã đọc',
                notification
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đánh dấu thông báo đã đọc',
                error: error.message
            });
        }
    }

    // Lấy template thông báo
    async getNotificationTemplates(req, res) {
        try {
            const templates = [
                {
                    id: 'welcome',
                    name: 'Chào mừng người dùng mới',
                    type: 'announcement',
                    title: 'Chào mừng bạn đến với diễn đàn TVU!',
                    message: 'Cảm ơn bạn đã tham gia cộng đồng diễn đàn TVU. Hãy khám phá và chia sẻ kiến thức cùng chúng tôi!'
                },
                {
                    id: 'maintenance',
                    name: 'Thông báo bảo trì',
                    type: 'system_maintenance',
                    title: 'Thông báo bảo trì hệ thống',
                    message: 'Hệ thống sẽ được bảo trì từ {startTime} đến {endTime}. Vui lòng lưu ý thời gian để tránh gián đoạn.'
                },
                {
                    id: 'feature_update',
                    name: 'Cập nhật tính năng',
                    type: 'feature_update',
                    title: 'Tính năng mới đã được cập nhật!',
                    message: 'Chúng tôi đã thêm những tính năng mới để cải thiện trải nghiệm của bạn. Hãy khám phá ngay!'
                }
            ];

            res.json({
                success: true,
                templates
            });
        } catch (error) {
            console.error('Error fetching notification templates:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy template thông báo',
                error: error.message
            });
        }
    }

    // Lấy thống kê chi tiết theo thời gian
    async getDetailedStats(req, res) {
        try {
            const { period = '7d' } = req.query;

            let dateRange;
            const now = new Date();

            switch (period) {
                case '24h':
                    dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const stats = await Notification.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateRange }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            type: "$type"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.date": 1 }
                }
            ]);

            res.json({
                success: true,
                stats,
                period
            });
        } catch (error) {
            console.error('Error fetching detailed stats:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê chi tiết',
                error: error.message
            });
        }
    }
}

module.exports = AdminNotificationController;
