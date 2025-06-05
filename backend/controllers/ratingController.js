const Rating = require('../models/Rating');
const mongoose = require('mongoose');

// Hàm trợ giúp để tính toán điểm đánh giá trung bình cho một bài đăng
async function calculateAverageRating(postId) {
    try {
        const result = await Rating.aggregate([
            // Lọc các đánh giá theo postId cụ thể
            { $match: { postId: new mongoose.Types.ObjectId(postId) } },
            {
                // Nhóm theo postId và tính trung bình điểm rating cùng với tổng số đánh giá
                $group: {
                    _id: '$postId',
                    averageRating: { $avg: '$rating' }, // Tính điểm trung bình
                    count: { $sum: 1 } // Đếm tổng số đánh giá
                }
            }
        ]);

        if (result.length > 0) {
            // Trả về điểm trung bình được làm tròn đến 1 chữ số thập phân và tổng số đánh giá
            return {
                averageRating: parseFloat(result[0].averageRating.toFixed(1)),
                count: result[0].count
            };
        }
        // Trả về 0 nếu không có đánh giá nào
        return { averageRating: 0, count: 0 };
    } catch (error) {
        console.error('Error calculating average rating:', error);
        return { averageRating: 0, count: 0 }; // Trả về giá trị mặc định khi có lỗi
    }
}

/**
 * @param {Object} req - Đối tượng yêu cầu Express
 * @param {Object} res - Đối tượng phản hồi Express
 * @param {Object} io - Instance của Socket.IO server để phát sự kiện
 */
exports.createRating = async (req, res, io) => {
    try {
        const { postId, userId, rating } = req.body;

        // Xác thực giá trị rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Kiểm tra xem rating đã tồn tại cho postId và userId này chưa
        const existingRating = await Rating.findOne({ postId, userId });

        let newRating;
        if (existingRating) {
            // Nếu đã tồn tại, cập nhật rating hiện có
            existingRating.rating = rating;
            newRating = await existingRating.save();
            res.status(200).json({ message: 'Rating updated successfully.', rating: newRating });
        } else {
            // Nếu chưa, tạo một rating mới
            newRating = new Rating({ postId, userId, rating });
            await newRating.save();
            res.status(201).json({ message: 'Rating created successfully.', rating: newRating });
        }

        // Tính toán và phát điểm trung bình mới cho bài đăng
        const { averageRating, count } = await calculateAverageRating(postId);
        // Phát sự kiện 'ratingUpdated' đến tất cả các client trong phòng của postId này
        io.to(postId.toString()).emit('ratingUpdated', { postId, averageRating, count });

    } catch (error) {
        // Xử lý lỗi trùng lặp (ví dụ: người dùng đã đánh giá bài đăng này rồi)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already rated this post. Please update your existing rating.', error: error.message });
        }
        console.error('Error creating/updating rating:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * @param {Object} req - Đối tượng yêu cầu Express
 * @param {Object} res - Đối tượng phản hồi Express
 */
exports.getRatingsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        // Xác thực postId có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid Post ID.' });
        }

        // Tìm tất cả các đánh giá cho postId cụ thể, populate thông tin userId
        // CHỈNH SỬA Ở ĐÂY: Thêm 'fullName' vào danh sách các trường cần populate
        const ratings = await Rating.find({ postId })
            .populate('userId', 'username email fullName') // Đã thêm 'fullName'
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần

        // Tính toán điểm trung bình
        const { averageRating, count } = await calculateAverageRating(postId);

        res.status(200).json({
            ratings,
            averageRating,
            totalRatings: count
        });
    } catch (error) {
        console.error('Error fetching ratings by post ID:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * @param {Object} req - Đối tượng yêu cầu Express
 * @param {Object} res - Đối tượng phản hồi Express
 * @param {Object} io - Instance của Socket.IO server để phát sự kiện
 */
exports.updateRating = async (req, res, io) => {
    try {
        const { postId, userId } = req.params; // Lấy postId và userId từ params
        const { rating } = req.body; // Lấy rating mới từ body

        // Xác thực postId và userId
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid Post ID or User ID.' });
        }

        // Xác thực giá trị rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Tìm và cập nhật rating dựa trên postId và userId
        const updatedRating = await Rating.findOneAndUpdate(
            { postId, userId }, // Điều kiện tìm kiếm
            { rating }, // Dữ liệu cập nhật
            { new: true, runValidators: true } // Trả về tài liệu đã cập nhật và chạy validators
        );

        if (!updatedRating) {
            return res.status(404).json({ message: 'Rating not found for this post and user.' });
        }

        // Tính toán và phát điểm trung bình mới cho bài đăng
        const { averageRating, count } = await calculateAverageRating(postId);
        io.to(postId.toString()).emit('ratingUpdated', { postId, averageRating, count });

        res.status(200).json({ message: 'Rating updated successfully.', rating: updatedRating });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * @param {Object} req - Đối tượng yêu cầu Express
 * @param {Object} res - Đối tượng phản hồi Express
 * @param {Object} io - Instance của Socket.IO server để phát sự kiện
 */
exports.deleteRating = async (req, res, io) => {
    try {
        const { postId, userId } = req.params; // Lấy postId và userId từ params

        // Xác thực postId và userId
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid Post ID or User ID.' });
        }

        // Tìm và xóa rating dựa trên postId và userId
        const deletedRating = await Rating.findOneAndDelete({ postId, userId });

        if (!deletedRating) {
            return res.status(404).json({ message: 'Rating not found for this post and user.' });
        }

        // Tính toán và phát điểm trung bình mới cho bài đăng (sau khi xóa)
        const { averageRating, count } = await calculateAverageRating(postId);
        io.to(postId.toString()).emit('ratingUpdated', { postId, averageRating, count });

        res.status(200).json({ message: 'Rating deleted successfully.' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
