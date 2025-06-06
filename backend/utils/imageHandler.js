const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Cần cài đặt: npm install axios
const { URL } = require('url'); // Sử dụng URL constructor từ Node.js

/**
 * Tải ảnh từ một URL và lưu vào thư mục cục bộ.
 * @param {string} imageUrl - URL của ảnh cần tải.
 * @returns {Promise<string|null>} - Đường dẫn cục bộ của ảnh đã lưu (e.g., '/uploads/filename.ext') hoặc null nếu lỗi.
 */
async function downloadAndSaveImage(imageUrl) {
    try {
        // Kiểm tra nếu URL không hợp lệ hoặc không phải HTTP/HTTPS
        if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
            console.warn(`[ImageHandler] Bỏ qua URL không hợp lệ hoặc không phải HTTP(S): ${imageUrl}`);
            return null;
        }

        const urlObj = new URL(imageUrl);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(urlObj.pathname)}`;
        const localPath = path.join(__dirname, '../public/upload', filename); // Đường dẫn lưu trữ cục bộ

        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
            timeout: 10000 // Thêm timeout để tránh kẹt mãi mãi
        });

        if (response.status !== 200) {
            console.error(`[ImageHandler] Lỗi khi tải ảnh từ ${imageUrl}: Status ${response.status}`);
            return null;
        }

        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`[ImageHandler] Đã tải và lưu ảnh: ${localPath}`);
                resolve(`/uploads/${filename}`); // Trả về URL cục bộ để sử dụng trong nội dung bài viết
            });
            writer.on('error', (err) => {
                console.error(`[ImageHandler] Lỗi khi lưu ảnh ${localPath}:`, err);
                fs.unlink(localPath, () => { }); // Xóa file nếu có lỗi
                reject(err);
            });
        });

    } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
            console.warn(`[ImageHandler] URL không hợp lệ: ${imageUrl}. Bỏ qua.`);
        } else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error(`[ImageHandler] Hết thời gian chờ khi tải ảnh từ ${imageUrl}`);
        } else {
            console.error(`[ImageHandler] Lỗi chung khi xử lý ảnh ${imageUrl}:`, error.message);
        }
        return null;
    }
}

/**
 * Hàm helper để trích xuất tất cả src của thẻ <img> trong HTML
 */
const extractImageUrls = (htmlContent) => {
    const imageUrls = [];
    const imgTagRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/gi;
    let match;
    while ((match = imgTagRegex.exec(htmlContent))) {
        imageUrls.push(match[1].trim());
    }
    return imageUrls;
};

// Hàm để kiểm tra URL có phải là cục bộ không
function isLocalImageUrl(url) {
    try {
        const urlObj = new URL(url, 'http://dummy-base-url.com'); // Add a base URL for relative paths
        // Kiểm tra pathname có bắt đầu bằng '/uploads/' không
        return urlObj.pathname.startsWith('/uploads/');
    } catch (e) {
        return false;
    }
}

// Hàm để xóa các tệp ảnh vật lý khỏi thư mục public/upload
function deletePhysicalImage(filename) {
    const filePath = path.join(__dirname, '../public/upload', filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.warn(`[ImageHandler] File ảnh vật lý không tồn tại: ${filePath}. Có thể đã bị xóa trước đó.`);
            } else {
                console.error(`[ImageHandler] Lỗi khi xóa file ảnh vật lý ${filePath}:`, err);
            }
        } else {
            console.log(`[ImageHandler] Đã xóa file ảnh vật lý: ${filePath}`);
        }
    });
}

// Hàm này sẽ trích xuất tên file ảnh từ các URL ảnh
function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url, 'http://dummy-base-url.com'); // Add a base URL for relative paths
        return path.basename(urlObj.pathname);
    } catch (e) {
        console.error("URL ảnh không hợp lệ hoặc không thể trích xuất tên file:", url, e);
        return null;
    }
}

module.exports = {
    downloadAndSaveImage,
    extractImageUrls,
    isLocalImageUrl,
    deletePhysicalImage,
    extractFilenameFromUrl
};