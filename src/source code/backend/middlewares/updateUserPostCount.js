const User = require('../models/User');
const Post = require('../models/Post');

const updateUserPostCount = async (userId) => {
    try {
        const postCount = await Post.countDocuments({ authorId: userId });
        await User.findByIdAndUpdate(userId, { postsCount: postCount });
    } catch (error) {
        console.error(`Error updating post count for user ${userId}:`, error);
    }
};

module.exports = updateUserPostCount;
