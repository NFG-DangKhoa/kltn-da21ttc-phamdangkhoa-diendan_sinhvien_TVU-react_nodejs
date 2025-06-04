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