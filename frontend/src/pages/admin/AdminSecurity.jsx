import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    Chip,
    Alert,
    Divider,
    Paper
} from '@mui/material';
import {
    Security,
    VpnKey,
    Smartphone,
    History,
    Warning,
    CheckCircle,
    Shield,
    Lock,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';

const AdminSecurity = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }
        
        // Simulate password change
        setShowSuccess(true);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const loginHistory = [
        { date: '2024-01-15 14:30', ip: '192.168.1.100', device: 'Chrome on Windows', location: 'Trà Vinh, Việt Nam', status: 'success' },
        { date: '2024-01-14 09:15', ip: '192.168.1.100', device: 'Chrome on Windows', location: 'Trà Vinh, Việt Nam', status: 'success' },
        { date: '2024-01-13 16:45', ip: '192.168.1.101', device: 'Firefox on Windows', location: 'Trà Vinh, Việt Nam', status: 'success' },
        { date: '2024-01-12 11:20', ip: '10.0.0.50', device: 'Safari on iPhone', location: 'TP.HCM, Việt Nam', status: 'failed' },
        { date: '2024-01-11 08:30', ip: '192.168.1.100', device: 'Chrome on Windows', location: 'Trà Vinh, Việt Nam', status: 'success' }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                🔒 Bảo Mật Tài Khoản
            </Typography>

            {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Cập nhật bảo mật thành công!
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Password Change */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🔑 Đổi Mật Khẩu
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Mật khẩu hiện tại"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                            </Button>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Mật khẩu mới"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                            </Button>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Xác nhận mật khẩu mới"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </Button>
                                        )
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<VpnKey />}
                                    onClick={handleChangePassword}
                                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                >
                                    Đổi Mật Khẩu
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Security Settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🛡️ Cài Đặt Bảo Mật
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Smartphone color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Xác thực hai yếu tố (2FA)"
                                        secondary="Bảo vệ tài khoản với mã OTP"
                                    />
                                    <Switch
                                        checked={twoFactorEnabled}
                                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                                        color="primary"
                                    />
                                </ListItem>

                                <Divider />

                                <ListItem>
                                    <ListItemIcon>
                                        <Security color="success" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Thông báo email bảo mật"
                                        secondary="Nhận cảnh báo khi có hoạt động đáng ngờ"
                                    />
                                    <Switch
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                        color="primary"
                                    />
                                </ListItem>

                                <Divider />

                                <ListItem>
                                    <ListItemIcon>
                                        <Shield color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Phiên đăng nhập"
                                        secondary="Quản lý các phiên đăng nhập hoạt động"
                                    />
                                    <Button variant="outlined" size="small">
                                        Quản lý
                                    </Button>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Security Status */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📊 Trạng Thái Bảo Mật
                            </Typography>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="h6">Mạnh</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Mật khẩu
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="h6">Đã bật</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            2FA
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="h6">An toàn</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Phiên đăng nhập
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="h6">Cảnh báo</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Đăng nhập lạ
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Login History */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📝 Lịch Sử Đăng Nhập
                            </Typography>

                            <List>
                                {loginHistory.map((login, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <History color={login.status === 'success' ? 'success' : 'error'} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body1">
                                                            {login.device}
                                                        </Typography>
                                                        <Chip
                                                            label={login.status === 'success' ? 'Thành công' : 'Thất bại'}
                                                            color={login.status === 'success' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {login.date} • {login.ip} • {login.location}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < loginHistory.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminSecurity;
