const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');

/**
 * @route GET /api/admin/contact-info
 * @desc Lấy thông tin liên hệ admin
 * @access Public
 */
exports.getAdminContactInfo = async (req, res) => {
    try {
        // Tìm admin user đầu tiên (Lê Văn B hoặc admin khác)
        const adminUser = await User.findOne({
            role: 'admin'
        }).sort({ createdAt: 1 }); // Lấy admin đầu tiên

        const contactInfoPath = path.join(__dirname, '../config/admin-contact-info.json');

        // Default contact info từ admin user
        const defaultContactInfo = {
            name: adminUser ? adminUser.fullName : 'Admin TVU Forum',
            title: 'Quản trị viên diễn đàn',
            email: adminUser ? adminUser.email : 'admin@tvu.edu.vn',
            phone: adminUser ? (adminUser.phone || '0123-456-789') : '0123-456-789',
            address: 'Trường Đại học Trà Vinh, Trà Vinh',
            description: 'Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với chúng tôi khi cần thiết!',
            avatar: adminUser ? (adminUser.avatarUrl || '/api/placeholder/150/150') : '/api/placeholder/150/150',
            socialLinks: {
                facebook: 'https://facebook.com/tvu.edu.vn',
                website: 'https://tvu.edu.vn',
                email: adminUser ? adminUser.email : 'admin@tvu.edu.vn'
            },
            workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
            department: 'Phòng Công nghệ Thông tin',
            updatedAt: new Date(),
            updatedBy: adminUser ? adminUser._id : null
        };

        try {
            const contactData = await fs.readFile(contactInfoPath, 'utf8');
            const settings = JSON.parse(contactData);

            // Merge với thông tin admin từ database
            const finalContactInfo = {
                ...defaultContactInfo,
                ...settings,
                // Luôn lấy tên và email mới nhất từ database
                name: adminUser ? adminUser.fullName : settings.name || defaultContactInfo.name,
                email: adminUser ? adminUser.email : settings.email || defaultContactInfo.email,
                avatar: adminUser ? (adminUser.avatarUrl || settings.avatar || defaultContactInfo.avatar) : (settings.avatar || defaultContactInfo.avatar)
            };

            res.status(200).json({
                success: true,
                data: finalContactInfo
            });
        } catch (fileError) {
            // File doesn't exist, return default settings from admin user
            res.status(200).json({
                success: true,
                data: defaultContactInfo
            });
        }
    } catch (error) {
        console.error('Error getting admin contact info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin liên hệ admin',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/contact-info
 * @desc Cập nhật thông tin liên hệ admin
 * @access Private (Admin Only)
 */
exports.updateAdminContactInfo = async (req, res) => {
    try {
        const adminId = req.user._id;
        const contactInfoPath = path.join(__dirname, '../config/admin-contact-info.json');

        const {
            name,
            title,
            email,
            phone,
            address,
            description,
            avatar,
            socialLinks,
            workingHours,
            department
        } = req.body;

        // Validation
        if (!name || !title || !email || !description) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc (tên, chức vụ, email, mô tả)'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Phone validation (optional)
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
                });
            }
        }

        // Prepare contact info object
        const contactInfo = {
            name: name.trim(),
            title: title.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            address: address ? address.trim() : '',
            description: description.trim(),
            avatar: avatar || '/api/placeholder/150/150',
            socialLinks: {
                facebook: socialLinks?.facebook || '',
                website: socialLinks?.website || '',
                email: email.trim().toLowerCase()
            },
            workingHours: workingHours || 'Thứ 2 - Thứ 6: 7:00 - 17:00',
            department: department || 'Phòng Công nghệ Thông tin',
            updatedAt: new Date(),
            updatedBy: adminId
        };

        // Ensure config directory exists
        const configDir = path.dirname(contactInfoPath);
        try {
            await fs.access(configDir);
        } catch {
            await fs.mkdir(configDir, { recursive: true });
        }

        // Save contact info to file
        await fs.writeFile(contactInfoPath, JSON.stringify(contactInfo, null, 2), 'utf8');

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin liên hệ thành công',
            data: contactInfo
        });
    } catch (error) {
        console.error('Error updating admin contact info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin liên hệ',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/profile/contact-info
 * @desc Lấy thông tin liên hệ admin cho trang profile admin
 * @access Private (Admin Only)
 */
exports.getAdminProfileContactInfo = async (req, res) => {
    try {
        const contactInfoPath = path.join(__dirname, '../config/admin-contact-info.json');

        try {
            const contactData = await fs.readFile(contactInfoPath, 'utf8');
            const contactInfo = JSON.parse(contactData);

            res.status(200).json({
                success: true,
                data: contactInfo
            });
        } catch (fileError) {
            // File doesn't exist, return default values for editing
            const defaultContactInfo = {
                name: 'Admin TVU Forum',
                title: 'Quản trị viên diễn đàn',
                email: 'admin@tvu.edu.vn',
                phone: '0123-456-789',
                address: 'Trường Đại học Trà Vinh, Trà Vinh',
                description: 'Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với chúng tôi khi cần thiết!',
                avatar: '/api/placeholder/150/150',
                socialLinks: {
                    facebook: 'https://facebook.com/tvu.edu.vn',
                    website: 'https://tvu.edu.vn',
                    email: 'admin@tvu.edu.vn'
                },
                workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
                department: 'Phòng Công nghệ Thông tin'
            };

            res.status(200).json({
                success: true,
                data: defaultContactInfo
            });
        }
    } catch (error) {
        console.error('Error getting admin profile contact info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin liên hệ admin',
            error: error.message
        });
    }
};
