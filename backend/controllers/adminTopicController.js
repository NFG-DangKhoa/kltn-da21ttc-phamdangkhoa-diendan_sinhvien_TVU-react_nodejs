// File: backend/controllers/adminTopicController.js
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const mongoose = require('mongoose');

/**
 * @route GET /api/admin/topics
 * @desc Lấy danh sách tất cả chủ đề với phân trang, tìm kiếm và lọc
 * @access Private (Admin Only)
 */
exports.getAllTopics = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            status = '',
            sortBy = 'priority',
            sortOrder = '-1'
        } = req.query;

        // Tạo query object
        const query = {};

        // Tìm kiếm theo tên, mô tả hoặc tags
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo category
        if (category) {
            query.category = category;
        }

        // Lọc theo status
        if (status) {
            query.status = status;
        }

        // Tạo sort options
        const sortOptions = {};
        sortOptions[sortBy] = parseInt(sortOrder);

        // Tính toán skip và limit
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Thực hiện query
        const topics = await Topic.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        // Cập nhật postCount cho mỗi chủ đề
        const topicsWithPostCount = await Promise.all(
            topics.map(async (topic) => {
                // Đếm tất cả bài viết không bị xóa (bao gồm tất cả status trừ 'deleted')
                const postCount = await Post.countDocuments({
                    topicId: topic._id,
                    status: { $ne: 'deleted' }
                });

                // Cập nhật postCount trong database nếu khác
                if (topic.postCount !== postCount) {
                    await Topic.findByIdAndUpdate(topic._id, { postCount });
                }

                // Trả về topic với postCount đã cập nhật
                const topicObj = topic.toObject();
                topicObj.postCount = postCount;

                // Đảm bảo createdAt và updatedAt được bao gồm
                if (!topicObj.createdAt && topic._id) {
                    topicObj.createdAt = topic._id.getTimestamp();
                }
                if (!topicObj.updatedAt) {
                    topicObj.updatedAt = topicObj.createdAt || topic._id.getTimestamp();
                }

                return topicObj;
            })
        );

        // Đếm tổng số documents
        const totalTopics = await Topic.countDocuments(query);
        const totalPages = Math.ceil(totalTopics / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                topics: topicsWithPostCount,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalTopics,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách chủ đề',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/topics/:id
 * @desc Lấy thông tin chi tiết một chủ đề
 * @access Private (Admin Only)
 */
exports.getTopicById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID chủ đề không hợp lệ'
            });
        }

        const topic = await Topic.findById(id)
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chủ đề'
            });
        }

        // Lấy thống kê bài viết của chủ đề
        const postStats = await Post.aggregate([
            { $match: { topicId: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Tính tổng số bài viết và cập nhật postCount
        const totalPosts = await Post.countDocuments({
            topicId: id,
            status: { $ne: 'deleted' }
        });

        // Cập nhật postCount trong database nếu khác
        if (topic.postCount !== totalPosts) {
            await Topic.findByIdAndUpdate(id, { postCount: totalPosts });
            topic.postCount = totalPosts;
        }

        res.status(200).json({
            success: true,
            data: {
                topic,
                postStats,
                totalPosts
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin chủ đề',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/topics
 * @desc Tạo chủ đề mới
 * @access Private (Admin Only)
 */
exports.createTopic = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            priority,
            color,
            icon,
            imageUrl,
            tags,
            isVisible,
            allowPosts,
            requireApproval
        } = req.body;

        const adminId = req.user._id;

        // Kiểm tra dữ liệu bắt buộc
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Tên và mô tả chủ đề là bắt buộc'
            });
        }

        // Kiểm tra tên chủ đề đã tồn tại
        const existingTopic = await Topic.findOne({ name: name.trim() });
        if (existingTopic) {
            return res.status(400).json({
                success: false,
                message: 'Tên chủ đề đã tồn tại'
            });
        }

        // Tạo chủ đề mới
        const newTopic = new Topic({
            name: name.trim(),
            description: description.trim(),
            category: category || 'Học tập',
            priority: priority || 0,
            color: color || '#1976d2',
            icon: icon || 'topic',
            imageUrl: imageUrl || '',
            tags: tags || [],
            isVisible: isVisible !== undefined ? isVisible : true,
            allowPosts: allowPosts !== undefined ? allowPosts : true,
            requireApproval: requireApproval !== undefined ? requireApproval : false,
            createdBy: adminId,
            status: 'active'
        });

        const savedTopic = await newTopic.save();
        await savedTopic.populate('createdBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Tạo chủ đề thành công',
            data: savedTopic
        });
    } catch (error) {
        console.error('Lỗi khi tạo chủ đề:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên chủ đề đã tồn tại'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo chủ đề',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/topics/:id
 * @desc Cập nhật thông tin chủ đề
 * @access Private (Admin Only)
 */
exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID chủ đề không hợp lệ'
            });
        }

        const topic = await Topic.findById(id);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chủ đề'
            });
        }

        // Kiểm tra tên chủ đề trùng lặp (nếu có thay đổi tên)
        if (req.body.name && req.body.name.trim() !== topic.name) {
            const existingTopic = await Topic.findOne({
                name: req.body.name.trim(),
                _id: { $ne: id }
            });
            if (existingTopic) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên chủ đề đã tồn tại'
                });
            }
        }

        // Cập nhật các trường
        const allowedFields = [
            'name', 'description', 'category', 'priority', 'status',
            'color', 'icon', 'imageUrl', 'tags', 'isVisible',
            'allowPosts', 'requireApproval'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'name' || field === 'description') {
                    topic[field] = req.body[field].trim();
                } else {
                    topic[field] = req.body[field];
                }
            }
        });

        topic.updatedBy = adminId;
        const updatedTopic = await topic.save();
        await updatedTopic.populate(['createdBy', 'updatedBy'], 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Cập nhật chủ đề thành công',
            data: updatedTopic
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật chủ đề:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên chủ đề đã tồn tại'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật chủ đề',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/admin/topics/:id
 * @desc Xóa chủ đề
 * @access Private (Admin Only)
 */
exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID chủ đề không hợp lệ'
            });
        }

        const topic = await Topic.findById(id);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chủ đề'
            });
        }

        // Kiểm tra xem có bài viết nào thuộc chủ đề này không
        const postCount = await Post.countDocuments({ topicId: id });
        if (postCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa chủ đề này vì có ${postCount} bài viết đang sử dụng. Vui lòng chuyển các bài viết sang chủ đề khác hoặc xóa chúng trước.`
            });
        }

        await Topic.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa chủ đề thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa chủ đề',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/topics/:id/status
 * @desc Thay đổi trạng thái chủ đề
 * @access Private (Admin Only)
 */
exports.updateTopicStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID chủ đề không hợp lệ'
            });
        }

        if (!status || !['active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const topic = await Topic.findById(id);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chủ đề'
            });
        }

        topic.status = status;
        topic.updatedBy = adminId;
        await topic.save();

        res.status(200).json({
            success: true,
            message: `Đã ${status === 'active' ? 'kích hoạt' : status === 'inactive' ? 'vô hiệu hóa' : 'lưu trữ'} chủ đề thành công`,
            data: topic
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái chủ đề',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/topics/bulk-update-priority
 * @desc Cập nhật thứ tự ưu tiên hàng loạt
 * @access Private (Admin Only)
 */
exports.bulkUpdatePriority = async (req, res) => {
    try {
        const { topics } = req.body; // Array of {id, priority}
        const adminId = req.user._id;

        if (!Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu cập nhật không hợp lệ'
            });
        }

        // Validate all IDs
        for (const item of topics) {
            if (!mongoose.Types.ObjectId.isValid(item.id)) {
                return res.status(400).json({
                    success: false,
                    message: `ID chủ đề không hợp lệ: ${item.id}`
                });
            }
        }

        // Update priorities
        const updatePromises = topics.map(item =>
            Topic.findByIdAndUpdate(
                item.id,
                {
                    priority: item.priority,
                    updatedBy: adminId
                },
                { new: true }
            )
        );

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thứ tự ưu tiên thành công'
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thứ tự ưu tiên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thứ tự ưu tiên',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/topics/stats
 * @desc Lấy thống kê chủ đề
 * @access Private (Admin Only)
 */
exports.getTopicStats = async (req, res) => {
    try {
        const totalTopics = await Topic.countDocuments();
        const activeTopics = await Topic.countDocuments({ status: 'active' });
        const inactiveTopics = await Topic.countDocuments({ status: 'inactive' });
        const archivedTopics = await Topic.countDocuments({ status: 'archived' });

        const topicsByCategory = await Topic.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const popularTopics = await Topic.find({ status: 'active' })
            .sort({ postCount: -1, viewCount: -1 })
            .limit(5)
            .select('name postCount viewCount category');

        const recentTopics = await Topic.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category status createdAt')
            .populate('createdBy', 'fullName');

        res.status(200).json({
            success: true,
            data: {
                totalTopics,
                activeTopics,
                inactiveTopics,
                archivedTopics,
                topicsByCategory,
                popularTopics,
                recentTopics
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê chủ đề',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/topics/update-post-counts
 * @desc Cập nhật số lượng bài viết cho tất cả chủ đề
 * @access Private (Admin Only)
 */
exports.updateAllPostCounts = async (req, res) => {
    try {
        const topics = await Topic.find({});
        let updatedCount = 0;

        for (const topic of topics) {
            const postCount = await Post.countDocuments({
                topicId: topic._id,
                status: { $ne: 'deleted' }
            });

            if (topic.postCount !== postCount) {
                await Topic.findByIdAndUpdate(topic._id, { postCount });
                updatedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Đã cập nhật số lượng bài viết cho ${updatedCount} chủ đề`,
            data: {
                totalTopics: topics.length,
                updatedTopics: updatedCount
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật số lượng bài viết',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/topics/fix-data
 * @desc Sửa dữ liệu thiếu cho tất cả chủ đề (createdAt, updatedAt, etc.)
 * @access Private (Admin Only)
 */
exports.fixTopicData = async (req, res) => {
    try {
        const topics = await Topic.find({});
        let updatedCount = 0;

        for (const topic of topics) {
            let needUpdate = false;
            const updateData = {};

            // Thêm createdAt nếu thiếu
            if (!topic.createdAt) {
                updateData.createdAt = topic._id.getTimestamp();
                needUpdate = true;
            }

            // Thêm updatedAt nếu thiếu
            if (!topic.updatedAt) {
                updateData.updatedAt = topic.createdAt || topic._id.getTimestamp();
                needUpdate = true;
            }

            // Cập nhật postCount
            const postCount = await Post.countDocuments({
                topicId: topic._id,
                status: { $ne: 'deleted' }
            });

            if (topic.postCount !== postCount) {
                updateData.postCount = postCount;
                needUpdate = true;
            }

            // Thêm các trường mặc định nếu thiếu
            if (!topic.category) {
                updateData.category = 'Học tập';
                needUpdate = true;
            }

            if (topic.priority === undefined || topic.priority === null) {
                updateData.priority = 0;
                needUpdate = true;
            }

            if (!topic.status) {
                updateData.status = 'active';
                needUpdate = true;
            }

            if (!topic.color) {
                updateData.color = '#1976d2';
                needUpdate = true;
            }

            if (!topic.icon) {
                updateData.icon = 'topic';
                needUpdate = true;
            }

            if (!topic.tags) {
                updateData.tags = [];
                needUpdate = true;
            }

            if (topic.isVisible === undefined || topic.isVisible === null) {
                updateData.isVisible = true;
                needUpdate = true;
            }

            if (topic.allowPosts === undefined || topic.allowPosts === null) {
                updateData.allowPosts = true;
                needUpdate = true;
            }

            if (topic.requireApproval === undefined || topic.requireApproval === null) {
                updateData.requireApproval = false;
                needUpdate = true;
            }

            if (topic.viewCount === undefined || topic.viewCount === null) {
                updateData.viewCount = 0;
                needUpdate = true;
            }

            if (needUpdate) {
                await Topic.findByIdAndUpdate(topic._id, updateData);
                updatedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Đã sửa dữ liệu cho ${updatedCount} chủ đề`,
            data: {
                totalTopics: topics.length,
                updatedTopics: updatedCount
            }
        });
    } catch (error) {
        console.error('Lỗi khi sửa dữ liệu chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi sửa dữ liệu chủ đề',
            error: error.message
        });
    }
};
