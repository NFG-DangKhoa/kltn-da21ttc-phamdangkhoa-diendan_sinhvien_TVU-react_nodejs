import React, { useState, useEffect } from 'react';
import {
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
    Button,
    Snackbar,
    Alert,
    Chip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Comment as CommentIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminCommentDialog from './AdminCommentDialog';

const AdminCommentsManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPosts, setTotalPosts] = useState(0);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const API_BASE_URL = 'http://localhost:5000/api';

    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            return token;
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.token && user.token !== 'undefined') {
            return user.token;
        }
        return null;
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchPostsWithComments = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/posts`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });

            if (response.data.success) {
                setPosts(response.data.data.posts);
                setTotalPosts(response.data.data.pagination.totalPosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            showSnackbar('Lỗi khi tải danh sách bài viết', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleShowComments = (post) => {
        setSelectedPost(post);
        setCommentDialogOpen(true);
    };

    useEffect(() => {
        fetchPostsWithComments();
    }, [page, rowsPerPage]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Quản lý Bình luận
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchPostsWithComments}
                    >
                        Làm mới
                    </Button>
                </Box>

                <TableContainer sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên bài viết</TableCell>
                                <TableCell>Bình luận</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        Không có bài viết nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post._id}>
                                        <TableCell>{post.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<CommentIcon />}
                                                label={post.commentsCount || 0}
                                                onClick={() => handleShowComments(post)}
                                                clickable
                                                color="primary"
                                                variant="outlined"
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalPosts}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
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

            {selectedPost && (
                <AdminCommentDialog
                    open={commentDialogOpen}
                    onClose={() => setCommentDialogOpen(false)}
                    postId={selectedPost._id}
                />
            )}

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
        </Box>
    );
};

export default AdminCommentsManagementPage;
