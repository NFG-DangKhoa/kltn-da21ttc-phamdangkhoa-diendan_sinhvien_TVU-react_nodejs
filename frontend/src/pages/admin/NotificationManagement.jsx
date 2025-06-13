import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon,
    Campaign as CampaignIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import API from '../../services/api.jsx';

const NotificationManagement = () => {
    const [open, setOpen] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState({
        title: '',
        message: '',
        targetRole: 'all',
        priority: 'normal',
        expiresAt: ''
    });
    const [userNotificationForm, setUserNotificationForm] = useState({
        userId: '',
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal'
    });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [dialogType, setDialogType] = useState('broadcast'); // 'broadcast' or 'user'

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await API.get('/notifications/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching notification stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await API.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleBroadcastSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await API.post('/notifications/broadcast', broadcastForm);
            
            setSuccess(response.data.message);
            setBroadcastForm({
                title: '',
                message: '',
                targetRole: 'all',
                priority: 'normal',
                expiresAt: ''
            });
            setOpen(false);
            fetchStats();
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi khi gửi thông báo broadcast');
        } finally {
            setLoading(false);
        }
    };

    const handleUserNotificationSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await API.post('/notifications/user', userNotificationForm);
            
            setSuccess(response.data.message);
            setUserNotificationForm({
                userId: '',
                title: '',
                message: '',
                type: 'announcement',
                priority: 'normal'
            });
            setOpen(false);
            fetchStats();
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi khi gửi thông báo cho user');
        } finally {
            setLoading(false);
        }
    };

    const openBroadcastDialog = () => {
        setDialogType('broadcast');
        setOpen(true);
    };

    const openUserDialog = () => {
        setDialogType('user');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError('');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon color="primary" />
                Quản lý Thông báo
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Button
                        variant="contained"
                        startIcon={<CampaignIcon />}
                        onClick={openBroadcastDialog}
                        fullWidth
                        sx={{ py: 2 }}
                    >
                        Gửi thông báo cho tất cả
                    </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Button
                        variant="outlined"
                        startIcon={<PersonIcon />}
                        onClick={openUserDialog}
                        fullWidth
                        sx={{ py: 2 }}
                    >
                        Gửi thông báo cho user cụ thể
                    </Button>
                </Grid>
            </Grid>

            {/* Notification Statistics */}
            {stats && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Thống kê Thông báo
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {stats.totalNotifications}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng thông báo
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main">
                                        {stats.totalUnread}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa đọc
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main">
                                        {stats.stats?.length || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Loại thông báo
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Notification Types Breakdown */}
                    {stats.stats && stats.stats.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Phân loại thông báo
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Loại</TableCell>
                                            <TableCell align="right">Tổng số</TableCell>
                                            <TableCell align="right">Chưa đọc</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.stats.map((stat) => (
                                            <TableRow key={stat._id}>
                                                <TableCell>
                                                    <Chip 
                                                        label={stat._id} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">{stat.count}</TableCell>
                                                <TableCell align="right">{stat.unreadCount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Broadcast Notification Dialog */}
            <Dialog open={open && dialogType === 'broadcast'} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CampaignIcon />
                        Gửi thông báo Broadcast
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                value={broadcastForm.title}
                                onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nội dung"
                                multiline
                                rows={4}
                                value={broadcastForm.message}
                                onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Đối tượng</InputLabel>
                                <Select
                                    value={broadcastForm.targetRole}
                                    onChange={(e) => setBroadcastForm({...broadcastForm, targetRole: e.target.value})}
                                    label="Đối tượng"
                                >
                                    <MenuItem value="all">Tất cả người dùng</MenuItem>
                                    <MenuItem value="user">Chỉ User</MenuItem>
                                    <MenuItem value="admin">Chỉ Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Độ ưu tiên</InputLabel>
                                <Select
                                    value={broadcastForm.priority}
                                    onChange={(e) => setBroadcastForm({...broadcastForm, priority: e.target.value})}
                                    label="Độ ưu tiên"
                                >
                                    <MenuItem value="low">Thấp</MenuItem>
                                    <MenuItem value="normal">Bình thường</MenuItem>
                                    <MenuItem value="high">Cao</MenuItem>
                                    <MenuItem value="urgent">Khẩn cấp</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Thời gian hết hạn (tùy chọn)"
                                type="datetime-local"
                                value={broadcastForm.expiresAt}
                                onChange={(e) => setBroadcastForm({...broadcastForm, expiresAt: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button 
                        onClick={handleBroadcastSubmit} 
                        variant="contained" 
                        disabled={loading || !broadcastForm.title || !broadcastForm.message}
                        startIcon={<SendIcon />}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* User Notification Dialog */}
            <Dialog open={open && dialogType === 'user'} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon />
                        Gửi thông báo cho User cụ thể
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Chọn User</InputLabel>
                                <Select
                                    value={userNotificationForm.userId}
                                    onChange={(e) => setUserNotificationForm({...userNotificationForm, userId: e.target.value})}
                                    label="Chọn User"
                                    required
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            {user.fullName} ({user.email}) - {user.role}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                value={userNotificationForm.title}
                                onChange={(e) => setUserNotificationForm({...userNotificationForm, title: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nội dung"
                                multiline
                                rows={4}
                                value={userNotificationForm.message}
                                onChange={(e) => setUserNotificationForm({...userNotificationForm, message: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Loại thông báo</InputLabel>
                                <Select
                                    value={userNotificationForm.type}
                                    onChange={(e) => setUserNotificationForm({...userNotificationForm, type: e.target.value})}
                                    label="Loại thông báo"
                                >
                                    <MenuItem value="announcement">Thông báo</MenuItem>
                                    <MenuItem value="account_warning">Cảnh báo</MenuItem>
                                    <MenuItem value="system_alert">Cảnh báo hệ thống</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Độ ưu tiên</InputLabel>
                                <Select
                                    value={userNotificationForm.priority}
                                    onChange={(e) => setUserNotificationForm({...userNotificationForm, priority: e.target.value})}
                                    label="Độ ưu tiên"
                                >
                                    <MenuItem value="low">Thấp</MenuItem>
                                    <MenuItem value="normal">Bình thường</MenuItem>
                                    <MenuItem value="high">Cao</MenuItem>
                                    <MenuItem value="urgent">Khẩn cấp</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button 
                        onClick={handleUserNotificationSubmit} 
                        variant="contained" 
                        disabled={loading || !userNotificationForm.userId || !userNotificationForm.title || !userNotificationForm.message}
                        startIcon={<SendIcon />}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationManagement;
