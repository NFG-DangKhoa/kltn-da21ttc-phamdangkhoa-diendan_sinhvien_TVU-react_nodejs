const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AdminDataController = require('../controllers/adminDataController');
const authenticateToken = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/isAdminMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/imports');
        // Create directory if it doesn't exist
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)'));
        }
    }
});

// Initialize controller
const dataController = new AdminDataController();

// Apply authentication middleware
router.use(authenticateToken);
router.use(requireAdmin);

// Routes for data management

// GET /admin/data/stats - Lấy thống kê tổng quan
router.get('/stats', async (req, res) => {
    await dataController.getDataStats(req, res);
});

// POST /admin/data/export - Xuất dữ liệu
router.post('/export', async (req, res) => {
    await dataController.exportData(req, res);
});

// POST /admin/data/import - Nhập dữ liệu
router.post('/import', upload.single('file'), async (req, res) => {
    await dataController.importData(req, res);
});

// GET /admin/data/exports - Lấy lịch sử xuất dữ liệu
router.get('/exports', async (req, res) => {
    try {
        // Giả sử có model ExportLog để lưu lịch sử export
        // Tạm thời trả về dữ liệu mẫu
        const exportHistory = [
            {
                _id: '1',
                dataType: 'users',
                format: 'excel',
                status: 'success',
                recordCount: 150,
                fileSize: 25600,
                downloadUrl: '/downloads/users_export_2024-01-15.xlsx',
                createdAt: new Date('2024-01-15'),
                createdBy: req.user.id
            },
            {
                _id: '2',
                dataType: 'posts',
                format: 'csv',
                status: 'success',
                recordCount: 89,
                fileSize: 15400,
                downloadUrl: '/downloads/posts_export_2024-01-14.csv',
                createdAt: new Date('2024-01-14'),
                createdBy: req.user.id
            }
        ];

        res.json({
            success: true,
            exports: exportHistory
        });
    } catch (error) {
        console.error('Error fetching export history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử xuất dữ liệu',
            error: error.message
        });
    }
});

// GET /admin/data/imports - Lấy lịch sử nhập dữ liệu
router.get('/imports', async (req, res) => {
    try {
        // Giả sử có model ImportLog để lưu lịch sử import
        // Tạm thời trả về dữ liệu mẫu
        const importHistory = [
            {
                _id: '1',
                dataType: 'users',
                fileName: 'new_users.xlsx',
                status: 'success',
                totalRecords: 50,
                successRecords: 48,
                errorRecords: 2,
                createdAt: new Date('2024-01-15'),
                createdBy: req.user.id,
                errors: [
                    { row: 15, message: 'Email đã tồn tại' },
                    { row: 32, message: 'Định dạng email không hợp lệ' }
                ]
            },
            {
                _id: '2',
                dataType: 'topics',
                fileName: 'topics_update.csv',
                status: 'success',
                totalRecords: 10,
                successRecords: 10,
                errorRecords: 0,
                createdAt: new Date('2024-01-14'),
                createdBy: req.user.id,
                errors: []
            }
        ];

        res.json({
            success: true,
            imports: importHistory
        });
    } catch (error) {
        console.error('Error fetching import history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử nhập dữ liệu',
            error: error.message
        });
    }
});

// Backup and Restore routes

// POST /admin/data/backup - Tạo backup
router.post('/backup', async (req, res) => {
    await dataController.createBackup(req, res);
});

// GET /admin/data/backups - Lấy danh sách backup
router.get('/backups', async (req, res) => {
    await dataController.getBackups(req, res);
});

// POST /admin/data/restore/:backupId - Khôi phục từ backup
router.post('/restore/:backupId', async (req, res) => {
    await dataController.restoreBackup(req, res);
});

// DELETE /admin/data/backups/:backupId - Xóa backup
router.delete('/backups/:backupId', async (req, res) => {
    await dataController.deleteBackup(req, res);
});

// GET /admin/data/download/:filename - Download exported files
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../downloads', filename);

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại'
            });
        }

        // Send file
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Lỗi khi tải file'
                });
            }
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải file',
            error: error.message
        });
    }
});

// GET /admin/data/templates/:dataType - Lấy template cho import
router.get('/templates/:dataType', async (req, res) => {
    try {
        const { dataType } = req.params;

        let template = {};

        switch (dataType) {
            case 'users':
                template = {
                    fullName: 'Nguyễn Văn A',
                    email: 'user@example.com',
                    username: 'username',
                    role: 'user',
                    isEmailVerified: true
                };
                break;

            case 'posts':
                template = {
                    title: 'Tiêu đề bài viết',
                    content: 'Nội dung bài viết',
                    authorId: 'ID tác giả',
                    topicId: 'ID chủ đề',
                    status: 'published',
                    isApproved: true
                };
                break;

            case 'topics':
                template = {
                    name: 'Tên chủ đề',
                    description: 'Mô tả chủ đề',
                    isActive: true
                };
                break;

            case 'comments':
                template = {
                    content: 'Nội dung bình luận',
                    authorId: 'ID tác giả',
                    postId: 'ID bài viết',
                    isApproved: true
                };
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Loại dữ liệu không hợp lệ'
                });
        }

        // Create Excel template
        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.json_to_sheet([template]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${dataType}_template.xlsx"`);
        res.send(buffer);

    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo template',
            error: error.message
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn. Kích thước tối đa là 50MB'
            });
        }
    }

    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
});

module.exports = router;
