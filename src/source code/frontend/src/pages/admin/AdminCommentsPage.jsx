import React, { useEffect, useState, useContext } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Tooltip,
    Card, CardContent, Grid, Chip, FormControl, InputLabel, Select, MenuItem, InputAdornment,
    Collapse, Avatar, Divider, Alert, Snackbar, Checkbox, Menu, ListItemIcon, ListItemText,
    Switch, FormControlLabel, Badge, Tab, Tabs, LinearProgress, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReplyIcon from '@mui/icons-material/Reply';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CommentIcon from '@mui/icons-material/Comment';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import { ThemeContext } from '../../context/ThemeContext';

const AdminCommentsPage = () => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    // State management
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // New state for enhanced features
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedComments, setSelectedComments] = useState([]);
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        reported: 0,
        totalLikes: 0,
        totalReplies: 0
    });

    // Get auth token
    const getAuthToken = () => {
        // Try to get token from localStorage directly first
        const token = localStorage.getItem('token');
        if (token) return token;

        // Fallback to user.token for backward compatibility
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    useEffect(() => {
        fetchComments(page);
        fetchStats();
    }, [page, searchTerm, statusFilter]);

    const fetchComments = async (pageNum = 1) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const params = new URLSearchParams({
                page: pageNum,
                limit: limit,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await axios.get(`http://localhost:5000/api/admin/comments?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setComments(res.data.comments || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error('Error fetching comments:', err);
            showSnackbar('Lỗi khi tải bình luận', 'error');
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const token = getAuthToken();
            const res = await axios.get('http://localhost:5000/api/admin/comments/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleApprove = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/comments/${commentId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchComments();
            fetchStats();
            showSnackbar('Bình luận đã được phê duyệt');
        } catch (err) {
            console.error('Error approving comment:', err);
            showSnackbar('Lỗi khi phê duyệt bình luận', 'error');
        }
    };

    const handleBulkApprove = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/admin/comments/bulk-approve',
                { commentIds: selectedComments },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchComments();
            fetchStats();
            setSelectedComments([]);
            showSnackbar(`Đã phê duyệt ${selectedComments.length} bình luận`);
        } catch (err) {
            console.error('Error bulk approving comments:', err);
            showSnackbar('Lỗi khi phê duyệt hàng loạt', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Bạn có chắc muốn xóa ${selectedComments.length} bình luận đã chọn?`)) {
            try {
                const token = getAuthToken();
                await axios.delete('http://localhost:5000/api/admin/comments/bulk-delete', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: { commentIds: selectedComments }
                });
                fetchComments();
                fetchStats();
                setSelectedComments([]);
                showSnackbar(`Đã xóa ${selectedComments.length} bình luận`);
            } catch (err) {
                console.error('Error bulk deleting comments:', err);
                showSnackbar('Lỗi khi xóa hàng loạt', 'error');
            }
        }
    };

    const handleEdit = (comment) => {
        setSelectedComment(comment);
        setEditContent(comment.content);
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/comments/${selectedComment._id}`, { content: editContent }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditDialogOpen(false);
            fetchComments();
            showSnackbar('Bình luận đã được cập nhật');
        } catch (err) {
            console.error('Error editing comment:', err);
            showSnackbar('Lỗi khi cập nhật bình luận', 'error');
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const token = getAuthToken();
            await axios.delete(`http://localhost:5000/api/admin/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDeleteDialogOpen(false);
            fetchComments();
            fetchStats();
            showSnackbar('Bình luận đã được xóa');
        } catch (err) {
            console.error('Error deleting comment:', err);
            showSnackbar('Lỗi khi xóa bình luận', 'error');
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedComment) {
            await handleDelete(selectedComment._id);
        }
    };

    const handleSelectComment = (commentId) => {
        setSelectedComments(prev =>
            prev.includes(commentId)
                ? prev.filter(id => id !== commentId)
                : [...prev, commentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedComments.length === comments.length) {
            setSelectedComments([]);
        } else {
            setSelectedComments(comments.map(comment => comment._id));
        }
    };

    const toggleExpandComment = (commentId) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(1);
        switch (newValue) {
            case 0:
                setStatusFilter('all');
                break;
            case 1:
                setStatusFilter('pending');
                break;
            case 2:
                setStatusFilter('approved');
                break;
            default:
                setStatusFilter('all');
        }
    };

    // Statistics Cards Component
    const StatsCards = () => (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <CommentIcon sx={{ color: '#1976d2', mr: 2 }} />
                            <Box>
                                <Typography variant="h4" sx={{ color: darkMode ? '#fff' : '#000' }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tổng bình luận
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <CheckCircleIcon sx={{ color: '#4caf50', mr: 2 }} />
                            <Box>
                                <Typography variant="h4" sx={{ color: darkMode ? '#fff' : '#000' }}>
                                    {stats.approved}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Đã duyệt
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <WarningIcon sx={{ color: '#ff9800', mr: 2 }} />
                            <Box>
                                <Typography variant="h4" sx={{ color: darkMode ? '#fff' : '#000' }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Chờ duyệt
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <ThumbUpIcon sx={{ color: '#e91e63', mr: 2 }} />
                            <Box>
                                <Typography variant="h4" sx={{ color: darkMode ? '#fff' : '#000' }}>
                                    {stats.totalLikes}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tổng lượt thích
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                    Quản lý bình luận
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            fetchComments(page);
                            fetchStats();
                        }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                            // Export functionality
                            console.log('Export comments');
                        }}
                    >
                        Xuất dữ liệu
                    </Button>
                </Box>
            </Box>

            <StatsCards />

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Tìm kiếm bình luận..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Trạng thái"
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            <MenuItem value="pending">Chờ duyệt</MenuItem>
                            <MenuItem value="approved">Đã duyệt</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedComments.length > 0 && (
                        <Box display="flex" gap={1}>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={handleBulkApprove}
                            >
                                Duyệt ({selectedComments.length})
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleBulkDelete}
                            >
                                Xóa ({selectedComments.length})
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label={`Tất cả (${stats.total})`} />
                    <Tab label={`Chờ duyệt (${stats.pending})`} />
                    <Tab label={`Đã duyệt (${stats.approved})`} />
                </Tabs>
                <Divider />

                {loading && <LinearProgress />}

                {/* Comments Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedComments.length === comments.length && comments.length > 0}
                                        indeterminate={selectedComments.length > 0 && selectedComments.length < comments.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Người dùng</TableCell>
                                <TableCell>Nội dung</TableCell>
                                <TableCell>Bài viết</TableCell>
                                <TableCell>Thống kê</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {comments.map((comment) => (
                                <React.Fragment key={comment._id}>
                                    <TableRow
                                        hover
                                        selected={selectedComments.includes(comment._id)}
                                        sx={{
                                            backgroundColor: selectedComments.includes(comment._id)
                                                ? (darkMode ? '#3a3a3a' : '#f5f5f5')
                                                : 'inherit'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedComments.includes(comment._id)}
                                                onChange={() => handleSelectComment(comment._id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    src={comment.authorId?.avatarUrl || comment.authorId?.avatar}
                                                    sx={{ width: 32, height: 32, mr: 1 }}
                                                >
                                                    {comment.authorId?.fullName?.[0] || comment.authorId?.username?.[0] || '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {comment.authorId?.fullName || comment.authorId?.username || 'Ẩn danh'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 300,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: expandedComments.has(comment._id) ? 'none' : 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => toggleExpandComment(comment._id)}
                                                >
                                                    {comment.content}
                                                </Typography>
                                                {comment.content.length > 100 && (
                                                    <Button
                                                        size="small"
                                                        onClick={() => toggleExpandComment(comment._id)}
                                                        sx={{ p: 0, minWidth: 'auto' }}
                                                    >
                                                        {expandedComments.has(comment._id) ? 'Thu gọn' : 'Xem thêm'}
                                                    </Button>
                                                )}
                                                {comment.level > 0 && (
                                                    <Chip
                                                        label={`Cấp ${comment.level}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {comment.postId?.title || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    icon={<FavoriteIcon />}
                                                    label={comment.likeCount || 0}
                                                    size="small"
                                                    color="secondary"
                                                />
                                                <Chip
                                                    icon={<ReplyIcon />}
                                                    label={comment.replyCount || 0}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={comment.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                color={comment.status === 'approved' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5}>
                                                {comment.status !== 'approved' && (
                                                    <Tooltip title="Phê duyệt">
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleApprove(comment._id)}
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleEdit(comment)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        color="info"
                                                        size="small"
                                                        onClick={() => {
                                                            // View comment details
                                                            console.log('View comment details:', comment);
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedComment(comment);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box display="flex" justifyContent="center" p={2}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            </Paper>

            {/* Snackbar for notifications */}
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

            {/* Dialog chỉnh sửa */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Chỉnh sửa bình luận</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nội dung bình luận"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xóa bình luận</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác.
                        {selectedComment?.replyCount > 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Bình luận này có {selectedComment.replyCount} phản hồi. Tất cả sẽ bị xóa cùng.
                            </Alert>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCommentsPage;
