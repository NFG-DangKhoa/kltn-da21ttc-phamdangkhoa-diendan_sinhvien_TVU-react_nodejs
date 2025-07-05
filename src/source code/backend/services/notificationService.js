const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter (reuse from authController)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'phamdangkhoa.21092003@gmail.com',
        pass: process.env.EMAIL_PASS || 'stobuzyorabfjxnx'
    }
});

class NotificationService {
    constructor(io) {
        this.io = io;
    }

    // Tạo thông báo mới
    async createNotification({
        recipient,
        sender,
        type,
        title,
        message,
        relatedData = {},
        priority = 'normal',
        icon = 'notifications',
        color = '#1976d2',
        actionUrl = null,
        expiresAt = null,
        metadata = {}
    }) {
        try {
            const notification = new Notification({
                recipient,
                sender,
                type,
                title,
                message,
                relatedData,
                priority,
                icon,
                color,
                actionUrl,
                expiresAt,
                metadata
            });

            await notification.save();

            await notification.populate([
                { path: 'sender', select: 'fullName username avatarUrl' },
                { path: 'recipient', select: 'fullName username' }
            ]);

            // Gửi realtime notification
            this.sendRealtimeNotification(notification);

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Gửi thông báo realtime qua Socket.IO
    sendRealtimeNotification(notification) {
        if (this.io) {
            const recipientId = notification.recipient._id || notification.recipient;
            const roomName = `user_${recipientId}`;

            console.log(`🚀 Sending realtime notification to room: ${roomName}`);
            console.log(`📡 Socket.IO instance available: ${!!this.io}`);

            // Gửi đến user cụ thể
            this.io.to(roomName).emit('newNotification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                sender: notification.sender,
                priority: notification.priority,
                icon: notification.icon,
                color: notification.color,
                actionUrl: notification.actionUrl,
                timeAgo: notification.timeAgo,
                createdAt: notification.createdAt
            });

            console.log(`📢 Realtime notification sent to user: ${recipientId}`);
        } else {
            console.log('❌ Socket.IO not available for realtime notification');
        }
    }

    // Gửi thông báo cho admin
    async notifyAdmins(type, title, message, relatedData = {}, metadata = {}, actionUrl = null) {
        try {
            const admins = await User.find({ role: 'admin' });

            for (const admin of admins) {
                await this.createNotification({
                    recipient: admin._id,
                    sender: relatedData.userId || admin._id, // System notification
                    type,
                    title,
                    message,
                    relatedData,
                    priority: 'high',
                    icon: this.getIconByType(type),
                    color: this.getColorByType(type),
                    actionUrl: actionUrl,
                    metadata
                });
            }
        } catch (error) {
            console.error('Error notifying admins:', error);
        }
    }

    // Gửi thông báo broadcast cho tất cả users
    async broadcastNotification(type, title, message, options = {}) {
        try {
            const {
                targetRole = null, // 'user', 'admin', null (all)
                priority = 'normal',
                expiresAt = null,
                metadata = {}
            } = options;

            let users;
            if (targetRole) {
                users = await User.find({ role: targetRole });
            } else {
                users = await User.find({});
            }

            const systemUser = await User.findOne({ role: 'admin' }).limit(1);

            for (const user of users) {
                await this.createNotification({
                    recipient: user._id,
                    sender: systemUser._id,
                    type,
                    title,
                    message,
                    priority,
                    icon: this.getIconByType(type),
                    color: this.getColorByType(type),
                    expiresAt,
                    metadata
                });
            }

            console.log(`📢 Broadcast notification sent to ${users.length} users`);
        } catch (error) {
            console.error('Error broadcasting notification:', error);
        }
    }

    // Gửi email notification cho các trường hợp quan trọng
    async sendEmailNotification(userId, subject, htmlContent) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.email) return;

            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@tvuforum.com',
                to: user.email,
                subject: subject,
                html: htmlContent
            });

            console.log(`📧 Email notification sent to: ${user.email}`);
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    }

    // Helper functions
    getIconByType(type) {
        const iconMap = {
            'post_created': 'article',
            'comment_added': 'comment',
            'comment_reply': 'reply',
            'post_liked': 'favorite',
            'comment_liked': 'thumb_up',
            'post_rated': 'star',
            'account_warning': 'warning',
            'account_suspended': 'block',
            'account_banned': 'gavel',
            'account_activated': 'check_circle',
            'new_user_registered': 'person_add',
            'new_post_created': 'post_add',
            'new_comment_added': 'chat',
            'user_reported': 'report',
            'system_alert': 'error',
            'announcement': 'campaign',
            'system_maintenance': 'build',
            'feature_update': 'update',
            'new_message': 'message',
            'message_read': 'mark_email_read'
        };
        return iconMap[type] || 'notifications';
    }

    getColorByType(type) {
        const colorMap = {
            'post_created': '#4caf50',
            'comment_added': '#2196f3',
            'comment_reply': '#2196f3',
            'post_liked': '#e91e63',
            'comment_liked': '#e91e63',
            'post_rated': '#ff9800',
            'account_warning': '#ff9800',
            'account_suspended': '#f44336',
            'account_banned': '#d32f2f',
            'account_activated': '#4caf50',
            'new_user_registered': '#4caf50',
            'new_post_created': '#2196f3',
            'new_comment_added': '#2196f3',
            'user_reported': '#f44336',
            'system_alert': '#f44336',
            'announcement': '#9c27b0',
            'system_maintenance': '#607d8b',
            'feature_update': '#00bcd4'
        };
        return colorMap[type] || '#1976d2';
    }

    // Notification templates cho các trường hợp cụ thể
    async notifyPostCreated(postId, authorId, postTitle, topicName) {
        await this.notifyAdmins(
            'new_post_created',
            'Bài viết mới được tạo',
            `Người dùng vừa tạo bài viết "${postTitle}" trong chủ đề ${topicName}`,
            { postId, userId: authorId },
            { postTitle, topicName },
            `/admin/posts` // Admin navigate to posts management
        );
    }

    async notifyCommentAdded(commentId, postId, postAuthorId, commenterName, postTitle, topicId = null) {
        if (postAuthorId.toString() === commentId.toString()) return; // Don't notify self

        // Build actionUrl with correct format: /posts/detail?topicId=X&postId=Y#comment-Z
        let actionUrl = `/posts/detail?postId=${postId}#comment-${commentId}`;
        if (topicId) {
            actionUrl = `/posts/detail?topicId=${topicId}&postId=${postId}#comment-${commentId}`;
        }

        await this.createNotification({
            recipient: postAuthorId,
            sender: commentId,
            type: 'comment_added',
            title: 'Bình luận mới',
            message: `${commenterName} đã bình luận về bài viết "${postTitle}" của bạn`,
            relatedData: { postId, commentId, topicId },
            actionUrl: actionUrl
        });
    }

    async notifyPostLiked(postId, postAuthorId, likerName, postTitle, topicId = null) {
        // Build actionUrl with correct format: /posts/detail?topicId=X&postId=Y
        let actionUrl = `/posts/detail?postId=${postId}`;
        if (topicId) {
            actionUrl = `/posts/detail?topicId=${topicId}&postId=${postId}`;
        }

        await this.createNotification({
            recipient: postAuthorId,
            sender: postAuthorId, // Will be updated with actual liker ID
            type: 'post_liked',
            title: 'Lượt thích mới',
            message: `${likerName} đã thích bài viết "${postTitle}" của bạn`,
            relatedData: { postId, topicId },
            actionUrl: actionUrl
        });
    }

    async notifyAccountAction(userId, action, reason = '') {
        const actionMap = {
            'suspended': {
                type: 'account_suspended',
                title: 'Tài khoản bị tạm khóa',
                message: `Tài khoản của bạn đã bị tạm khóa. ${reason}`,
                emailSubject: 'Tài khoản TVU Forum - Tạm khóa'
            },
            'banned': {
                type: 'account_banned',
                title: 'Tài khoản bị cấm',
                message: `Tài khoản của bạn đã bị cấm vĩnh viễn. ${reason}`,
                emailSubject: 'Tài khoản TVU Forum - Bị cấm'
            },
            'activated': {
                type: 'account_activated',
                title: 'Tài khoản được kích hoạt',
                message: 'Tài khoản của bạn đã được kích hoạt lại.',
                emailSubject: 'Tài khoản TVU Forum - Kích hoạt'
            }
        };

        const config = actionMap[action];
        if (!config) return;

        const systemUser = await User.findOne({ role: 'admin' }).limit(1);

        // Tạo notification
        await this.createNotification({
            recipient: userId,
            sender: systemUser._id,
            type: config.type,
            title: config.title,
            message: config.message,
            priority: 'urgent'
        });

        // Gửi email
        const user = await User.findById(userId);
        if (user && user.email) {
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f44336;">${config.title}</h2>
                    <p>Xin chào ${user.fullName},</p>
                    <p>${config.message}</p>
                    <p>Nếu bạn có thắc mắc, vui lòng liên hệ admin.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">© 2024 Diễn đàn TVU</p>
                </div>
            `;

            await this.sendEmailNotification(userId, config.emailSubject, emailContent);
        }

        // Force logout nếu là suspend/ban
        if (action === 'suspended' || action === 'banned') {
            this.io.to(`user_${userId}`).emit('forceLogout', {
                reason: config.message
            });
        }
    }
}

module.exports = NotificationService;
