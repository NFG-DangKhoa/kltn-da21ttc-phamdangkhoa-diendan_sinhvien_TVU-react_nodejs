import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Avatar,
    Grid,
    TextField,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    IconButton,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Edit,
    Save,
    Cancel,
    Person,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    Security,
    Verified,
    AdminPanelSettings,
    Schedule,
    TrendingUp,
    ContactMail,
    Facebook,
    Language,
    Business
} from '@mui/icons-material';
import axios from 'axios';

const AdminProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [contactEditing, setContactEditing] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        department: '',
        workingHours: '',
        socialLinks: {
            facebook: '',
            website: '',
            email: ''
        }
    });

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [profileData, setProfileData] = useState({
        fullName: user.fullName || 'Administrator',
        email: user.email || 'admin@tvu.edu.vn',
        phone: '+84 123 456 789',
        address: 'Trà Vinh University, Trà Vinh',
        bio: 'Quản trị viên hệ thống diễn đàn sinh viên Trà Vinh University. Chuyên quản lý nội dung, người dùng và phân tích dữ liệu.',
        joinDate: '2024-01-01',
        lastLogin: new Date().toLocaleString('vi-VN')
    });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        // Update localStorage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original data
        setProfileData({
            fullName: user.fullName || 'Administrator',
            email: user.email || 'admin@tvu.edu.vn',
            phone: '+84 123 456 789',
            address: 'Trà Vinh University, Trà Vinh',
            bio: 'Quản trị viên hệ thống diễn đàn sinh viên Trà Vinh University. Chuyên quản lý nội dung, người dùng và phân tích dữ liệu.',
            joinDate: '2024-01-01',
            lastLogin: new Date().toLocaleString('vi-VN')
        });
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Contact info functions
    const loadContactInfo = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await axios.get('http://localhost:5000/api/admin/profile/contact-info', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setContactInfo(response.data.data);
            }
        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    };

    const saveContactInfo = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await axios.put('http://localhost:5000/api/admin/contact-info', contactInfo, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setContactEditing(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error saving contact info:', error);
            alert('Lỗi khi lưu thông tin liên hệ');
        }
    };

    const handleContactInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setContactInfo(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setContactInfo(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Load contact info on mount
    useEffect(() => {
        loadContactInfo();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                👤 Trang Cá Nhân Admin
            </Typography>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Thông tin cá nhân" />
                    <Tab label="Thông tin liên hệ công khai" />
                </Tabs>
            </Box>

            {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Cập nhật thông tin thành công!
                </Alert>
            )}

            {/* Tab Panel 0: Personal Info */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {/* Profile Card */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        margin: '0 auto 16px',
                                        bgcolor: 'primary.main',
                                        fontSize: '3rem'
                                    }}
                                    src={user.avatarUrl}
                                >
                                    {profileData.fullName.charAt(0)}
                                </Avatar>

                                <Typography variant="h5" gutterBottom>
                                    {profileData.fullName}
                                </Typography>

                                <Chip
                                    icon={<AdminPanelSettings />}
                                    label="Quản trị viên"
                                    color="primary"
                                    sx={{ mb: 2 }}
                                />

                                <Chip
                                    icon={<Verified />}
                                    label="Đã xác thực"
                                    color="success"
                                    size="small"
                                    sx={{ mb: 2, ml: 1 }}
                                />

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {profileData.bio}
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    {!isEditing ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={handleEdit}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="contained"
                                                startIcon={<Save />}
                                                onClick={handleSave}
                                                color="success"
                                            >
                                                Lưu
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Cancel />}
                                                onClick={handleCancel}
                                            >
                                                Hủy
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📊 Thống kê nhanh
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Schedule color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Thời gian online"
                                            secondary="8 giờ 30 phút hôm nay"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <TrendingUp color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Hoạt động"
                                            secondary="25 tác vụ hoàn thành"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Profile Details */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📝 Thông tin chi tiết
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Họ và tên"
                                            value={profileData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            disabled={!isEditing}
                                            variant={isEditing ? "outlined" : "filled"}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={profileData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            disabled={!isEditing}
                                            variant={isEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Số điện thoại"
                                            value={profileData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            disabled={!isEditing}
                                            variant={isEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ"
                                            value={profileData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            disabled={!isEditing}
                                            variant={isEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Giới thiệu"
                                            value={profileData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            disabled={!isEditing}
                                            variant={isEditing ? "outlined" : "filled"}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" gutterBottom>
                                    🔐 Thông tin hệ thống
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Ngày tham gia"
                                            value={new Date(profileData.joinDate).toLocaleDateString('vi-VN')}
                                            disabled
                                            variant="filled"
                                            InputProps={{
                                                startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Lần đăng nhập cuối"
                                            value={profileData.lastLogin}
                                            disabled
                                            variant="filled"
                                            InputProps={{
                                                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🔒 Cài đặt bảo mật
                                </Typography>

                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Security color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Xác thực hai yếu tố"
                                            secondary="Đã bật - Bảo vệ tài khoản với mã OTP"
                                        />
                                        <Chip label="Đã bật" color="success" size="small" />
                                    </ListItem>

                                    <ListItem>
                                        <ListItemIcon>
                                            <Verified color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Email đã xác thực"
                                            secondary="Địa chỉ email đã được xác minh"
                                        />
                                        <Chip label="Đã xác thực" color="success" size="small" />
                                    </ListItem>
                                </List>

                                <Box sx={{ mt: 2 }}>
                                    <Button variant="outlined" startIcon={<Security />}>
                                        Đổi mật khẩu
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tab Panel 1: Contact Info */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6">
                                        📞 Thông tin liên hệ công khai
                                    </Typography>
                                    <Box>
                                        {!contactEditing ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<Edit />}
                                                onClick={() => setContactEditing(true)}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Save />}
                                                    onClick={saveContactInfo}
                                                    color="success"
                                                    sx={{ mr: 1 }}
                                                >
                                                    Lưu
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Cancel />}
                                                    onClick={() => setContactEditing(false)}
                                                >
                                                    Hủy
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Thông tin này sẽ hiển thị ở cuối trang chủ để người dùng có thể liên hệ với admin.
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Tên hiển thị"
                                            value={contactInfo.name}
                                            onChange={(e) => handleContactInputChange('name', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Chức vụ"
                                            value={contactInfo.title}
                                            onChange={(e) => handleContactInputChange('title', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email liên hệ"
                                            value={contactInfo.email}
                                            onChange={(e) => handleContactInputChange('email', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <ContactMail sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Số điện thoại"
                                            value={contactInfo.phone}
                                            onChange={(e) => handleContactInputChange('phone', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ"
                                            value={contactInfo.address}
                                            onChange={(e) => handleContactInputChange('address', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Mô tả"
                                            value={contactInfo.description}
                                            onChange={(e) => handleContactInputChange('description', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Phòng ban"
                                            value={contactInfo.department}
                                            onChange={(e) => handleContactInputChange('department', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Giờ làm việc"
                                            value={contactInfo.workingHours}
                                            onChange={(e) => handleContactInputChange('workingHours', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            🔗 Liên kết mạng xã hội
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Facebook"
                                            value={contactInfo.socialLinks?.facebook || ''}
                                            onChange={(e) => handleContactInputChange('socialLinks.facebook', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Facebook sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Website"
                                            value={contactInfo.socialLinks?.website || ''}
                                            onChange={(e) => handleContactInputChange('socialLinks.website', e.target.value)}
                                            disabled={!contactEditing}
                                            variant={contactEditing ? "outlined" : "filled"}
                                            InputProps={{
                                                startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default AdminProfile;
