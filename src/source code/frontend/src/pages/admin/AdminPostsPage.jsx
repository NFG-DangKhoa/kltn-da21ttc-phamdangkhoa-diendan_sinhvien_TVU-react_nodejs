import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Menu, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, Select, Snackbar, Alert, Grid,
    TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, Add as AddIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PostForm from '../../components/admin/PostForm';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import PostPreviewDialog from '../../components/admin/PostPreviewDialog';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const API_BASE_URL = 'http://localhost:5000/api/admin/posts';

const AdminPostsPage = () => {
    const { logout, getToken } = useAuth();
    const { socket } = useChat();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('-1');
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);

    const [openForm, setOpenForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentPostStatusMenu, setCurrentPostStatusMenu] = useState(null);

    const [previewPostId, setPreviewPostId] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);

    // Setup Socket.IO listeners for admin post events
    useEffect(() => {
        if (!socket) return;

        const handleNewPost = (newPost) => {
            console.log('New post added by admin (real-time):', newPost);
            fetchPosts();
            showSnackbar('Bài viết mới được tạo!', 'info');
        };

        const handleUpdatedPost = (updatedPost) => {
            console.log('Post updated by admin (real-time):', updatedPost);
            fetchPosts();
            showSnackbar('Bài viết đã được cập nhật!', 'info');
        };

        const handleDeletedPost = (data) => {
            console.log('Post deleted by admin (real-time):', data.postId);
            fetchPosts();
            showSnackbar('Bài viết đã bị xóa!', 'warning');
        };

        const handleStatusUpdated = (updatedPost) => {
            console.log('Post status updated by admin (real-time):', updatedPost);
            fetchPosts();
            showSnackbar(`Trạng thái bài viết "${updatedPost.title}" đã thay đổi thành ${updatedPost.status}!`, 'info');
        };

        socket.on('newPostByAdmin', handleNewPost);
        socket.on('updatedPostByAdmin', handleUpdatedPost);
        socket.on('deletedPostByAdmin', handleDeletedPost);
        socket.on('postStatusUpdatedByAdmin', handleStatusUpdated);

        return () => {
            socket.off('newPostByAdmin', handleNewPost);
            socket.off('updatedPostByAdmin', handleUpdatedPost);
            socket.off('deletedPostByAdmin', handleDeletedPost);
            socket.off('postStatusUpdatedByAdmin', handleStatusUpdated);
        };
    }, [socket]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = getToken();

        // Không đăng xuất hay điều hướng nếu không có token ngay từ đầu
        // Giả định AuthContext đã xử lý việc chuyển hướng nếu người dùng chưa đăng nhập
        if (!token) {
            setLoading(false);
            // Có thể hiển thị thông báo nếu cần, nhưng không tự ý logout ở đây
            // vì logic bảo vệ route nên được xử lý ở cấp cao hơn (ví dụ: trong AuthContext hoặc route guard)
            console.log('No token found, assuming AuthContext handles redirection.');
            return;
        }

        try {
            const response = await axios.get(API_BASE_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page + 1,
                    limit,
                    search,
                    status: statusFilter,
                    sortBy,
                    sortOrder,
                },
            });
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
            setTotalPosts(response.data.totalPosts);
        } catch (err) {
            console.error('Error fetching posts:', err.response?.data || err.message);
            // Chỉ đăng xuất và điều hướng khi server trả về 401, tức là token đã hết hạn/không hợp lệ
            if (err.response && err.response.status === 401) {
                setError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
                showSnackbar('Lỗi xác thực, vui lòng đăng nhập lại!', 'error');
                logout(); // Đăng xuất người dùng
                navigate('/login'); // Điều hướng về trang đăng nhập
            } else {
                setError('Không thể tải bài viết. Vui lòng thử lại.');
                showSnackbar('Lỗi khi tải bài viết!', 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, statusFilter, sortBy, sortOrder, logout, getToken, navigate]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = () => {
        setEditingPost(null);
        setOpenForm(true);
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setOpenForm(true);
    };

    const handleDeletePost = (postId) => {
        setPostIdToDelete(postId);
        setOpenConfirm(true);
    };

    const confirmDeletePost = async () => {
        setOpenConfirm(false);
        if (!postIdToDelete) return;
        try {
            const token = getToken();
            await axios.delete(`${API_BASE_URL}/${postIdToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('Bài viết đã được xóa thành công!');
            fetchPosts();
        } catch (err) {
            console.error('Error deleting post:', err.response?.data || err.message);
            if (err.response && err.response.status === 401) {
                showSnackbar('Bạn không có quyền hoặc phiên đăng nhập hết hạn!', 'error');
                logout();
                navigate('/login');
            } else {
                showSnackbar('Lỗi khi xóa bài viết!', 'error');
            }
        } finally {
            setPostIdToDelete(null);
        }
    };

    const handleFormSubmit = async (postData) => {
        try {
            const token = getToken();
            if (editingPost) {
                await axios.put(`${API_BASE_URL}/${editingPost._id}`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Bài viết đã được cập nhật thành công!');
            } else {
                await axios.post(API_BASE_URL, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Bài viết đã được tạo thành công!');
            }
            setOpenForm(false);
            fetchPosts();
        } catch (err) {
            console.error('Error saving post:', err.response?.data || err.message);
            if (err.response && err.response.status === 401) {
                showSnackbar('Bạn không có quyền hoặc phiên đăng nhập hết hạn!', 'error');
                logout();
                navigate('/login');
            } else {
                showSnackbar(`Lỗi khi lưu bài viết: ${err.response?.data?.message || err.message}`, 'error');
            }
        }
    };

    const handleStatusMenuClick = (event, post) => {
        setAnchorEl(event.currentTarget);
        setCurrentPostStatusMenu(post);
    };

    const handleStatusMenuClose = () => {
        setAnchorEl(null);
        setCurrentPostStatusMenu(null);
    };

    const handleChangeStatus = async (newStatus) => {
        if (!currentPostStatusMenu) return;
        try {
            const token = getToken();
            await axios.put(`${API_BASE_URL}/${currentPostStatusMenu._id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar(`Trạng thái bài viết "${currentPostStatusMenu.title}" đã cập nhật thành "${newStatus}"`);
            fetchPosts();
        } catch (err) {
            console.error('Error updating post status:', err.response?.data || err.message);
            if (err.response && err.response.status === 401) {
                showSnackbar('Bạn không có quyền hoặc phiên đăng nhập hết hạn!', 'error');
                logout();
                navigate('/login');
            } else {
                showSnackbar('Lỗi khi cập nhật trạng thái bài viết!', 'error');
            }
        } finally {
            handleStatusMenuClose();
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleApplyFilters = () => {
        setPage(0);
        fetchPosts();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        showSnackbar('Bạn đã đăng xuất thành công!', 'info');
    };

    const handlePreviewPost = (postId) => {
        setPreviewPostId(postId);
        setOpenPreview(true);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Quản lý bài viết (Admin)
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreatePost}
                        sx={{ mr: 2 }}
                    >
                        Tạo bài viết mới
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </Button>
                </Box>
            </Box>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleApplyFilters();
                                }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                }}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="published">Đã xuất bản</MenuItem>
                                <MenuItem value="pending">Đang chờ duyệt</MenuItem>
                                <MenuItem value="draft">Bản nháp</MenuItem>
                                <MenuItem value="archived">Lưu trữ</MenuItem>
                                <MenuItem value="flagged">Bị gắn cờ</MenuItem>
                                <MenuItem value="deleted">Đã xóa</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sắp xếp theo</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sắp xếp theo"
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                }}
                            >
                                <MenuItem value="createdAt">Ngày tạo</MenuItem>
                                <MenuItem value="updatedAt">Ngày cập nhật</MenuItem>
                                <MenuItem value="title">Tiêu đề</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Thứ tự</InputLabel>
                            <Select
                                value={sortOrder}
                                label="Thứ tự"
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                }}
                            >
                                <MenuItem value="-1">Mới nhất</MenuItem>
                                <MenuItem value="1">Cũ nhất</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<RefreshIcon />}
                            onClick={handleApplyFilters}
                        >
                            Lọc/Làm mới
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : posts.length === 0 ? (
                <Alert severity="info">Không tìm thấy bài viết nào.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="admin posts table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Tiêu đề</TableCell>
                                <TableCell>Tác giả</TableCell>
                                <TableCell>Chủ đề</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Ngày cập nhật</TableCell>
                                <TableCell align="right">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post._id}>
                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {post.title}
                                    </TableCell>
                                    <TableCell>{post.authorId?.fullName || 'N/A'}</TableCell>
                                    <TableCell>{post.topicId?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={(e) => handleStatusMenuClick(e, post)}
                                        >
                                            {post.status} <MoreVertIcon fontSize="small" />
                                        </Button>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && currentPostStatusMenu?._id === post._id}
                                            onClose={handleStatusMenuClose}
                                        >
                                            {['draft', 'pending', 'published', 'archived', 'flagged', 'deleted'].map((status) => (
                                                <MenuItem
                                                    key={status}
                                                    onClick={() => handleChangeStatus(status)}
                                                    selected={post.status === status}
                                                >
                                                    {status}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </TableCell>
                                    <TableCell>
                                        {post.createdAt
                                            ? format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {post.updatedAt
                                            ? format(new Date(post.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="info" onClick={() => handlePreviewPost(post._id)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton color="primary" onClick={() => handleEditPost(post)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDeletePost(post._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalPosts}
                rowsPerPage={limit}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số bài viết mỗi trang:"
                labelDisplayedRows={({ from, to, count }) =>
                    `Hiển thị ${from}-${to} trong tổng số ${count} bài viết`
                }
                sx={{ mt: 2 }}
            />

            <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
                <DialogTitle>{editingPost ? 'Cập nhật bài viết' : 'Tạo bài viết mới'}</DialogTitle>
                <DialogContent dividers>
                    <PostForm
                        post={editingPost}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setOpenForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={confirmDeletePost}
                title="Xác nhận xóa bài viết"
                message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác và sẽ xóa tất cả bình luận, lượt thích, đánh giá liên quan."
            />

            <PostPreviewDialog
                postId={previewPostId}
                open={openPreview}
                onClose={() => setOpenPreview(false)}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminPostsPage;
