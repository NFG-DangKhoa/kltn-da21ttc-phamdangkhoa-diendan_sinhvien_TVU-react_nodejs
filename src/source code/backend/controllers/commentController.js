// File: backend/controllers/commentController.js
const Comment = require('../models/Comment'); // Điều chỉnh đường dẫn nếu cần
const Post = require('../models/Post');     // Giả sử bạn có model Post
const User = require('../models/User');     // Giả sử bạn có model User
const Like = require('../models/Like');     // Assuming you have a Like model for comments
const CommentLike = require('../models/CommentLike'); // New model for comment likes

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
        const authorId = req.user._id; // Giả sử bạn lấy ID người dùng từ middleware xác thực

        let targetPostId = postId;
        let level = 0;
        let rootCommentId = null;

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Bình luận cha không tồn tại.' });
            }
            targetPostId = parentComment.postId; // Ensure we always reference the main post ID
            level = parentComment.level + 1; // Increase level for nested reply
            rootCommentId = parentComment.rootCommentId || parentComment._id; // Set root comment ID
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
            level: level,
            rootCommentId: rootCommentId,
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
            .populate('authorId', 'username avatarUrl fullName') // Assuming 'fullName' is also needed
            .lean(); // Convert to plain JS object for easier handling

        // Gửi notification
        if (global.notificationService) {
            // Lấy thông tin post và author với topicId
            const post = await Post.findById(targetPostId).populate('authorId', 'fullName').populate('topicId', '_id');

            if (post && post.authorId._id.toString() !== authorId.toString()) {
                const topicId = post.topicId?._id;

                // Build actionUrl with correct format: /posts/detail?topicId=X&postId=Y#comment-Z
                let actionUrl = `/posts/detail?postId=${targetPostId}#comment-${newComment._id}`;
                if (topicId) {
                    actionUrl = `/posts/detail?topicId=${topicId}&postId=${targetPostId}#comment-${newComment._id}`;
                }

                // Notification cho tác giả bài viết (nếu không phải chính mình comment)
                if (parentCommentId) {
                    // Đây là reply
                    await global.notificationService.createNotification({
                        recipient: post.authorId._id,
                        sender: authorId,
                        type: 'comment_reply',
                        title: 'Phản hồi mới',
                        message: `${createdCommentWithAuthor.authorId.fullName} đã phản hồi bình luận trong bài viết "${post.title}"`,
                        relatedData: { postId: targetPostId, commentId: newComment._id, topicId },
                        actionUrl: actionUrl
                    });
                } else {
                    // Đây là comment mới
                    await global.notificationService.createNotification({
                        recipient: post.authorId._id,
                        sender: authorId,
                        type: 'comment_added',
                        title: 'Bình luận mới',
                        message: `${createdCommentWithAuthor.authorId.fullName} đã bình luận về bài viết "${post.title}"`,
                        relatedData: { postId: targetPostId, commentId: newComment._id, topicId },
                        actionUrl: actionUrl
                    });
                }
            }

            // Notification cho admin
            await global.notificationService.notifyAdmins(
                'new_comment_added',
                'Bình luận mới',
                `${createdCommentWithAuthor.authorId.fullName} đã ${parentCommentId ? 'phản hồi' : 'bình luận'} trong bài viết "${post.title}"`,
                { postId: targetPostId, commentId: newComment._id, userId: authorId },
                { postTitle: post.title, commenterName: createdCommentWithAuthor.authorId.fullName },
                `/admin/comments` // Admin navigate to comments management
            );
        }

        // Emit Socket.IO event for new comment
        if (io) {
            // Emit to the specific post's room for efficiency
            io.to(`post-${targetPostId}`).emit('newComment', createdCommentWithAuthor);
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
        const userId = req.user ? req.user._id : null; // Get user ID if authenticated

        const comments = await Comment.find({ postId: postId, parentCommentId: null })
            .populate('authorId', 'username avatarUrl fullName') // Lấy thông tin tác giả
            .populate({
                path: 'replies', // Assuming you have a virtual for replies in your Comment model
                populate: { path: 'authorId', select: 'username avatarUrl fullName' }
            })
            .sort({ createdAt: -1 })
            .lean(); // Use .lean() for performance

        // Helper function to build nested comment tree
        const buildCommentTree = async (comments, userId) => {
            return Promise.all(comments.map(async (comment) => {
                // Lấy danh sách user đã like comment này
                const likes = await CommentLike.find({ commentId: comment._id })
                    .populate('userId', 'avatarUrl username fullName')
                    .lean();
                const likedUsers = likes.map(like => like.userId);

                let replies = [];
                if (comment.replies && comment.replies.length > 0) {
                    replies = await buildCommentTree(comment.replies, userId);
                } else {
                    // Nếu replies chưa populate, lấy replies từ DB
                    replies = await Comment.find({ parentCommentId: comment._id })
                        .populate('authorId', 'username avatarUrl fullName')
                        .lean();
                    replies = await buildCommentTree(replies, userId);
                }

                return {
                    ...comment,
                    likedUsers, // Thêm trường này vào mỗi comment/reply
                    replies
                };
            }));
        };

        const nestedComments = await buildCommentTree(comments, userId);
        res.status(200).json(nestedComments);
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
            .populate('authorId', 'username avatarUrl fullName') // Lấy thông tin tác giả
            .sort({ createdAt: 1 }) // Phản hồi cũ nhất trước (để hiển thị luồng hội thoại)
            .lean(); // Use .lean() for performance

        // The likeCount is already stored in the Comment model, so we don't need to calculate it
        // But we can add isLiked status if user is authenticated
        const userId = req.user ? req.user.id : null;
        let detailedReplies = replies;

        if (userId) {
            const replyIds = replies.map(r => r._id);
            const userLikes = await CommentLike.find({
                commentId: { $in: replyIds },
                userId: userId
            }).lean();
            const likedReplyIds = new Set(userLikes.map(like => like.commentId.toString()));

            detailedReplies = replies.map(reply => ({
                ...reply,
                isLiked: likedReplyIds.has(reply._id.toString())
            }));
        }

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
        // Lấy parentCommentId của comment bị xóa (nếu nó là reply)
        const parentCommentId = commentToDelete.parentCommentId;

        // Find all direct and nested replies of the comment to be deleted
        // Use rootCommentId to find all nested replies efficiently
        const commentsAndRepliesToDelete = await Comment.find({
            $or: [
                { _id: commentId },
                { rootCommentId: commentId }, // All nested replies under this comment
                { parentCommentId: commentId } // Direct replies
            ]
        });

        // Collect all IDs of comments/replies that will be deleted
        const idsToDelete = commentsAndRepliesToDelete.map(c => c._id);

        // Decrement commentCount on the Post for each deleted comment/reply
        if (postId) {
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -idsToDelete.length } });
        }

        // If the deleted comment was a reply, decrement replyCount on its parent
        if (parentCommentId) { // Sử dụng biến đã lấy ở trên
            await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: -1 } });
        }

        // Delete the comment and all its direct/indirect replies
        await Comment.deleteMany({ _id: { $in: idsToDelete } });

        // Delete associated likes for all deleted comments/replies
        await CommentLike.deleteMany({ commentId: { $in: idsToDelete } });


        // Emit Socket.IO event for deleted comment
        if (io && postId) {
            io.to(`post-${postId}`).emit('deletedComment', { commentId, postId, parentCommentId });
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
            .populate('authorId', 'username avatarUrl fullName')
            .lean();

        // Emit Socket.IO event for updated comment
        if (io) {
            io.to(`post-${updatedCommentWithAuthor.postId}`).emit('updatedComment', updatedCommentWithAuthor);
        }

        res.status(200).json({ message: 'Bình luận đã được cập nhật thành công!', comment: updatedCommentWithAuthor });
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi cập nhật bình luận.' });
    }
};

// Like/Unlike comment
exports.toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Check if comment exists
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        // Check if user already liked this comment
        const existingLike = await CommentLike.findOne({ commentId, userId });

        if (existingLike) {
            // Unlike: Remove like and decrease count
            await CommentLike.deleteOne({ commentId, userId });
            await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { likeCount: -1 } },
                { new: true }
            );

            // Get updated comment with author info
            const updatedComment = await Comment.findById(commentId)
                .populate('authorId', 'username avatarUrl fullName')
                .lean();

            // Emit Socket.IO event for comment like update
            if (io) {
                io.to(`post-${comment.postId}`).emit('commentLikeUpdated', {
                    commentId,
                    likeCount: updatedComment.likeCount,
                    isLiked: false,
                    userId
                });
            }

            res.status(200).json({
                message: 'Đã bỏ thích bình luận.',
                isLiked: false,
                likeCount: updatedComment.likeCount
            });
        } else {
            // Like: Add like and increase count
            await CommentLike.create({ commentId, userId });
            await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { likeCount: 1 } },
                { new: true }
            );

            // Get updated comment with author info
            const updatedComment = await Comment.findById(commentId)
                .populate('authorId', 'username avatarUrl fullName')
                .lean();

            // Emit Socket.IO event for comment like update
            if (io) {
                io.to(`post-${comment.postId}`).emit('commentLikeUpdated', {
                    commentId,
                    likeCount: updatedComment.likeCount,
                    isLiked: true,
                    userId
                });
            }

            res.status(200).json({
                message: 'Đã thích bình luận.',
                isLiked: true,
                likeCount: updatedComment.likeCount
            });
        }
    } catch (error) {
        console.error('Lỗi khi toggle like bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi xử lý like bình luận.' });
    }
};

// Hàm để lấy tất cả bình luận (có thể lọc theo authorId)
exports.getComments = async (req, res) => {
    try {
        const authorId = req.query.authorId;
        let query = {};
        if (authorId) {
            query.author = authorId;
        }
        const comments = await Comment.find(query)
            .populate('author', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
        res.status(500).json({ message: "Không thể lấy comment" });
    }
};

// Lấy danh sách người dùng đã thích một bình luận
exports.getCommentLikers = async (req, res) => {
    try {
        const { commentId } = req.params;

        const likes = await CommentLike.find({ commentId })
            .populate('userId', 'username fullName avatarUrl') // Chỉ lấy các trường cần thiết
            .lean();

        const likers = likes.map(like => like.userId);

        res.status(200).json(likers);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người thích bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server.' });
    }
};
