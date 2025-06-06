// File: backend/controllers/imageController.js
const Image = require('../models/Image');

const uploadImage = async (req, res) => {
    try {
        const { caption, isMain } = req.body;
        const { postId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const image = new Image({
            postId,
            url: `/upload/${req.file.filename}`,
            caption,
            isMain: isMain || false,
        });

        await image.save();
        res.status(201).json(image);
    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        res.status(500).json({ message: "Lỗi khi upload ảnh", error });
    }
};


module.exports = {
    uploadImage
};

