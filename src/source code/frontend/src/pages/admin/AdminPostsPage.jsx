import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Menu, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, Select, Snackbar, Alert, Grid,
    TablePagination, Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, Add as AddIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, ThumbUp as ThumbUpIcon, Comment as CommentIcon, FileDownload as FileDownloadIcon, Star as StarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PostForm from '../../components/admin/PostForm';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import PostPreviewDialog from '../../components/admin/PostPreviewDialog';
import AdminLikeDialog from './AdminLikeDialog';
import AdminCommentDialog from './AdminCommentDialog';
import AdminRatingDialog from './AdminRatingDialog'; // Import AdminRatingDialog
import AdminEditReasonDialog from './AdminEditReasonDialog';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const API_BASE_URL = 'http://localhost:5000/api/admin/posts';

const AdminPostsPage = () => {
    const { logout, getToken, user } = useAuth();
    const { socket } = useChat();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [authorSearch, setAuthorSearch] = useState(''); // New state for author search
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

    // Dialog states for likes and comments
    const [likeDialogOpen, setLikeDialogOpen] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedPostForDialog, setSelectedPostForDialog] = useState(null);

    // Dialog states for ratings
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [selectedPostForRatingDialog, setSelectedPostForRatingDialog] = useState(null);

    // Edit reason dialog state
    const [editReasonDialogOpen, setEditReasonDialogOpen] = useState(false);
    const [postToEdit, setPostToEdit] = useState(null);

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
                    authorName: authorSearch, // Include authorSearch in params
                    status: statusFilter,
                    sortBy,
                    sortOrder,
                },
            });
            setPosts(response.data.posts || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalPosts(response.data.totalPosts || 0);
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
    }, [page, limit, search, authorSearch, statusFilter, sortBy, sortOrder, logout, getToken, navigate]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = () => {
        setEditingPost(null);
        setOpenForm(true);
    };

    const handleEditPost = (post) => {
        // Kiểm tra xem admin có đang chỉnh sửa bài viết của user khác không
        const isEditingOtherUserPost = post.authorId?._id !== user?._id;

        if (isEditingOtherUserPost) {
            // Hiển thị dialog yêu cầu lý do
            setPostToEdit(post);
            setEditReasonDialogOpen(true);
        } else {
            // Admin chỉnh sửa bài viết của chính mình
            setEditingPost(post);
            setOpenForm(true);
        }
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

    const handleShowLikes = (post) => {
        setSelectedPostForDialog(post);
        setLikeDialogOpen(true);
    };

    const handleShowComments = (post) => {
        setSelectedPostForDialog(post);
        setCommentDialogOpen(true);
    };

    const handleShowRatings = (post) => {
        setSelectedPostForRatingDialog(post);
        setRatingDialogOpen(true);
    };

    const handleConfirmEditReason = async (reason) => {
        if (!postToEdit) return;

        try {
            // Gửi thông báo đến user về việc admin chỉnh sửa bài viết
            const token = getToken();
            await axios.post(`http://localhost:5000/api/notifications/user`, {
                userId: postToEdit.authorId._id,
                type: 'admin_edit_post',
                title: 'Admin đã chỉnh sửa bài viết của bạn',
                message: `Lý do: ${reason}`,
                relatedData: {
                    postId: postToEdit._id,
                    postTitle: postToEdit.title,
                    reason: reason
                },
                actionUrl: `/posts/detail?postId=${postToEdit._id}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Mở form chỉnh sửa
            setEditingPost(postToEdit);
            setOpenForm(true);

            showSnackbar('Đã gửi thông báo đến tác giả bài viết', 'success');
        } catch (error) {
            console.error('Error sending notification:', error);
            showSnackbar('Lỗi khi gửi thông báo', 'error');
        }
    };

    const handleExportPosts = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${API_BASE_URL}/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Tạo file download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `posts_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showSnackbar('Xuất dữ liệu thành công', 'success');
        } catch (error) {
            console.error('Error exporting posts:', error);
            showSnackbar('Lỗi khi xuất dữ liệu', 'error');
        }
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
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportPosts}
                        sx={{ mr: 2 }}
                    >
                        Xuất dữ liệu
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
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm theo tiêu đề/nội dung/tags"
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
                        <TextField
                            fullWidth
                            label="Tìm kiếm theo tên tác giả"
                            value={authorSearch}
                            onChange={(e) => setAuthorSearch(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleApplyFilters();
                                }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
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
                    <Grid item xs={12} sm={6} md={2}>
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
                                <TableCell>Lượt thích</TableCell>
                                <TableCell>Bình luận</TableCell>
                                <TableCell>Đánh giá</TableCell> {/* New column for ratings */}
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
                                        <Chip
                                            icon={<ThumbUpIcon />}
                                            label={post.likesCount || 0}
                                            onClick={() => handleShowLikes(post)}
                                            clickable
                                            color="primary"
                                            variant="outlined"
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<CommentIcon />}
                                            label={post.commentsCount || 0}
                                            onClick={() => handleShowComments(post)}
                                            clickable
                                            color="secondary"
                                            variant="outlined"
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<StarIcon />}
                                            label={`${post.averageRating || 0} (${post.totalRatings || 0})`}
                                            onClick={() => handleShowRatings(post)}
                                            clickable
                                            color="warning"
                                            variant="outlined"
                                            sx={{ cursor: 'pointer' }}
                                        />
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

            {!loading && !error && <TablePagination
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
            />}

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

            {selectedPostForDialog && (
                <AdminLikeDialog
                    open={likeDialogOpen}
                    onClose={() => setLikeDialogOpen(false)}
                    postId={selectedPostForDialog._id}
                />
            )}

            {selectedPostForRatingDialog && (
                <AdminRatingDialog
                    open={ratingDialogOpen}
                    onClose={() => setRatingDialogOpen(false)}
                    postId={selectedPostForRatingDialog._id}
                />
            )}

            {selectedPostForDialog && (
                <AdminCommentDialog
                    open={commentDialogOpen}
                    onClose={() => setCommentDialogOpen(false)}
                    postId={selectedPostForDialog._id}
                />
            )}

            {postToEdit && (
                <AdminEditReasonDialog
                    open={editReasonDialogOpen}
                    onClose={() => setEditReasonDialogOpen(false)}
                    onConfirm={handleConfirmEditReason}
                    postTitle={postToEdit.title}
                    authorName={postToEdit.authorId?.fullName || 'Người dùng ẩn danh'}
                />
            )}

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
