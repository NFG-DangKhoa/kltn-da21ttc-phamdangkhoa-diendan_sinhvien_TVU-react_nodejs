// File: backend/controllers/commentController.js
const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
    try {
        const newComment = new Comment({ ...req.body, authorId: req.user.id });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

