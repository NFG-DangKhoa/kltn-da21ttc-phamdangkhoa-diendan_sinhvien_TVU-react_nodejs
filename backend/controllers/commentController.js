// File: backend/controllers/commentController.js
const Comment = require('../models/Comment'); // Điều chỉnh đường dẫn nếu cần
const Post = require('../models/Post');     // Giả sử bạn có model Post
const User = require('../models/User');     // Giả sử bạn có model User
const Like = require('../models/Like');     // Assuming you have a Like model for comments

// Declare a variable to hold the Socket.IO instance
let io;

// Function to set the Socket.IO instance (called from routes/commentRoutes.js)
exports.setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

// Hàm để tạo bình luận mới hoặc phản hồi (reply)
exports.createComment = async (req, res) => {
    try {
        const { postId, content, parentCommentId, imageId } = req.body;
        const authorId = req.user.id; // Giả sử bạn lấy ID người dùng từ middleware xác thực

        let targetPostId = postId;

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Bình luận cha không tồn tại.' });
            }
            targetPostId = parentComment.postId; // Ensure we always reference the main post ID
        }

        if (!targetPostId) {
            return res.status(400).json({ message: 'Không thể xác định bài viết gốc cho bình luận này.' });
        }

        const postExists = await Post.findById(targetPostId);
        if (!postExists) {
            return res.status(404).json({ message: 'Bài viết không tồn tại.' });
        }

        const newComment = new Comment({
            postId: targetPostId,
            authorId,
            content,
            parentCommentId: parentCommentId || null,
            imageId: imageId || null,
        });

        await newComment.save();

        // Increment replyCount if it's a reply
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(
                parentCommentId,
                { $inc: { replyCount: 1 } },
                { new: true }
            );
        }

        // Always increment commentCount on the original post, whether it's a root comment or a reply
        await Post.findByIdAndUpdate(
            targetPostId,
            { $inc: { commentCount: 1 } },
            { new: true }
        );

        // Populate author information for the new comment before emitting
        const createdCommentWithAuthor = await Comment.findById(newComment._id)
            .populate('authorId', 'username avatar fullName') // Assuming 'fullName' is also needed
            .lean(); // Convert to plain JS object for easier handling

        // Emit Socket.IO event for new comment
        if (io) {
            // Consider emitting to a specific room (e.g., for that postId) for better scalability
            /// io.to(`post-${targetPostId}`).emit('newComment', createdCommentWithAuthor);
            io.emit('newComment', createdCommentWithAuthor); // For now, emit to all connected clients
        }

        res.status(201).json({ message: 'Bình luận đã được tạo thành công!', comment: createdCommentWithAuthor });
    } catch (error) {
        console.error('Lỗi khi tạo bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi tạo bình luận.' });
    }
};

// Hàm để lấy các bình luận cấp cao nhất cho một bài viết cụ thể
exports.getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ postId: postId, parentCommentId: null })
            .populate('authorId', 'username avatar fullName') // Lấy thông tin tác giả
            .populate({
                path: 'replies', // Assuming you have a virtual for replies in your Comment model
                populate: { path: 'authorId', select: 'username avatar fullName' }
            })
            .sort({ createdAt: -1 })
            .lean(); // Use .lean() for performance

        // Manually calculate likeCount for each comment if not stored directly
        const detailedComments = await Promise.all(comments.map(async (comment) => {
            const likeCount = await Like.countDocuments({ targetId: comment._id, targetType: 'comment' });
            return {
                ...comment,
                likeCount,
            };
        }));


        res.status(200).json({ comments: detailedComments });
    } catch (error) {
        console.error('Lỗi khi lấy bình luận theo bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi lấy bình luận.' });
    }
};

// Hàm để lấy các phản hồi cho một bình luận cụ thể
exports.getRepliesByCommentId = async (req, res) => {
    try {
        const { commentId } = req.params;

        const replies = await Comment.find({ parentCommentId: commentId })
            .populate('authorId', 'username avatar fullName') // Lấy thông tin tác giả
            .sort({ createdAt: 1 }) // Phản hồi cũ nhất trước (để hiển thị luồng hội thoại)
            .lean(); // Use .lean() for performance

        // Manually calculate likeCount for each reply if not stored directly
        const detailedReplies = await Promise.all(replies.map(async (reply) => {
            const likeCount = await Like.countDocuments({ targetId: reply._id, targetType: 'comment' });
            return {
                ...reply,
                likeCount,
            };
        }));

        res.status(200).json({ replies: detailedReplies });
    } catch (error) {
        console.error('Lỗi khi lấy phản hồi theo bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi lấy phản hồi.' });
    }
};

// Hàm để xóa một bình luận (và các phản hồi của nó)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id; // Giả sử xác thực cung cấp ID người dùng

        const commentToDelete = await Comment.findById(commentId);

        if (!commentToDelete) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        // Only author or admin can delete comments
        if (commentToDelete.authorId.toString() !== userId) {
            // You can add admin role check here: if (req.user.role !== 'admin') { ... }
            return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này.' });
        }

        const postId = commentToDelete.postId; // Get postId before deleting

        // Find all direct and nested replies of the comment to be deleted
        const commentsAndRepliesToDelete = await Comment.find({
            $or: [
                { _id: commentId },
                { parentCommentId: commentId }
            ]
        });

        // Collect all IDs of comments/replies that will be deleted
        const idsToDelete = commentsAndRepliesToDelete.map(c => c._id);

        // Decrement commentCount on the Post for each deleted comment/reply
        if (postId) {
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -idsToDelete.length } });
        }

        // If the deleted comment was a reply, decrement replyCount on its parent
        if (commentToDelete.parentCommentId) {
            await Comment.findByIdAndUpdate(commentToDelete.parentCommentId, { $inc: { replyCount: -1 } });
        }

        // Delete the comment and all its direct/indirect replies
        await Comment.deleteMany({ _id: { $in: idsToDelete } });

        // Delete associated likes for all deleted comments/replies
        await Like.deleteMany({ targetId: { $in: idsToDelete }, targetType: 'comment' });


        // Emit Socket.IO event for deleted comment
        if (io) {
            io.emit('deletedComment', { commentId, postId }); // Emit commentId and postId
        }

        res.status(200).json({ message: 'Bình luận và các phản hồi liên quan đã được xóa.' });
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi xóa bình luận.' });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, imageId } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        if (comment.authorId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật bình luận này.' });
        }

        comment.content = content || comment.content;
        comment.imageId = imageId !== undefined ? imageId : comment.imageId; // Allow setting imageId to null/undefined
        comment.updatedAt = Date.now();

        const updatedComment = await comment.save();

        // Populate author information for the updated comment before emitting
        const updatedCommentWithAuthor = await Comment.findById(updatedComment._id)
            .populate('authorId', 'username avatar fullName')
            .lean();

        // Emit Socket.IO event for updated comment
        if (io) {
            io.emit('updatedComment', updatedCommentWithAuthor);
        }

        res.status(200).json({ message: 'Bình luận đã được cập nhật thành công!', comment: updatedCommentWithAuthor });
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi cập nhật bình luận.' });
    }
};

// You can add other functions as needed, e.g., likeComment, etc.