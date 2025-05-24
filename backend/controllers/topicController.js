const Topic = require('../models/Topic');

// Lấy danh sách tất cả chủ đề
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chủ đề', error });
    }
};
