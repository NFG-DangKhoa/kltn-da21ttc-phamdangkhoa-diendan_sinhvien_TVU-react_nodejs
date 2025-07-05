const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    uploadImage,
    uploadImageUrl,
    uploadTempImage,
    processImagesForPost,
    moveImagesToUpload,
    cleanupOldImages,
    deletePostImages,
    deleteImages
} = require('../controllers/uploadController');

const router = express.Router();

// Tạo thư mục temp nếu chưa có
const tempDir = 'public/temp';
const uploadDir = 'public/upload';

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu ảnh vào upload (cho bài viết đã đăng)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Cấu hình lưu ảnh vào temp (cho editor)
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/temp');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const tempUpload = multer({ storage: tempStorage });

// Route upload ảnh vào temp (cho editor)
router.post('/temp-image', tempUpload.single('image'), uploadTempImage);

// Route upload ảnh vào upload (legacy)
router.post('/image', upload.single('image'), uploadImage);

// Route upload ảnh từ URL
router.post('/image-url', uploadImageUrl);

// Route xử lý ảnh khi đăng bài (convert data URLs thành files)
router.post('/process-images', processImagesForPost);

// Route move ảnh từ temp sang upload khi đăng bài (legacy)
router.post('/move-images', moveImagesToUpload);

// Route dọn dẹp ảnh cũ khi cập nhật bài viết
router.post('/cleanup-old-images', cleanupOldImages);

// Route xóa tất cả ảnh của bài viết
router.delete('/delete-post-images', deletePostImages);

// Route xóa ảnh (legacy)
router.delete('/delete-images', deleteImages);

module.exports = router;