const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

// Get all likes with pagination
exports.getAllLikes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const likes = await Like.find()
            .populate({
                path: 'postId',
                select: 'title',
                model: 'Post'
            })
            .populate({
                path: 'userId',
                select: 'fullName',
                model: 'User'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalLikes = await Like.countDocuments();

        // Lọc ra các lượt thích có tham chiếu không hợp lệ (bài viết hoặc người dùng đã bị xóa)
        const validLikes = likes.filter(like => like.postId && like.userId);

        res.status(200).json({
            success: true,
            data: {
                likes: validLikes,
                pagination: {
                    totalLikes,
                    totalPages: Math.ceil(totalLikes / limit),
                    currentPage: page
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};

// Delete a like
exports.deleteLike = async (req, res) => {
    try {
        const like = await Like.findById(req.params.id);

        if (!like) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy lượt thích' });
        }

        await Like.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Đã xóa lượt thích thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};
