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
    Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminRatingsPage = () => {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRatings, setTotalRatings] = useState(0);
    const [selectedRating, setSelectedRating] = useState(null);
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

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/ratings`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    limit: rowsPerPage
                }
            });

            if (response.data.success) {
                setRatings(response.data.data.ratings);
                setTotalRatings(response.data.data.pagination.totalRatings);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
            showSnackbar('Lỗi khi tải danh sách đánh giá', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDeleteRating = async () => {
        if (!selectedRating) return;

        try {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/admin/ratings/${selectedRating._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('Đã xóa đánh giá thành công');
            setDialogOpen(false);
            fetchRatings();
        } catch (error) {
            console.error('Error deleting rating:', error);
            showSnackbar('Lỗi khi xóa đánh giá', 'error');
        }
    };

    useEffect(() => {
        fetchRatings();
    }, [page, rowsPerPage]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Quản lý Đánh giá
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchRatings}
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
                                <TableCell>Người đánh giá</TableCell>
                                <TableCell>Điểm</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : ratings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Không có đánh giá nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ratings.map((rating) => (
                                    <TableRow key={rating._id}>
                                        <TableCell>{rating.post?.title || 'Bài viết không tồn tại'}</TableCell>
                                        <TableCell>{rating.user?.fullName || 'Người dùng không tồn tại'}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {rating.rating} <StarIcon sx={{ color: 'gold', ml: 0.5 }} />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(rating.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Xóa">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedRating(rating);
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
                    count={totalRatings}
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
                <DialogTitle>Xóa Đánh giá</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa đánh giá này?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleDeleteRating}
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

export default AdminRatingsPage;
