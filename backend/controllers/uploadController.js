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