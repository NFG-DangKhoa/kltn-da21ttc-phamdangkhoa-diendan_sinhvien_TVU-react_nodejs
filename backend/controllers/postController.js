const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Like = require('../models/Like');
const Image = require('../models/Image');

// Lấy bài viết theo topic id
exports.getPostsByTopicWithDetails = async (req, res) => {
    try {
        const { topicId } = req.params;

        const posts = await Post.find({ topicId })
            .populate('authorId', 'fullName')
            .populate('topicId', 'name');

        if (!posts || posts.length === 0) {
            return res.json([]);
        }

        const detailedPosts = await Promise.all(posts.map(async (post) => {
            // Lấy bình luận gốc
            const comments = await Comment.find({ postId: post._id, parentCommentId: null })
                .populate('authorId', 'fullName');

            // Tính số người dùng duy nhất đã bình luận
            const uniqueCommentUsers = [...new Set(comments.map(c => c.authorId._id.toString()))];
            const commentUserCount = uniqueCommentUsers.length;

            // Duyệt từng comment để lấy replies và likeCount
            const detailedComments = await Promise.all(comments.map(async (comment) => {
                const replies = await Comment.find({ parentCommentId: comment._id })
                    .populate('authorId', 'fullName');

                const detailedReplies = await Promise.all(replies.map(async (reply) => {
                    const replyLikes = await Like.find({ targetId: reply._id, targetType: 'comment' });
                    reply.likeCount = replyLikes.length;
                    await reply.save();

                    return {
                        ...reply.toObject(),
                        likeCount: replyLikes.length,
                    };
                }));

                const commentLikes = await Like.find({ targetId: comment._id, targetType: 'comment' });

                comment.likeCount = commentLikes.length;
                // Lấy hình ảnh của bài viết
                const images = await Image.find({ postId: post._id });

                // Ảnh chính
                const mainImage = images.find(img => img.isMain) || null;

                // Các ảnh phụ
                const otherImages = images.filter(img => !img.isMain);

                comment.replyCount = detailedReplies.length;
                await comment.save();

                return {
                    ...comment.toObject(),
                    likeCount: commentLikes.length,
                    replies: detailedReplies,
                    mainImage,
                    otherImages,
                    images,
                };
            }));

            // Lấy đánh giá
            const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName');
            const ratedUsers = ratings.map(r => r.userId);
            const ratingCount = ratings.length;

            // Lấy lượt thích bài viết
            const likes = await Like.find({ targetId: post._id, targetType: 'post' }).populate('userId', 'fullName');
            const likeCount = likes.length;
            const likedUsers = likes.map(like => like.userId);

            // Cập nhật lại dữ liệu tổng hợp vào post nếu cần
            post.commentCount = commentUserCount;
            post.likeCount = likeCount;
            post.ratingCount = ratingCount;
            await post.save();

            return {
                ...post.toObject(),
                comments: detailedComments,
                ratedUsers,
                ratingCount,
                likeCount,
                likedUsers,
                commentUserCount,
            };
        }));

        res.json(detailedPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy baaif viết theo topic id và post id
exports.getPostByTopicAndPostIdWithDetails = async (req, res) => {
    try {
        const { topicId, postId } = req.params;

        const post = await Post.findOne({ _id: postId, topicId })
            .populate('authorId', 'fullName')
            .populate('topicId', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Lấy bình luận gốc
        const comments = await Comment.find({ postId: post._id, parentCommentId: null })
            .populate('authorId', 'fullName');

        const uniqueCommentUsers = [...new Set(comments.map(c => c.authorId._id.toString()))];
        const commentUserCount = uniqueCommentUsers.length;

        const detailedComments = await Promise.all(comments.map(async (comment) => {
            const replies = await Comment.find({ parentCommentId: comment._id })
                .populate('authorId', 'fullName');

            const detailedReplies = await Promise.all(replies.map(async (reply) => {
                const replyLikes = await Like.find({ targetId: reply._id, targetType: 'comment' });
                reply.likeCount = replyLikes.length;
                await reply.save();

                return {
                    ...reply.toObject(),
                    likeCount: replyLikes.length,
                };
            }));

            const commentLikes = await Like.find({ targetId: comment._id, targetType: 'comment' });

            comment.likeCount = commentLikes.length;
            comment.replyCount = detailedReplies.length;
            await comment.save();

            return {
                ...comment.toObject(),
                likeCount: commentLikes.length,
                replies: detailedReplies,
            };
        }));

        const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName');
        const ratedUsers = ratings.map(r => r.userId);
        const ratingCount = ratings.length;

        const likes = await Like.find({ targetId: post._id, targetType: 'post' }).populate('userId', 'fullName');
        const likeCount = likes.length;
        const likedUsers = likes.map(like => like.userId);

        const images = await Image.find({ postId: post._id });

        const mainImage = images.find(img => img.isMain) || null;
        const otherImages = images.filter(img => !img.isMain);


        post.commentCount = commentUserCount;
        post.likeCount = likeCount;
        post.ratingCount = ratingCount;
        await post.save();

        const detailedPost = {
            ...post.toObject(),
            comments: detailedComments,
            ratedUsers,
            ratingCount,
            likeCount,
            likedUsers,
            commentUserCount,
            images,
            mainImage,
            otherImages,

        };

        res.json(detailedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



// Tạo bài viết mới
exports.createPost = async (req, res) => {
    try {
        const { authorId, title, content, topicId, tags } = req.body;

        // Tạo đối tượng post mới
        const newPost = new Post({
            authorId,
            title,
            content,
            topicId,
            tags,
            // Các trường còn lại đã có mặc định trong schema
        });

        const savedPost = await newPost.save();

        res.status(201).json({ message: 'Tạo bài viết thành công', post: savedPost });
    } catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
    }
};

// Lấy tất cả bài viết theo topicId
exports.getPostsByTopic = async (req, res) => {
    try {
        const posts = await Post.find({ topicId: req.params.topicId }).populate('authorId', 'name');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Lấy chi tiết bài viết theo id
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('authorId', 'name');
        if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật bài viết', error: err.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa bài viết thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: err.message });
    }
};

// Tăng lượt xem
exports.incrementViews = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tăng lượt xem', error: err.message });
    }
};




// Tạo bài viết mới
exports.createPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi tạo bài viết', error: err.message });
    }
};

// Lấy tất cả bài viết theo topicId
exports.getPostsByTopic = async (req, res) => {
    try {
        const posts = await Post.find({ topicId: req.params.topicId }).populate('authorId', 'name');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Lấy chi tiết bài viết theo id
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('authorId', 'name');
        if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật bài viết', error: err.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa bài viết thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: err.message });
    }
};

// Tăng lượt xem
exports.incrementViews = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tăng lượt xem', error: err.message });
    }
};

// Tạo bài viết mới và lưu ảnh liên kết
exports.createPostWithImages = async (req, res) => {
    try {
        const { authorId, title, content, topicId, tags } = req.body;

        // 1. Tạo bài viết
        const newPost = new Post({
            authorId,
            title,
            content,
            topicId,
            tags,
        });

        const savedPost = await newPost.save();

        // 2. Tìm tất cả URL ảnh trong content
        const imageUrls = extractImageUrls(content);

        // 3. Lưu từng ảnh vào bảng Images
        const imageDocs = await Promise.all(
            imageUrls.map(url => {
                return Image.create({
                    postId: savedPost._id,
                    url,
                });
            })
        );

        res.status(201).json({
            message: 'Tạo bài viết thành công',
            post: savedPost,
            images: imageDocs,
        });
    } catch (error) {
        console.error('Lỗi tạo bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
    }
};

/**
 * Hàm helper để lấy tất cả src của thẻ <img> trong HTML
 */
const extractImageUrls = (htmlContent) => {
    const imageUrls = [];
    const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgTagRegex.exec(htmlContent))) {
        imageUrls.push(match[1]);
    }

    return imageUrls;
};

