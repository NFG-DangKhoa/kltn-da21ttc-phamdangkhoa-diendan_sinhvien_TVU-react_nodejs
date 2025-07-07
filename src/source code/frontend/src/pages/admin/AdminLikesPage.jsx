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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminLikesPage = () => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalLikes, setTotalLikes] = useState(0);
    const [selectedLike, setSelectedLike] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
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

    const fetchLikes = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/likes`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });

            if (response.data.success) {
                setLikes(response.data.data.likes);
                setTotalLikes(response.data.data.pagination.totalLikes);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
            showSnackbar('Lỗi khi tải danh sách lượt thích', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDeleteLike = async () => {
        if (!selectedLike) return;

        try {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/admin/likes/${selectedLike._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('Đã xóa lượt thích thành công');
            setDialogOpen(false);
            fetchLikes();
        } catch (error) {
            console.error('Error deleting like:', error);
            showSnackbar('Lỗi khi xóa lượt thích', 'error');
        }
    };

    useEffect(() => {
        fetchLikes();
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
                        onClick={fetchLikes}
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
                                <TableCell>Bài viết</TableCell>
                                <TableCell>Người thích</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : likes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Không có lượt thích nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                likes.map((like) => (
                                    <TableRow key={like._id}>
                                        <TableCell>{like.post?.title || 'Bài viết không tồn tại'}</TableCell>
                                        <TableCell>{like.user?.fullName || 'Người dùng không tồn tại'}</TableCell>
                                        <TableCell>
                                            {new Date(like.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Xóa">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedLike(like);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalLikes}
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

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Xóa Lượt thích</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa lượt thích này?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleDeleteLike}
                        variant="contained"
                        color="error"
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

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
