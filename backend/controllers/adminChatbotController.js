// File: backend/controllers/adminChatbotController.js
const ChatbotIntent = require('../models/ChatbotIntent');
const ChatbotConversation = require('../models/ChatbotConversation');
const DialogflowService = require('../services/dialogflowService');
const mongoose = require('mongoose');

/**
 * @route GET /api/admin/chatbot/intents
 * @desc Lấy danh sách intents
 * @access Private (Admin Only)
 */
exports.getIntents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            category = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        // Build sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const intents = await ChatbotIntent.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        const totalIntents = await ChatbotIntent.countDocuments(query);
        const totalPages = Math.ceil(totalIntents / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                intents,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalIntents,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting intents:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách intents',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/intents/:id
 * @desc Lấy chi tiết intent
 * @access Private (Admin Only)
 */
exports.getIntentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID intent không hợp lệ'
            });
        }

        const intent = await ChatbotIntent.findById(id)
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        if (!intent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy intent'
            });
        }

        res.status(200).json({
            success: true,
            data: intent
        });
    } catch (error) {
        console.error('Error getting intent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin intent',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/intents
 * @desc Tạo intent mới
 * @access Private (Admin Only)
 */
exports.createIntent = async (req, res) => {
    try {
        const {
            name,
            displayName,
            description,
            category,
            trainingPhrases,
            responses,
            parameters,
            inputContexts,
            outputContexts,
            events,
            webhook,
            tags
        } = req.body;

        const adminId = req.user._id;

        // Validate required fields
        if (!name || !displayName || !trainingPhrases || trainingPhrases.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tên, tên hiển thị và câu huấn luyện là bắt buộc'
            });
        }

        // Check if intent name exists
        const existingIntent = await ChatbotIntent.findOne({ name });
        if (existingIntent) {
            return res.status(400).json({
                success: false,
                message: 'Tên intent đã tồn tại'
            });
        }

        // Create intent in database
        const newIntent = new ChatbotIntent({
            name,
            displayName,
            description,
            category: category || 'other',
            trainingPhrases: trainingPhrases || [],
            responses: responses || [],
            parameters: parameters || [],
            inputContexts: inputContexts || [],
            outputContexts: outputContexts || [],
            events: events || [],
            webhook: webhook || { enabled: false },
            tags: tags || [],
            createdBy: adminId,
            status: 'draft'
        });

        const savedIntent = await newIntent.save();

        // Sync with Dialogflow
        try {
            // Kiểm tra cấu hình Dialogflow trước khi sync
            if (!process.env.DIALOGFLOW_PROJECT_ID) {
                console.log('⚠️ Dialogflow chưa được cấu hình, bỏ qua sync');
                savedIntent.dialogflow.syncStatus = 'error';
                savedIntent.dialogflow.syncError = 'Dialogflow chưa được cấu hình';
                await savedIntent.save();
            } else {
                const dialogflowService = DialogflowService.instance();
                const dialogflowResult = await dialogflowService.createIntent({
                    displayName: savedIntent.displayName,
                    trainingPhrases: savedIntent.trainingPhrases,
                    responses: savedIntent.responses,
                    parameters: savedIntent.parameters,
                    inputContexts: savedIntent.inputContexts,
                    outputContexts: savedIntent.outputContexts,
                    events: savedIntent.events
                });

                if (dialogflowResult.success) {
                    savedIntent.dialogflow.intentId = dialogflowResult.data.intentId;
                    savedIntent.dialogflow.projectId = process.env.DIALOGFLOW_PROJECT_ID;
                    savedIntent.dialogflow.syncStatus = 'synced';
                    savedIntent.dialogflow.lastSynced = new Date();
                    savedIntent.status = 'active';
                    await savedIntent.save();
                } else {
                    savedIntent.dialogflow.syncStatus = 'error';
                    savedIntent.dialogflow.syncError = dialogflowResult.error;
                    await savedIntent.save();
                }
            }
        } catch (syncError) {
            console.error('Error syncing with Dialogflow:', syncError);
            savedIntent.dialogflow.syncStatus = 'error';
            savedIntent.dialogflow.syncError = syncError.message;
            await savedIntent.save();
        }

        await savedIntent.populate('createdBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Tạo intent thành công',
            data: savedIntent
        });
    } catch (error) {
        console.error('Error creating intent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo intent',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/chatbot/intents/:id
 * @desc Cập nhật intent
 * @access Private (Admin Only)
 */
exports.updateIntent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID intent không hợp lệ'
            });
        }

        const intent = await ChatbotIntent.findById(id);
        if (!intent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy intent'
            });
        }

        // Check if name is being changed and if it conflicts
        if (req.body.name && req.body.name !== intent.name) {
            const existingIntent = await ChatbotIntent.findOne({
                name: req.body.name,
                _id: { $ne: id }
            });
            if (existingIntent) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên intent đã tồn tại'
                });
            }
        }

        // Update fields
        const allowedFields = [
            'name', 'displayName', 'description', 'category',
            'trainingPhrases', 'responses', 'parameters',
            'inputContexts', 'outputContexts', 'events',
            'webhook', 'tags', 'status'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                intent[field] = req.body[field];
            }
        });

        intent.updatedBy = adminId;
        intent.dialogflow.syncStatus = 'pending';

        const updatedIntent = await intent.save();

        // Sync with Dialogflow if intent has dialogflow ID
        if (intent.dialogflow.intentId) {
            try {
                const dialogflowService = DialogflowService.instance();
                const dialogflowResult = await dialogflowService.updateIntent(
                    intent.dialogflow.intentId,
                    {
                        displayName: updatedIntent.displayName,
                        trainingPhrases: updatedIntent.trainingPhrases,
                        responses: updatedIntent.responses,
                        parameters: updatedIntent.parameters,
                        inputContexts: updatedIntent.inputContexts,
                        outputContexts: updatedIntent.outputContexts,
                        events: updatedIntent.events
                    }
                );

                if (dialogflowResult.success) {
                    updatedIntent.dialogflow.syncStatus = 'synced';
                    updatedIntent.dialogflow.lastSynced = new Date();
                    updatedIntent.dialogflow.syncError = null;
                } else {
                    updatedIntent.dialogflow.syncStatus = 'error';
                    updatedIntent.dialogflow.syncError = dialogflowResult.error;
                }
                await updatedIntent.save();
            } catch (syncError) {
                console.error('Error syncing with Dialogflow:', syncError);
                updatedIntent.dialogflow.syncStatus = 'error';
                updatedIntent.dialogflow.syncError = syncError.message;
                await updatedIntent.save();
            }
        }

        await updatedIntent.populate(['createdBy', 'updatedBy'], 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Cập nhật intent thành công',
            data: updatedIntent
        });
    } catch (error) {
        console.error('Error updating intent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật intent',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/admin/chatbot/intents/:id
 * @desc Xóa intent
 * @access Private (Admin Only)
 */
exports.deleteIntent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID intent không hợp lệ'
            });
        }

        const intent = await ChatbotIntent.findById(id);
        if (!intent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy intent'
            });
        }

        // Delete from Dialogflow first
        if (intent.dialogflow.intentId) {
            try {
                const dialogflowService = DialogflowService.instance();
                await dialogflowService.deleteIntent(intent.dialogflow.intentId);
            } catch (error) {
                console.error('Error deleting from Dialogflow:', error);
                // Continue with database deletion even if Dialogflow deletion fails
            }
        }

        // Delete from database
        await ChatbotIntent.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa intent thành công'
        });
    } catch (error) {
        console.error('Error deleting intent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa intent',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/intents/:id/training-phrases
 * @desc Thêm training phrase
 * @access Private (Admin Only)
 */
exports.addTrainingPhrase = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, entities } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Text training phrase là bắt buộc'
            });
        }

        const intent = await ChatbotIntent.findById(id);
        if (!intent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy intent'
            });
        }

        await intent.addTrainingPhrase(text.trim(), entities || []);

        res.status(200).json({
            success: true,
            message: 'Thêm training phrase thành công',
            data: intent
        });
    } catch (error) {
        console.error('Error adding training phrase:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm training phrase',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/intents/:id/responses
 * @desc Thêm response
 * @access Private (Admin Only)
 */
exports.addResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, text, card, quickReplies, customPayload } = req.body;

        if (!type || !text) {
            return res.status(400).json({
                success: false,
                message: 'Type và text response là bắt buộc'
            });
        }

        const intent = await ChatbotIntent.findById(id);
        if (!intent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy intent'
            });
        }

        const response = {
            type,
            text: text.trim(),
            card,
            quickReplies,
            customPayload
        };

        await intent.addResponse(response);

        res.status(200).json({
            success: true,
            message: 'Thêm response thành công',
            data: intent
        });
    } catch (error) {
        console.error('Error adding response:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm response',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/sync
 * @desc Sync tất cả intents với Dialogflow
 * @access Private (Admin Only)
 */
exports.syncWithDialogflow = async (req, res) => {
    try {
        const pendingIntents = await ChatbotIntent.getNeedsSyncIntents();

        let syncedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const intent of pendingIntents) {
            try {
                const dialogflowService = DialogflowService.instance();
                let dialogflowResult;

                if (intent.dialogflow.intentId) {
                    // Update existing intent
                    dialogflowResult = await dialogflowService.updateIntent(
                        intent.dialogflow.intentId,
                        {
                            displayName: intent.displayName,
                            trainingPhrases: intent.trainingPhrases,
                            responses: intent.responses,
                            parameters: intent.parameters,
                            inputContexts: intent.inputContexts,
                            outputContexts: intent.outputContexts,
                            events: intent.events
                        }
                    );
                } else {
                    // Create new intent
                    dialogflowResult = await dialogflowService.createIntent({
                        displayName: intent.displayName,
                        trainingPhrases: intent.trainingPhrases,
                        responses: intent.responses,
                        parameters: intent.parameters,
                        inputContexts: intent.inputContexts,
                        outputContexts: intent.outputContexts,
                        events: intent.events
                    });

                    if (dialogflowResult.success) {
                        intent.dialogflow.intentId = dialogflowResult.data.intentId;
                        intent.dialogflow.projectId = process.env.DIALOGFLOW_PROJECT_ID;
                    }
                }

                if (dialogflowResult.success) {
                    intent.dialogflow.syncStatus = 'synced';
                    intent.dialogflow.lastSynced = new Date();
                    intent.dialogflow.syncError = null;
                    syncedCount++;
                } else {
                    intent.dialogflow.syncStatus = 'error';
                    intent.dialogflow.syncError = dialogflowResult.error;
                    errorCount++;
                    errors.push({
                        intentName: intent.name,
                        error: dialogflowResult.error
                    });
                }

                await intent.save();
            } catch (error) {
                console.error(`Error syncing intent ${intent.name}:`, error);
                intent.dialogflow.syncStatus = 'error';
                intent.dialogflow.syncError = error.message;
                await intent.save();
                errorCount++;
                errors.push({
                    intentName: intent.name,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Sync hoàn thành: ${syncedCount} thành công, ${errorCount} lỗi`,
            data: {
                syncedCount,
                errorCount,
                errors: errors.slice(0, 10) // Chỉ trả về 10 lỗi đầu tiên
            }
        });
    } catch (error) {
        console.error('Error syncing with Dialogflow:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi sync với Dialogflow',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/train
 * @desc Huấn luyện lại agent
 * @access Private (Admin Only)
 */
exports.trainAgent = async (req, res) => {
    try {
        // Kiểm tra cấu hình Dialogflow
        if (!process.env.DIALOGFLOW_PROJECT_ID) {
            return res.status(400).json({
                success: false,
                message: 'Dialogflow chưa được cấu hình',
                error: 'DIALOGFLOW_PROJECT_ID không được thiết lập'
            });
        }

        const dialogflowService = DialogflowService.instance();
        const result = await dialogflowService.trainAgent();

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Huấn luyện agent thành công',
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi huấn luyện agent',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error training agent:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi huấn luyện agent',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/conversations
 * @desc Lấy danh sách conversations
 * @access Private (Admin Only)
 */
exports.getConversations = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = '',
            needsReview = '',
            startDate = '',
            endDate = '',
            sortBy = 'startedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (status) {
            query.status = status;
        }

        if (needsReview !== '') {
            query.needsReview = needsReview === 'true';
        }

        if (startDate && endDate) {
            query.startedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Build sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const conversations = await ChatbotConversation.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'fullName email')
            .populate('reviewedBy', 'fullName email');

        const totalConversations = await ChatbotConversation.countDocuments(query);
        const totalPages = Math.ceil(totalConversations / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                conversations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalConversations,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách conversations',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/conversations/:id
 * @desc Lấy chi tiết conversation
 * @access Private (Admin Only)
 */
exports.getConversationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID conversation không hợp lệ'
            });
        }

        const conversation = await ChatbotConversation.findById(id)
            .populate('userId', 'fullName email avatarUrl')
            .populate('reviewedBy', 'fullName email')
            .populate('adminNotes.addedBy', 'fullName email');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy conversation'
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin conversation',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/chatbot/conversations/:id/review
 * @desc Đánh dấu conversation đã review
 * @access Private (Admin Only)
 */
exports.markConversationReviewed = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;

        const conversation = await ChatbotConversation.findById(id);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy conversation'
            });
        }

        conversation.reviewed = true;
        conversation.reviewedBy = adminId;
        conversation.reviewedAt = new Date();
        conversation.needsReview = false;

        await conversation.save();

        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu conversation đã review',
            data: conversation
        });
    } catch (error) {
        console.error('Error marking conversation reviewed:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đánh dấu conversation',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/chatbot/conversations/:id/notes
 * @desc Thêm ghi chú cho conversation
 * @access Private (Admin Only)
 */
exports.addConversationNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const adminId = req.user._id;

        if (!note || note.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nội dung ghi chú là bắt buộc'
            });
        }

        const conversation = await ChatbotConversation.findById(id);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy conversation'
            });
        }

        conversation.adminNotes.push({
            note: note.trim(),
            addedBy: adminId,
            addedAt: new Date()
        });

        await conversation.save();
        await conversation.populate('adminNotes.addedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Thêm ghi chú thành công',
            data: conversation
        });
    } catch (error) {
        console.error('Error adding conversation note:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm ghi chú',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/analytics/overview
 * @desc Lấy thống kê tổng quan chatbot
 * @access Private (Admin Only)
 */
exports.getChatbotAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Thống kê tổng quan
        const totalIntents = await ChatbotIntent.countDocuments();
        const activeIntents = await ChatbotIntent.countDocuments({ status: 'active' });
        const totalConversations = await ChatbotConversation.countDocuments({
            startedAt: { $gte: startDate, $lte: endDate }
        });

        // Thống kê conversations
        const conversationStats = await ChatbotConversation.getConversationStats(startDate, endDate);

        // Intent phổ biến
        const popularIntents = await ChatbotConversation.getPopularIntents(startDate, endDate, 10);

        // Intent thất bại
        const failedIntents = await ChatbotConversation.getFailedIntents(startDate, endDate, 10);

        // Thống kê theo category
        const intentsByCategory = await ChatbotIntent.getIntentsByCategory();

        // Feedback stats
        const feedbackStats = await ChatbotConversation.aggregate([
            {
                $match: {
                    startedAt: { $gte: startDate, $lte: endDate },
                    'feedback.rating': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$feedback.rating' },
                    totalFeedback: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$feedback.rating'
                    }
                }
            }
        ]);

        // Conversations cần review
        const needsReviewCount = await ChatbotConversation.countDocuments({
            needsReview: true,
            reviewed: false
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalIntents,
                    activeIntents,
                    totalConversations,
                    needsReviewCount
                },
                conversationStats: conversationStats[0] || {},
                popularIntents,
                failedIntents,
                intentsByCategory,
                feedbackStats: feedbackStats[0] || {},
                period: {
                    days: parseInt(days),
                    startDate,
                    endDate
                }
            }
        });
    } catch (error) {
        console.error('Error getting chatbot analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê chatbot',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/analytics/intents
 * @desc Lấy thống kê intents
 * @access Private (Admin Only)
 */
exports.getIntentAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Top intents theo trigger count
        const topIntents = await ChatbotIntent.getPopularIntents(20);

        // Intents có success rate thấp
        const lowSuccessRateIntents = await ChatbotIntent.find({
            'stats.triggerCount': { $gte: 5 },
            status: 'active'
        })
            .sort({ 'stats.avgConfidence': 1 })
            .limit(10)
            .populate('createdBy', 'fullName email');

        // Intents chưa được sync
        const unsyncedIntents = await ChatbotIntent.find({
            'dialogflow.syncStatus': { $in: ['pending', 'error'] }
        })
            .populate('createdBy', 'fullName email');

        // Thống kê theo thời gian tạo
        const intentCreationTrend = await ChatbotIntent.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                topIntents,
                lowSuccessRateIntents,
                unsyncedIntents,
                intentCreationTrend
            }
        });
    } catch (error) {
        console.error('Error getting intent analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê intents',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/chatbot/analytics/conversations
 * @desc Lấy thống kê conversations
 * @access Private (Admin Only)
 */
exports.getConversationAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Conversations theo ngày
        const conversationTrend = await ChatbotConversation.aggregate([
            {
                $match: {
                    startedAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startedAt' },
                        month: { $month: '$startedAt' },
                        day: { $dayOfMonth: '$startedAt' }
                    },
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                    avgMessages: { $avg: '$stats.totalMessages' }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Conversations theo giờ
        const conversationByHour = await ChatbotConversation.aggregate([
            {
                $match: {
                    startedAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $hour: '$startedAt' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Conversations theo device
        const conversationByDevice = await ChatbotConversation.aggregate([
            {
                $match: {
                    startedAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$sessionInfo.deviceType',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Feedback distribution
        const feedbackDistribution = await ChatbotConversation.aggregate([
            {
                $match: {
                    startedAt: { $gte: startDate, $lte: endDate },
                    'feedback.rating': { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$feedback.rating',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                conversationTrend,
                conversationByHour,
                conversationByDevice,
                feedbackDistribution
            }
        });
    } catch (error) {
        console.error('Error getting conversation analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê conversations',
            error: error.message
        });
    }
};
