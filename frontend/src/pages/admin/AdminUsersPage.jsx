import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Alert,
    Snackbar,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    CheckCircle as ActivateIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminUsersPage = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionData, setActionData] = useState({ reason: '', suspendedUntil: '', role: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({});

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get auth token
    const getAuthToken = () => {
        // Try to get token from localStorage directly first
        const token = localStorage.getItem('token');
        if (token) return token;

        // Fallback to user.token for backward compatibility
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm,
                    role: roleFilter,
                    status: statusFilter
                }
            });

            if (response.data.success) {
                setUsers(response.data.data.users);
                setTotalUsers(response.data.data.pagination.totalUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Lỗi khi tải danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user stats
    const fetchStats = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/users/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Handle user action
    const handleUserAction = async () => {
        if (!selectedUser || !actionType) return;

        try {
            const token = getAuthToken();
            let endpoint = '';
            let data = {};

            switch (actionType) {
                case 'warn':
                    endpoint = `${API_BASE_URL}/admin/users/${selectedUser._id}/warn`;
                    data = { message: actionData.reason, reason: actionData.reason };
                    break;
                case 'suspend':
                    endpoint = `${API_BASE_URL}/admin/users/${selectedUser._id}/suspend`;
                    data = { reason: actionData.reason, suspendedUntil: actionData.suspendedUntil };
                    break;
                case 'ban':
                    endpoint = `${API_BASE_URL}/admin/users/${selectedUser._id}/ban`;
                    data = { reason: actionData.reason, isPermanent: true };
                    break;
                case 'activate':
                    endpoint = `${API_BASE_URL}/admin/users/${selectedUser._id}/activate`;
                    break;
                case 'updateRole':
                    endpoint = `${API_BASE_URL}/admin/users/${selectedUser._id}/role`;
                    data = { role: actionData.role };
                    break;
            }

            const method = actionType === 'warn' ? 'post' : 'put';
            await axios[method](endpoint, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar(`Đã ${getActionText(actionType)} người dùng thành công`);
            setActionDialogOpen(false);
            setActionData({ reason: '', suspendedUntil: '', role: '' });
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error performing action:', error);
            showSnackbar(`Lỗi khi ${getActionText(actionType)} người dùng`, 'error');
        }
    };

    // Get action text
    const getActionText = (action) => {
        const actions = {
            warn: 'cảnh báo',
            suspend: 'tạm khóa',
            ban: 'cấm',
            activate: 'kích hoạt',
            updateRole: 'cập nhật vai trò'
        };
        return actions[action] || action;
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            suspended: 'warning',
            banned: 'error'
        };
        return colors[status] || 'default';
    };

    // Get role color
    const getRoleColor = (role) => {
        const colors = {
            admin: 'error',
            editor: 'warning',
            user: 'primary'
        };
        return colors[role] || 'default';
    };

    // Effects
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom>
                Quản lý Người dùng
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Tổng người dùng
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalUsers || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Đang hoạt động
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {stats.activeUsers || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Tạm khóa
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {stats.suspendedUsers || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Bị cấm
                            </Typography>
                            <Typography variant="h4" color="error.main">
                                {stats.bannedUsers || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm"
                            placeholder="Tìm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Vai trò</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Vai trò"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="active">Hoạt động</MenuItem>
                                <MenuItem value="suspended">Tạm khóa</MenuItem>
                                <MenuItem value="banned">Bị cấm</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('');
                                setStatusFilter('');
                                fetchUsers();
                            }}
                        >
                            Làm mới
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Avatar</TableCell>
                                <TableCell>Tên</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Vai trò</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Cảnh báo</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Không có người dùng nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Avatar
                                                src={user.avatarUrl}
                                                alt={user.fullName}
                                                sx={{ width: 40, height: 40 }}
                                            >
                                                {user.fullName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>{user.fullName || 'N/A'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={getRoleColor(user.role)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status === 'active' ? 'Hoạt động' :
                                                    user.status === 'suspended' ? 'Tạm khóa' : 'Bị cấm'}
                                                color={getStatusColor(user.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.warnings?.length || 0}
                                                color={user.warnings?.length > 0 ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Xem chi tiết">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {user.role !== 'admin' && (
                                                <>
                                                    <Tooltip title="Cảnh báo">
                                                        <IconButton
                                                            size="small"
                                                            color="warning"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setActionType('warn');
                                                                setActionDialogOpen(true);
                                                            }}
                                                        >
                                                            <WarningIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {user.status === 'active' ? (
                                                        <>
                                                            <Tooltip title="Tạm khóa">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setActionType('suspend');
                                                                        setActionDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <BlockIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <Tooltip title="Kích hoạt">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setActionType('activate');
                                                                    setActionDialogOpen(true);
                                                                }}
                                                            >
                                                                <ActivateIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                    <Tooltip title="Thay đổi vai trò">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setActionType('updateRole');
                                                                setActionData({ ...actionData, role: user.role });
                                                                setActionDialogOpen(true);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalUsers}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                    }
                />
            </Paper>

            {/* User Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Chi tiết người dùng
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Thông tin cơ bản
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography><strong>Tên:</strong> {selectedUser.fullName || 'N/A'}</Typography>
                                    <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                                    <Typography><strong>Số điện thoại:</strong> {selectedUser.phone || 'N/A'}</Typography>
                                    <Typography><strong>Địa chỉ:</strong> {selectedUser.address || 'N/A'}</Typography>
                                    <Typography><strong>Vai trò:</strong> {selectedUser.role}</Typography>
                                    <Typography><strong>Trạng thái:</strong> {selectedUser.status}</Typography>
                                    <Typography><strong>Ngày tạo:</strong> {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Cảnh báo ({selectedUser.warnings?.length || 0})
                                </Typography>
                                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    {selectedUser.warnings?.length > 0 ? (
                                        selectedUser.warnings.map((warning, index) => (
                                            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                                <Typography variant="body2">
                                                    <strong>Lý do:</strong> {warning.reason}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Nội dung:</strong> {warning.message}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {new Date(warning.createdAt).toLocaleString('vi-VN')}
                                                </Typography>
                                            </Alert>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">
                                            Không có cảnh báo nào
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            {selectedUser.suspensionInfo && (
                                <Grid item xs={12}>
                                    <Alert severity="warning">
                                        <Typography variant="subtitle2">Thông tin tạm khóa</Typography>
                                        <Typography><strong>Lý do:</strong> {selectedUser.suspensionInfo.reason}</Typography>
                                        <Typography><strong>Ngày khóa:</strong> {new Date(selectedUser.suspensionInfo.suspendedAt).toLocaleString('vi-VN')}</Typography>
                                        {selectedUser.suspensionInfo.suspendedUntil && (
                                            <Typography><strong>Khóa đến:</strong> {new Date(selectedUser.suspensionInfo.suspendedUntil).toLocaleString('vi-VN')}</Typography>
                                        )}
                                    </Alert>
                                </Grid>
                            )}

                            {selectedUser.banInfo && (
                                <Grid item xs={12}>
                                    <Alert severity="error">
                                        <Typography variant="subtitle2">Thông tin cấm</Typography>
                                        <Typography><strong>Lý do:</strong> {selectedUser.banInfo.reason}</Typography>
                                        <Typography><strong>Ngày cấm:</strong> {new Date(selectedUser.banInfo.bannedAt).toLocaleString('vi-VN')}</Typography>
                                        <Typography><strong>Vĩnh viễn:</strong> {selectedUser.banInfo.isPermanent ? 'Có' : 'Không'}</Typography>
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={() => setActionDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {actionType === 'warn' && 'Cảnh báo người dùng'}
                    {actionType === 'suspend' && 'Tạm khóa tài khoản'}
                    {actionType === 'ban' && 'Cấm tài khoản'}
                    {actionType === 'activate' && 'Kích hoạt tài khoản'}
                    {actionType === 'updateRole' && 'Thay đổi vai trò'}
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box>
                            <Typography gutterBottom>
                                <strong>Người dùng:</strong> {selectedUser.fullName} ({selectedUser.email})
                            </Typography>

                            {actionType === 'activate' ? (
                                <Typography>
                                    Bạn có chắc chắn muốn kích hoạt lại tài khoản này?
                                </Typography>
                            ) : actionType === 'updateRole' ? (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Vai trò mới</InputLabel>
                                    <Select
                                        value={actionData.role}
                                        label="Vai trò mới"
                                        onChange={(e) => setActionData({ ...actionData, role: e.target.value })}
                                    >
                                        <MenuItem value="user">User</MenuItem>
                                        <MenuItem value="editor">Editor</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Lý do"
                                        multiline
                                        rows={3}
                                        value={actionData.reason}
                                        onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                                        sx={{ mt: 2 }}
                                        required
                                    />

                                    {actionType === 'suspend' && (
                                        <TextField
                                            fullWidth
                                            label="Khóa đến (tùy chọn)"
                                            type="datetime-local"
                                            value={actionData.suspendedUntil}
                                            onChange={(e) => setActionData({ ...actionData, suspendedUntil: e.target.value })}
                                            sx={{ mt: 2 }}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialogOpen(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleUserAction}
                        variant="contained"
                        color={actionType === 'ban' || actionType === 'suspend' ? 'error' : 'primary'}
                        disabled={
                            (actionType !== 'activate' && actionType !== 'updateRole' && !actionData.reason) ||
                            (actionType === 'updateRole' && !actionData.role)
                        }
                    >
                        Xác nhận
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
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminUsersPage;