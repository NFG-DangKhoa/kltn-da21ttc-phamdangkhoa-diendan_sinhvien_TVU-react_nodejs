import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    Avatar,
    Tooltip,
    Fab,
    Badge,
    Tabs,
    Tab
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Add as AddIcon,
    Send as SendIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Campaign as CampaignIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    FilterList as FilterIcon,
    AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
// Removed DateTimePicker imports to avoid dependency issues
import api from '../../services/api';
import AdminMarqueePage from '../Admin/AdminMarqueePage';

const AdminNotificationsPage = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('broadcast'); // 'broadcast' | 'individual'
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        targetRole: 'all',
        userId: '',
        expiresAt: null,
        actionUrl: ''
    });

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        priority: '',
        isRead: '',
        dateFrom: null,
        dateTo: null
    });

    useEffect(() => {
        fetchNotifications();
        fetchStats();
        fetchUsers();
    }, [page, rowsPerPage, filters]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                ...filters
            };

            const response = await api.get('/admin/notifications', { params });
            setNotifications(response.data.notifications);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showSnackbar('Lỗi khi tải thông báo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/notifications/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users?limit=1000');
            console.log('Users API response:', response.data); // Debug log

            // Handle API response format: { success: true, data: { users, pagination } }
            let usersData = [];
            if (response.data.success && response.data.data && response.data.data.users) {
                usersData = response.data.data.users;
            } else if (response.data.users) {
                usersData = response.data.users;
            } else if (Array.isArray(response.data)) {
                usersData = response.data;
            }

            console.log('Users data:', usersData); // Debug log
            console.log('Number of users:', usersData.length); // Debug log

            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]); // Set empty array on error
        }
    };

    const handleCreateNotification = async () => {
        try {
            setLoading(true);

            // Validation
            if (!formData.title.trim()) {
                showSnackbar('Vui lòng nhập tiêu đề thông báo', 'error');
                return;
            }
            if (!formData.message.trim()) {
                showSnackbar('Vui lòng nhập nội dung thông báo', 'error');
                return;
            }

            if (dialogType === 'broadcast') {
                const response = await api.post('/admin/notifications/broadcast', {
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    priority: formData.priority,
                    targetRole: formData.targetRole,
                    expiresAt: formData.expiresAt,
                    actionUrl: formData.actionUrl
                });

                const targetText = formData.targetRole === 'all' ? 'tất cả người dùng' :
                    formData.targetRole === 'user' ? 'người dùng' : 'quản trị viên';
                showSnackbar(`Đã gửi thông báo chung đến ${targetText} thành công!`, 'success');
            } else {
                if (!formData.userId) {
                    showSnackbar('Vui lòng chọn người nhận', 'error');
                    return;
                }

                const response = await api.post('/admin/notifications/individual', {
                    userId: formData.userId,
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    priority: formData.priority,
                    actionUrl: formData.actionUrl
                });

                const selectedUser = users.find(u => u._id === formData.userId);
                showSnackbar(`Đã gửi thông báo cá nhân đến ${selectedUser?.fullName} thành công!`, 'success');
            }

            setOpenDialog(false);
            resetForm();
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error creating notification:', error);
            showSnackbar('Lỗi khi tạo thông báo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;

        try {
            await api.delete(`/admin/notifications/${id}`);
            showSnackbar('Thông báo đã được xóa thành công!', 'success');
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error deleting notification:', error);
            showSnackbar('Lỗi khi xóa thông báo', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'announcement',
            priority: 'normal',
            targetRole: 'all',
            userId: '',
            expiresAt: null,
            actionUrl: ''
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const openCreateDialog = (type) => {
        setDialogType(type);
        setSelectedNotification(null);
        resetForm();
        setOpenDialog(true);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'normal': return 'primary';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'announcement': return <CampaignIcon />;
            case 'system_maintenance': return <NotificationsIcon />;
            case 'feature_update': return <NotificationsIcon />;
            default: return <NotificationsIcon />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Quản lý Thông báo
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            if (currentTab === 0) {
                                fetchNotifications();
                                fetchStats();
                            }
                        }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                            // Export functionality
                            console.log('Export notifications');
                        }}
                    >
                        Xuất dữ liệu
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Thông báo chung" />
                    <Tab label="Thông báo chạy" />
                </Tabs>

                {currentTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        {/* Statistics Cards */}
                        {stats && (
                            <Grid container spacing={3} mb={4}>
                                <Grid item xs={12} md={3}>
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
                                <Grid item xs={12} md={3}>
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
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="success.main">
                                                {stats.totalRead}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Đã đọc
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="info.main">
                                                {stats.todayNotifications}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Hôm nay
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {/* Action Buttons */}
                        <Box display="flex" gap={2} mb={3}>
                            <Button
                                variant="contained"
                                startIcon={<GroupIcon />}
                                onClick={() => openCreateDialog('broadcast')}
                                sx={{ bgcolor: 'primary.main' }}
                            >
                                Gửi thông báo chung
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PersonIcon />}
                                onClick={() => openCreateDialog('individual')}
                                sx={{ bgcolor: 'secondary.main' }}
                            >
                                Gửi thông báo cá nhân
                            </Button>
                        </Box>

                        {/* Notifications Table */}
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Loại</TableCell>
                                        <TableCell>Tiêu đề</TableCell>
                                        <TableCell>Người nhận</TableCell>
                                        <TableCell>Độ ưu tiên</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Ngày tạo</TableCell>
                                        <TableCell>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {notifications.map((notification) => (
                                        <TableRow key={notification._id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getTypeIcon(notification.type)}
                                                    <Typography variant="body2">
                                                        {notification.type}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2">
                                                    {notification.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.message.substring(0, 50)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {notification.recipient ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 24, height: 24 }}>
                                                            {notification.recipient.fullName?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {notification.recipient.fullName}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Chip label="Tất cả" size="small" color="primary" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={notification.priority}
                                                    size="small"
                                                    color={getPriorityColor(notification.priority)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                                                    size="small"
                                                    color={notification.isRead ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="Xem chi tiết">
                                                        <IconButton size="small">
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteNotification(notification._id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </Box>
                )}

                {currentTab === 1 && (
                    <Box sx={{ p: 3 }}>
                        <AdminMarqueePage />
                    </Box>
                )}
            </Paper>

            {/* Create/Edit Notification Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogType === 'broadcast' ? 'Tạo thông báo chung' : 'Tạo thông báo cá nhân'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nội dung"
                                multiline
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Loại thông báo</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <MenuItem value="announcement">Thông báo</MenuItem>
                                    <MenuItem value="system_maintenance">Bảo trì hệ thống</MenuItem>
                                    <MenuItem value="feature_update">Cập nhật tính năng</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Độ ưu tiên</InputLabel>
                                <Select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <MenuItem value="low">Thấp</MenuItem>
                                    <MenuItem value="normal">Bình thường</MenuItem>
                                    <MenuItem value="high">Cao</MenuItem>
                                    <MenuItem value="urgent">Khẩn cấp</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {dialogType === 'broadcast' ? (
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Gửi đến</InputLabel>
                                    <Select
                                        value={formData.targetRole}
                                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                    >
                                        <MenuItem value="all">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <GroupIcon fontSize="small" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Tất cả người dùng
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Gửi cho tất cả users và admins
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="user">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <PersonIcon fontSize="small" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Chỉ người dùng
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Gửi cho users (không bao gồm admin)
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="admin">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <AdminPanelSettingsIcon fontSize="small" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Chỉ quản trị viên
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Gửi cho admins
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        ) : (
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Chọn người nhận</InputLabel>
                                    <Select
                                        value={formData.userId}
                                        onChange={(e) => {
                                            console.log('Selected user ID:', e.target.value); // Debug log
                                            setFormData({ ...formData, userId: e.target.value });
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            <em>-- Chọn người dùng --</em>
                                        </MenuItem>
                                        {users.length > 0 ? (
                                            users.filter(user => user.role !== 'admin').map((user) => (
                                                <MenuItem key={user._id} value={user._id}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={user.avatarUrl}
                                                            sx={{ width: 24, height: 24 }}
                                                        >
                                                            {user.fullName?.charAt(0) || 'U'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {user.fullName || 'Không có tên'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {user.email || 'Không có email'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>
                                                <em>Không có người dùng nào</em>
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                <Box sx={{ mt: 1 }}>
                                    {users.length === 0 ? (
                                        <Typography variant="caption" color="text.secondary">
                                            Đang tải danh sách người dùng...
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            Có {users.filter(user => user.role !== 'admin').length} người dùng
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Hết hạn (tùy chọn)"
                                type="datetime-local"
                                value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value) : null })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Tooltip title="URL mà người dùng sẽ được chuyển đến khi click vào thông báo. Ví dụ: /posts/detail?postId=123, /profile/user/456">
                                <TextField
                                    fullWidth
                                    label="URL hành động (tùy chọn)"
                                    value={formData.actionUrl}
                                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                                    placeholder="/posts/detail?postId=123"
                                    helperText="Đường link mà user sẽ được chuyển đến khi click thông báo"
                                />
                            </Tooltip>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleCreateNotification}
                        variant="contained"
                        disabled={
                            !formData.title ||
                            !formData.message ||
                            loading ||
                            (dialogType === 'individual' && !formData.userId)
                        }
                        startIcon={<SendIcon />}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminNotificationsPage;
