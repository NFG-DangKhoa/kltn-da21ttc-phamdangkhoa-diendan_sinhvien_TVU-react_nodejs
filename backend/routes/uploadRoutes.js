const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage, uploadImageUrl } = require('../controllers/uploadController'); // Import hàm mới

const router = express.Router();

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Route upload ảnh từ file
router.post('/image', upload.single('image'), uploadImage);

// Route upload ảnh từ URL
router.post('/image-url', uploadImageUrl); // Route mới

module.exports = router;