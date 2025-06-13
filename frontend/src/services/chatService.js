import api from './api';

class ChatService {
    // Lấy danh sách cuộc trò chuyện
    async getConversations(page = 1, limit = 20) {
        try {
            const response = await api.get('/messages/conversations', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting conversations:', error);
            throw error;
        }
    }

    // Lấy tin nhắn trong cuộc trò chuyện
    async getConversationMessages(conversationId, page = 1, limit = 50) {
        try {
            const response = await api.get(`/messages/conversations/${conversationId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting conversation messages:', error);
            throw error;
        }
    }

    // Gửi tin nhắn
    async sendMessage(receiverId, content, messageType = 'text', attachments = []) {
        try {
            const response = await api.post('/messages/send', {
                receiverId,
                content,
                messageType,
                attachments
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessageAsRead(messageId) {
        try {
            const response = await api.put(`/messages/${messageId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    // Lấy số tin nhắn chưa đọc
    async getUnreadCount() {
        try {
            const response = await api.get('/messages/unread-count');
            return response.data;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    // Tạo cuộc trò chuyện mới
    async createConversation(participantId) {
        try {
            const response = await api.post('/messages/conversation/create', {
                participantId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Tìm kiếm người dùng để chat
    async searchUsers(query = '', page = 1, limit = 20) {
        try {
            const response = await api.get('/messages/users/search', {
                params: { q: query, page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    // Xóa tin nhắn
    async deleteMessage(messageId) {
        try {
            // Import socket here to avoid circular dependency
            const socket = (await import('../socket.jsx')).default;

            // Get current user from localStorage or context
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('User not authenticated');
            }

            const user = JSON.parse(userStr);

            // Emit socket event for real-time deletion
            socket.emit('deleteMessage', {
                messageId,
                userId: user._id
            });

            // Also call API for persistence (optional, since socket handler already does this)
            const response = await api.delete(`/messages/${messageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    // Upload file cho tin nhắn
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/uploads/chat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    // Format thời gian tin nhắn
    formatMessageTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diff = now - messageTime;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return messageTime.toLocaleDateString('vi-VN');
    }

    // Format thời gian cuộc trò chuyện
    formatConversationTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes}p`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return time.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    }

    // Kiểm tra file có phải là hình ảnh không
    isImageFile(file) {
        return file && file.type && file.type.startsWith('image/');
    }

    // Lấy tên file từ URL
    getFileNameFromUrl(url) {
        return url.split('/').pop();
    }

    // Format kích thước file
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validate tin nhắn
    validateMessage(content, attachments = []) {
        if (!content.trim() && attachments.length === 0) {
            throw new Error('Tin nhắn không thể để trống');
        }

        if (content.length > 2000) {
            throw new Error('Tin nhắn không được vượt quá 2000 ký tự');
        }

        return true;
    }

    // Escape HTML để tránh XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Detect URLs trong tin nhắn
    detectUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    // Format tin nhắn với URLs và line breaks
    formatMessageContent(content) {
        let formatted = this.escapeHtml(content);
        formatted = this.detectUrls(formatted);
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }
}

export default new ChatService();
