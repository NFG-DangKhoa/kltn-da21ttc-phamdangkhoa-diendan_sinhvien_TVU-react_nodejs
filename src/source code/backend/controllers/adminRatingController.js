const Rating = require('../models/Rating');
const Post = require('../models/Post');
const User = require('../models/User');

// Get all ratings with pagination
exports.getAllRatings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const ratings = await Rating.find()
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

        const totalRatings = await Rating.countDocuments();

        // Lọc ra các đánh giá có tham chiếu không hợp lệ (bài viết hoặc người dùng đã bị xóa)
        const validRatings = ratings.filter(rating => rating.postId && rating.userId);

        res.status(200).json({
            success: true,
            data: {
                ratings: validRatings,
                pagination: {
                    totalRatings,
                    totalPages: Math.ceil(totalRatings / limit),
                    currentPage: page
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);

        if (!rating) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
        }

        await Rating.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Đã xóa đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
    }
};
