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
    ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLikeDialog from './AdminLikeDialog';

const AdminLikesPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPosts, setTotalPosts] = useState(0);
    const [selectedPost, setSelectedPost] = useState(null);
    const [likeDialogOpen, setLikeDialogOpen] = useState(false);
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

    const fetchPostsWithLikes = async () => {
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

            setPosts(response.data.posts);
            setTotalPosts(response.data.totalPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            showSnackbar('Lỗi khi tải danh sách bài viết', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleShowLikes = (post) => {
        setSelectedPost(post);
        setLikeDialogOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        fetchPostsWithLikes();
    }, [page, rowsPerPage]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Quản lý Lượt thích
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchPostsWithLikes}
                    >
                        Làm mới
                    </Button>
                </Box>
            </Paper>

            <Paper>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên bài viết</TableCell>
                                <TableCell>Lượt thích</TableCell>
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
                                                icon={<ThumbUpIcon />}
                                                label={post.likesCount || 0}
                                                onClick={() => handleShowLikes(post)}
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
                <AdminLikeDialog
                    open={likeDialogOpen}
                    onClose={() => setLikeDialogOpen(false)}
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

export default AdminLikesPage;
