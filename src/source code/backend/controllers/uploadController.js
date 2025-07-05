const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Cần cài đặt: npm install axios

exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file được tải lên' });
    }

    const url = `${req.protocol}://${req.get('host')}/upload/${req.file.filename}`;
    res.status(200).json({ url });
};

// Hàm mới để tải ảnh từ URL
exports.uploadImageUrl = async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Không có URL ảnh được cung cấp' });
    }

    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
        });

        // Kiểm tra Content-Type để đảm bảo đó là ảnh
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image')) {
            return res.status(400).json({ message: 'URL không trỏ đến một file ảnh hợp lệ' });
        }

        const extension = path.extname(imageUrl) || `.${contentType.split('/')[1]}`; // Lấy đuôi file từ URL hoặc Content-Type
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}${extension.split('?')[0]}`; // Loại bỏ query params khỏi đuôi file
        const filepath = path.join(__dirname, '../public/upload', filename);

        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                const url = `${req.protocol}://${req.get('host')}/upload/${filename}`;
                res.status(200).json({ url });
                resolve();
            });
            writer.on('error', (err) => {
                console.error('Lỗi khi ghi file ảnh từ URL:', err);
                res.status(500).json({ message: 'Lỗi server khi tải ảnh từ URL' });
                reject(err);
            });
        });

    } catch (error) {
        console.error('Lỗi khi xử lý URL ảnh:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Không tìm thấy ảnh từ URL đã cung cấp.' });
        }
        res.status(500).json({ message: 'Không thể tải ảnh từ URL này.' });
    }
};

// Upload ảnh vào temp folder (cho editor)
exports.uploadTempImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file được tải lên' });
    }

    const url = `${req.protocol}://${req.get('host')}/temp/${req.file.filename}`;
    console.log('📤 Temp image uploaded:', req.file.filename);
    res.status(200).json({ url });
};

// Xử lý ảnh khi đăng bài - convert data URLs thành files
exports.processImagesForPost = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Không có content được cung cấp' });
    }

    try {
        console.log('🔄 Processing images in content...');

        // Extract data URLs from content
        const dataUrlRegex = /data:image\/([a-zA-Z]*);base64,([^"']*)/g;
        const dataUrls = [];
        let match;

        while ((match = dataUrlRegex.exec(content)) !== null) {
            dataUrls.push({
                fullMatch: match[0],
                format: match[1],
                data: match[2]
            });
        }

        console.log(`📸 Found ${dataUrls.length} images to process`);

        let updatedContent = content;
        const processedImages = [];

        for (let i = 0; i < dataUrls.length; i++) {
            const { fullMatch, format, data } = dataUrls[i];

            try {
                // Generate unique filename
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}.${format}`;
                const filepath = path.join(__dirname, '../public/upload', filename);

                // Convert base64 to buffer and save
                const buffer = Buffer.from(data, 'base64');
                fs.writeFileSync(filepath, buffer);

                // Create new URL
                const newUrl = `/upload/${filename}`;

                // Replace data URL with file URL in content
                updatedContent = updatedContent.replace(fullMatch, newUrl);

                processedImages.push({
                    originalDataUrl: fullMatch.substring(0, 50) + '...',
                    newUrl: newUrl,
                    filename: filename,
                    size: buffer.length
                });

                console.log(`✅ Processed image ${i + 1}: ${filename} (${buffer.length} bytes)`);

            } catch (imageError) {
                console.error(`❌ Error processing image ${i + 1}:`, imageError);
            }
        }

        res.status(200).json({
            message: 'Images processed successfully',
            processedImages,
            updatedContent,
            totalProcessed: processedImages.length
        });

    } catch (error) {
        console.error('❌ Error processing images:', error);
        res.status(500).json({ message: 'Lỗi khi xử lý ảnh' });
    }
};

// Legacy function - keep for backward compatibility
exports.moveImagesToUpload = exports.processImagesForPost;

// Extract ảnh từ content
exports.extractImagesFromContent = (content) => {
    if (!content) return [];

    const imageUrls = [];

    // Extract URLs from img tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
        const url = match[1];
        // Chỉ lấy ảnh từ upload folder (bỏ qua data URLs và external URLs)
        if (url.includes('/upload/')) {
            const filename = url.split('/upload/')[1];
            if (filename) {
                imageUrls.push(filename);
            }
        }
    }

    return [...new Set(imageUrls)]; // Remove duplicates
};

// Xóa ảnh từ content cũ khi cập nhật bài viết
exports.cleanupOldImages = async (req, res) => {
    const { oldContent, newContent } = req.body;

    if (!oldContent) {
        return res.status(400).json({ message: 'Không có content cũ để so sánh' });
    }

    try {
        // Extract images from old and new content
        const oldImages = exports.extractImagesFromContent(oldContent);
        const newImages = exports.extractImagesFromContent(newContent || '');

        // Find images to delete (in old but not in new)
        const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

        console.log('🔍 Old images:', oldImages);
        console.log('🔍 New images:', newImages);
        console.log('🗑️ Images to delete:', imagesToDelete);

        const deletedImages = [];

        for (const filename of imagesToDelete) {
            const uploadPath = path.join(__dirname, '../public/upload', filename);

            if (fs.existsSync(uploadPath)) {
                fs.unlinkSync(uploadPath);
                deletedImages.push(filename);
                console.log(`🗑️ Deleted: ${filename}`);
            }
        }

        res.status(200).json({
            message: 'Old images cleaned up successfully',
            deletedImages,
            oldImagesCount: oldImages.length,
            newImagesCount: newImages.length,
            deletedCount: deletedImages.length
        });

    } catch (error) {
        console.error('❌ Error cleaning up old images:', error);
        res.status(500).json({ message: 'Lỗi khi dọn dẹp ảnh cũ' });
    }
};

// Xóa tất cả ảnh của bài viết
exports.deletePostImages = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Không có content để xóa ảnh' });
    }

    try {
        const images = exports.extractImagesFromContent(content);
        console.log('🗑️ Deleting all images from post:', images);

        const deletedImages = [];

        for (const filename of images) {
            const uploadPath = path.join(__dirname, '../public/upload', filename);

            if (fs.existsSync(uploadPath)) {
                fs.unlinkSync(uploadPath);
                deletedImages.push(filename);
                console.log(`🗑️ Deleted: ${filename}`);
            }
        }

        res.status(200).json({
            message: 'All post images deleted successfully',
            deletedImages,
            totalDeleted: deletedImages.length
        });

    } catch (error) {
        console.error('❌ Error deleting post images:', error);
        res.status(500).json({ message: 'Lỗi khi xóa ảnh bài viết' });
    }
};

// Legacy function - keep for backward compatibility
exports.deleteImages = exports.deletePostImages;