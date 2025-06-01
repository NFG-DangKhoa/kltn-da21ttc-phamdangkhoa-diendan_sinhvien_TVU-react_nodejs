// Trong likeController.js

const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Image = require('../models/Image');
const User = require('../models/User'); // Import mô hình User để populate

let io;

exports.setIo = (ioInstance) => {
    io = ioInstance;
};

/**
 * @desc    Bật/tắt một lượt thích (thêm hoặc xóa)
 * @route   POST /api/likes/toggle
 * @access  Private (yêu cầu xác thực)
 */
exports.toggleLike = async (req, res) => {
    const { targetId, targetType } = req.body;
    const userId = req.user.id; // ID của người dùng thực hiện hành động

    if (!targetId || !targetType) {
        return res.status(400).json({ message: 'Target ID và target type là bắt buộc.' });
    }

    if (!['post', 'comment', 'image'].includes(targetType)) {
        return res.status(400).json({ message: 'Target type không hợp lệ.' });
    }

    try {
        let like = await Like.findOne({ userId, targetId, targetType });
        let message;
        let isLiked;
        let likeCount;
        let Model; // Biến để lưu trữ mô hình động

        switch (targetType) {
            case 'post':
                Model = Post;
                break;
            case 'comment':
                Model = Comment;
                break;
            case 'image':
                Model = Image;
                break;
            default:
                return res.status(400).json({ message: 'Target type không hợp lệ.' });
        }

        // Lấy thông tin chi tiết của người dùng đã thực hiện hành động
        const actingUser = await User.findById(userId).select('_id fullName avatarUrl'); // Chỉ lấy các trường cần thiết

        if (!actingUser) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
        }

        if (like) {
            // Lượt thích đã tồn tại, xóa nó (bỏ thích)
            await like.deleteOne();
            message = 'Bỏ thích thành công.';
            isLiked = false;
            await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: -1 } });
        } else {
            // Lượt thích chưa tồn tại, tạo nó (thích)
            like = await Like.create({ userId, targetId, targetType });
            message = 'Thích thành công.';
            isLiked = true;
            await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
        }

        likeCount = await Like.countDocuments({ targetId, targetType });

        if (io) {
            io.emit('likeUpdate', {
                targetId,
                targetType,
                likeCount,
                userId: actingUser._id, // Gửi ID của người dùng
                action: isLiked ? 'liked' : 'unliked',
                likedUser: actingUser // <-- Gửi toàn bộ thông tin người dùng đã thích/bỏ thích
            });
        } else {
            console.warn('Thể hiện Socket.IO chưa được thiết lập trong likeController.');
        }

        res.status(200).json({
            message,
            isLiked,
            likeCount,
            likeId: like ? like._id : null
        });

    } catch (error) {
        console.error('Lỗi khi bật/tắt lượt thích:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Bạn đã thích mục này rồi.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

/**
 * @desc    Lấy tất cả lượt thích cho một mục tiêu cụ thể
 * @route   GET /api/likes/:targetType/:targetId
 * @access  Public (hoặc Private, tùy thuộc vào yêu cầu của bạn)
 */
exports.getLikesForTarget = async (req, res) => {
    const { targetId, targetType } = req.params;

    if (!['post', 'comment', 'image'].includes(targetType)) {
        return res.status(400).json({ message: 'Target type không hợp lệ.' });
    }

    try {
        // Populate 'userId' để lấy thông tin người dùng nếu cần (ví dụ: username, avatar)
        const likes = await Like.find({ targetId, targetType }).populate('userId', 'username avatar');
        res.status(200).json(likes);
    } catch (error) {
        console.error('Lỗi khi lấy lượt thích cho mục tiêu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

/**
 * @desc    Lấy số lượt thích cho một mục tiêu cụ thể
 * @route   GET /api/likes/count/:targetType/:targetId
 * @access  Public
 */
exports.getLikeCountForTarget = async (req, res) => {
    const { targetId, targetType } = req.params;

    if (!['post', 'comment', 'image'].includes(targetType)) {
        return res.status(400).json({ message: 'Target type không hợp lệ.' });
    }

    try {
        const likeCount = await Like.countDocuments({ targetId, targetType });
        res.status(200).json({ targetId, targetType, likeCount });
    } catch (error) {
        console.error('Lỗi khi lấy số lượt thích:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};

/**
 * @desc    Kiểm tra xem một người dùng đã thích một mục tiêu cụ thể hay chưa
 * @route   GET /api/likes/check/:targetType/:targetId
 * @access  Private (yêu cầu xác thực)
 */
exports.checkIfUserLiked = async (req, res) => {
    const { targetId, targetType } = req.params;
    const userId = req.user.id; // Giả định userId có sẵn từ middleware xác thực

    if (!['post', 'comment', 'image'].includes(targetType)) {
        return res.status(400).json({ message: 'Target type không hợp lệ.' });
    }

    try {
        const like = await Like.findOne({ userId, targetId, targetType });
        const isLiked = !!like; // Chuyển đổi thành boolean
        res.status(200).json({ targetId, targetType, userId, isLiked });
    } catch (error) {
        console.error('Lỗi khi kiểm tra xem người dùng đã thích hay chưa:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};