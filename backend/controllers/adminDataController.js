const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { spawn } = require('child_process');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Topic = require('../models/Topic');
const Notification = require('../models/Notification');

class AdminDataController {
    // Lấy thống kê tổng quan
    async getDataStats(req, res) {
        try {
            const [
                totalUsers,
                totalPosts,
                totalComments,
                totalTopics,
                totalNotifications,
                totalExports,
                totalImports,
                totalBackups
            ] = await Promise.all([
                User.countDocuments(),
                Post.countDocuments(),
                Comment.countDocuments(),
                Topic.countDocuments(),
                Notification.countDocuments(),
                // Giả sử có model ExportLog và ImportLog
                0, // ExportLog.countDocuments(),
                0, // ImportLog.countDocuments(),
                this.getBackupCount()
            ]);

            const totalRecords = totalUsers + totalPosts + totalComments + totalTopics + totalNotifications;

            res.json({
                success: true,
                totalRecords,
                totalUsers,
                totalPosts,
                totalComments,
                totalTopics,
                totalNotifications,
                totalExports,
                totalImports,
                totalBackups
            });
        } catch (error) {
            console.error('Error fetching data stats:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê dữ liệu',
                error: error.message
            });
        }
    }

    // Xuất dữ liệu
    async exportData(req, res) {
        try {
            const {
                dataType,
                format = 'excel',
                dateFrom,
                dateTo,
                includeDeleted = false
            } = req.body;

            let data = [];
            let filename = '';

            // Build date filter
            const dateFilter = {};
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);

            const filter = {};
            if (Object.keys(dateFilter).length > 0) {
                filter.createdAt = dateFilter;
            }
            if (!includeDeleted) {
                filter.isDeleted = { $ne: true };
            }

            switch (dataType) {
                case 'users':
                    data = await User.find(filter)
                        .select('fullName email username role isEmailVerified createdAt lastLogin')
                        .lean();
                    filename = 'users_export';
                    break;

                case 'posts':
                    data = await Post.find(filter)
                        .populate('authorId', 'fullName email')
                        .populate('topicId', 'name')
                        .select('title content authorId topicId status isApproved createdAt updatedAt')
                        .lean();
                    filename = 'posts_export';
                    break;

                case 'comments':
                    data = await Comment.find(filter)
                        .populate('authorId', 'fullName email')
                        .populate('postId', 'title')
                        .select('content authorId postId isApproved createdAt')
                        .lean();
                    filename = 'comments_export';
                    break;

                case 'topics':
                    data = await Topic.find(filter)
                        .select('name description isActive createdAt')
                        .lean();
                    filename = 'topics_export';
                    break;

                case 'all':
                    // Export tất cả dữ liệu
                    const [users, posts, comments, topics] = await Promise.all([
                        User.find(filter).select('fullName email username role isEmailVerified createdAt').lean(),
                        Post.find(filter).populate('authorId', 'fullName').populate('topicId', 'name').lean(),
                        Comment.find(filter).populate('authorId', 'fullName').populate('postId', 'title').lean(),
                        Topic.find(filter).lean()
                    ]);
                    
                    if (format === 'excel') {
                        return this.exportAllDataAsExcel(res, { users, posts, comments, topics });
                    } else {
                        return this.exportAllDataAsCSV(res, { users, posts, comments, topics });
                    }

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Loại dữ liệu không hợp lệ'
                    });
            }

            // Flatten nested objects for export
            const flattenedData = data.map(item => this.flattenObject(item));

            if (format === 'excel') {
                this.exportAsExcel(res, flattenedData, filename);
            } else {
                this.exportAsCSV(res, flattenedData, filename);
            }

        } catch (error) {
            console.error('Error exporting data:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xuất dữ liệu',
                error: error.message
            });
        }
    }

    // Nhập dữ liệu
    async importData(req, res) {
        try {
            const { dataType, updateExisting = false, validateOnly = false } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn file để import'
                });
            }

            let data = [];
            const fileExtension = path.extname(file.originalname).toLowerCase();

            // Parse file based on extension
            if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                const workbook = XLSX.readFile(file.path);
                const sheetName = workbook.SheetNames[0];
                data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            } else if (fileExtension === '.csv') {
                data = await this.parseCSV(file.path);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận .xlsx, .xls, .csv'
                });
            }

            // Validate data
            const validationResult = await this.validateImportData(dataType, data);
            
            if (!validationResult.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: validationResult.errors
                });
            }

            if (validateOnly) {
                return res.json({
                    success: true,
                    message: 'Validation thành công',
                    validRecords: validationResult.validRecords,
                    totalRecords: data.length
                });
            }

            // Import data
            const importResult = await this.processImport(dataType, data, updateExisting);

            // Clean up uploaded file
            fs.unlinkSync(file.path);

            res.json({
                success: true,
                message: 'Import dữ liệu thành công',
                ...importResult
            });

        } catch (error) {
            console.error('Error importing data:', error);
            
            // Clean up uploaded file if exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi import dữ liệu',
                error: error.message
            });
        }
    }

    // Tạo backup
    async createBackup(req, res) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup_${timestamp}`;
            const backupPath = path.join(__dirname, '../backups', `${backupName}.gz`);

            // Ensure backup directory exists
            const backupDir = path.dirname(backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Create MongoDB dump
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dien_dan_TVU';
            const dbName = 'dien_dan_TVU';

            const mongodump = spawn('mongodump', [
                '--uri', mongoUri,
                '--db', dbName,
                '--archive', backupPath,
                '--gzip'
            ]);

            mongodump.on('close', (code) => {
                if (code === 0) {
                    // Get file size
                    const stats = fs.statSync(backupPath);
                    
                    res.json({
                        success: true,
                        message: 'Tạo backup thành công',
                        backup: {
                            name: backupName,
                            path: backupPath,
                            size: stats.size,
                            createdAt: new Date()
                        }
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi khi tạo backup'
                    });
                }
            });

            mongodump.on('error', (error) => {
                console.error('Backup error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Lỗi khi tạo backup',
                    error: error.message
                });
            });

        } catch (error) {
            console.error('Error creating backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo backup',
                error: error.message
            });
        }
    }

    // Khôi phục từ backup
    async restoreBackup(req, res) {
        try {
            const { backupId } = req.params;
            const backupPath = path.join(__dirname, '../backups', `${backupId}.gz`);

            if (!fs.existsSync(backupPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy file backup'
                });
            }

            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dien_dan_TVU';
            const dbName = 'dien_dan_TVU';

            // Drop existing database and restore
            const mongorestore = spawn('mongorestore', [
                '--uri', mongoUri,
                '--db', dbName,
                '--archive', backupPath,
                '--gzip',
                '--drop'
            ]);

            mongorestore.on('close', (code) => {
                if (code === 0) {
                    res.json({
                        success: true,
                        message: 'Khôi phục dữ liệu thành công'
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi khi khôi phục dữ liệu'
                    });
                }
            });

            mongorestore.on('error', (error) => {
                console.error('Restore error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Lỗi khi khôi phục dữ liệu',
                    error: error.message
                });
            });

        } catch (error) {
            console.error('Error restoring backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi khôi phục dữ liệu',
                error: error.message
            });
        }
    }

    // Lấy danh sách backup
    async getBackups(req, res) {
        try {
            const backupDir = path.join(__dirname, '../backups');
            
            if (!fs.existsSync(backupDir)) {
                return res.json({
                    success: true,
                    backups: []
                });
            }

            const files = fs.readdirSync(backupDir);
            const backups = files
                .filter(file => file.endsWith('.gz'))
                .map(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        _id: file.replace('.gz', ''),
                        name: file,
                        size: stats.size,
                        createdAt: stats.birthtime
                    };
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            res.json({
                success: true,
                backups
            });
        } catch (error) {
            console.error('Error fetching backups:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách backup',
                error: error.message
            });
        }
    }

    // Xóa backup
    async deleteBackup(req, res) {
        try {
            const { backupId } = req.params;
            const backupPath = path.join(__dirname, '../backups', `${backupId}.gz`);

            if (!fs.existsSync(backupPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy file backup'
                });
            }

            fs.unlinkSync(backupPath);

            res.json({
                success: true,
                message: 'Xóa backup thành công'
            });
        } catch (error) {
            console.error('Error deleting backup:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa backup',
                error: error.message
            });
        }
    }

    // Helper methods
    flattenObject(obj, prefix = '') {
        const flattened = {};
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
                Object.assign(flattened, this.flattenObject(obj[key], `${prefix}${key}.`));
            } else {
                flattened[`${prefix}${key}`] = obj[key];
            }
        }
        return flattened;
    }

    exportAsExcel(res, data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        res.send(buffer);
    }

    exportAsCSV(res, data, filename) {
        if (data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu để xuất'
            });
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvContent);
    }

    async parseCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }

    async validateImportData(dataType, data) {
        const errors = [];
        let validRecords = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowErrors = [];

            switch (dataType) {
                case 'users':
                    if (!row.email) rowErrors.push('Email là bắt buộc');
                    if (!row.fullName) rowErrors.push('Họ tên là bắt buộc');
                    if (row.email && !/\S+@\S+\.\S+/.test(row.email)) {
                        rowErrors.push('Email không hợp lệ');
                    }
                    break;

                case 'posts':
                    if (!row.title) rowErrors.push('Tiêu đề là bắt buộc');
                    if (!row.content) rowErrors.push('Nội dung là bắt buộc');
                    break;

                case 'topics':
                    if (!row.name) rowErrors.push('Tên chủ đề là bắt buộc');
                    break;
            }

            if (rowErrors.length > 0) {
                errors.push({
                    row: i + 1,
                    errors: rowErrors
                });
            } else {
                validRecords++;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            validRecords
        };
    }

    async processImport(dataType, data, updateExisting) {
        let created = 0;
        let updated = 0;
        let errors = 0;

        for (const row of data) {
            try {
                switch (dataType) {
                    case 'users':
                        const existingUser = await User.findOne({ email: row.email });
                        if (existingUser && updateExisting) {
                            await User.findByIdAndUpdate(existingUser._id, row);
                            updated++;
                        } else if (!existingUser) {
                            await User.create(row);
                            created++;
                        }
                        break;

                    case 'posts':
                        // Similar logic for posts
                        await Post.create(row);
                        created++;
                        break;

                    case 'topics':
                        const existingTopic = await Topic.findOne({ name: row.name });
                        if (existingTopic && updateExisting) {
                            await Topic.findByIdAndUpdate(existingTopic._id, row);
                            updated++;
                        } else if (!existingTopic) {
                            await Topic.create(row);
                            created++;
                        }
                        break;
                }
            } catch (error) {
                console.error('Import row error:', error);
                errors++;
            }
        }

        return { created, updated, errors };
    }

    async getBackupCount() {
        try {
            const backupDir = path.join(__dirname, '../backups');
            if (!fs.existsSync(backupDir)) {
                return 0;
            }
            const files = fs.readdirSync(backupDir);
            return files.filter(file => file.endsWith('.gz')).length;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = AdminDataController;
