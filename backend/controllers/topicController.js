const Topic = require('../models/Topic');
const Post = require('../models/Post');

// Lấy danh sách tất cả chủ đề
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chủ đề', error });
    }
};

// Lấy danh sách chủ đề với thông tin bài viết gần nhất cho Home page
exports.getTopicsWithLatestPosts = async (req, res) => {
    try {
        // Lấy tất cả chủ đề
        const topics = await Topic.find().sort({ createdAt: -1 });

        // Lấy thông tin bài viết gần nhất cho mỗi chủ đề
        const topicsWithLatestPosts = await Promise.all(
            topics.map(async (topic) => {
                // Tìm bài viết gần nhất trong chủ đề này
                const latestPost = await Post.findOne({ topicId: topic._id })
                    .populate('authorId', 'fullName avatarUrl email')
                    .sort({ createdAt: -1 })
                    .select('title content createdAt authorId views commentCount likeCount');

                // Đếm số bài viết trong chủ đề
                const postCount = await Post.countDocuments({ topicId: topic._id });

                return {
                    _id: topic._id,
                    name: topic.name,
                    description: topic.description,
                    color: topic.color,
                    icon: topic.icon,
                    trending: topic.trending || false,
                    postCount: postCount,
                    latestPost: latestPost ? {
                        _id: latestPost._id,
                        title: latestPost.title,
                        createdAt: latestPost.createdAt,
                        authorInfo: latestPost.authorId ? {
                            _id: latestPost.authorId._id,
                            fullName: latestPost.authorId.fullName,
                            avatarUrl: latestPost.authorId.avatarUrl,
                            email: latestPost.authorId.email
                        } : null,
                        views: latestPost.views || 0,
                        commentCount: latestPost.commentCount || 0,
                        likeCount: latestPost.likeCount || 0
                    } : null,
                    createdAt: topic.createdAt,
                    updatedAt: topic.updatedAt
                };
            })
        );

        res.status(200).json({
            success: true,
            data: topicsWithLatestPosts,
            message: 'Lấy danh sách chủ đề với bài viết gần nhất thành công'
        });
    } catch (error) {
        console.error('Error in getTopicsWithLatestPosts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách chủ đề với bài viết gần nhất',
            error: error.message
        });
    }
};

exports.getTopicById = async (req, res) => {
    try {
        const { topicId } = req.params; // Lấy topicId từ URL params

        // Tìm chủ đề theo ID
        const topic = await Topic.findById(topicId);

        // Kiểm tra nếu không tìm thấy chủ đề
        if (!topic) {
            return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
        }

        // Trả về thông tin chủ đề
        res.status(200).json(topic);
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};