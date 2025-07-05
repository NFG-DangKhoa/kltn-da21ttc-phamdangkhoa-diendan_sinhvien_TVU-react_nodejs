import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Rating, Typography, Box, Alert, CircularProgress,
    List, ListItem, ListItemText, Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { ThemeContext } from '../../../context/ThemeContext'; // Đảm bảo đường dẫn đúng

const RatingDialog = ({ open, onClose, postId, userId, currentRating, onRatePost, totalRatings, allRatings, averageRating }) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [value, setValue] = useState(currentRating || 0);
    const [hover, setHover] = useState(-1);
    const [message, setMessage] = useState('');
    const [messageSeverity, setMessageSeverity] = useState('info');
    const [loading, setLoading] = useState(false);

    const labels = {
        0.5: 'Useless',
        1: 'Tệ',
        1.5: 'Poor',
        2: 'Không tốt',
        2.5: 'Ok',
        3: 'Trung bình',
        3.5: 'Good',
        4: 'Khá tốt',
        4.5: 'Excellent',
        5: 'Tuyệt vời',
    };

    function getLabelText(value) {
        return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
    }

    // Reset giá trị rating và thông báo khi dialog mở/đóng hoặc currentRating thay đổi
    useEffect(() => {
        setValue(currentRating || 0);
        setMessage(''); // Xóa thông báo khi dialog mở lại
        setMessageSeverity('info');
    }, [open, currentRating]);

    const handleSubmit = useCallback(async () => {
        if (!userId || !postId || value === 0) {
            setMessage('Bạn phải đăng nhập và chọn một điểm đánh giá.');
            setMessageSeverity('warning');
            return;
        }

        setLoading(true);
        setMessage(''); // Clear previous messages
        try {
            await onRatePost(postId, userId, value);
            setMessage('Đánh giá của bạn đã được gửi thành công!');
            setMessageSeverity('success');
            // Đóng dialog sau một khoảng thời gian ngắn để người dùng thấy thông báo
            setTimeout(() => {
                onClose();
            }, 1500); // 1.5 giây
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Xử lý lỗi trùng lặp nếu có từ backend (ví dụ: người dùng đã đánh giá bài đăng này rồi)
            if (error.message && error.message.includes('already rated')) {
                setMessage('Bạn đã đánh giá bài viết này rồi. Đánh giá của bạn đã được cập nhật.');
                setMessageSeverity('info'); // Đổi thành info vì đây không phải lỗi nghiêm trọng
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage(`Gửi đánh giá thất bại: ${error.message || 'Lỗi không xác định.'}`);
                setMessageSeverity('error');
            }
        } finally {
            setLoading(false);
        }
    }, [postId, userId, value, onRatePost, onClose]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="rating-dialog-title"
            PaperProps={{
                sx: {
                    backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                    borderRadius: '12px',
                    boxShadow: darkMode ? '0px 4px 20px rgba(0,0,0,0.5)' : '0px 4px 20px rgba(0,0,0,0.1)',
                    width: '100%', // Đảm bảo rộng hơn để chứa danh sách
                    maxWidth: 450, // Giới hạn chiều rộng tối đa
                }
            }}
        >
            <DialogTitle id="rating-dialog-title" sx={{ textAlign: 'center', pb: 1 }}>
                Đánh giá bài viết này
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0 }}>
                {message && (
                    <Alert severity={messageSeverity} sx={{ width: '100%', mb: 2 }}>
                        {message}
                    </Alert>
                )}
                <Box
                    sx={{
                        width: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        my: 2,
                    }}
                >
                    <Rating
                        name="hover-feedback"
                        value={value}
                        precision={1} // Cho phép chỉ số nguyên (1, 2, 3, 4, 5 sao)
                        getLabelText={getLabelText}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                        onChangeActive={(event, newHover) => {
                            setHover(newHover);
                        }}
                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" sx={{ color: darkMode ? '#888' : '#ccc' }} />}
                        icon={<StarIcon fontSize="inherit" sx={{ color: '#ffb400' }} />}
                        size="large"
                        disabled={loading} // Vô hiệu hóa rating khi đang gửi
                    />
                    {value !== null && (
                        <Box sx={{ ml: 2, color: darkMode ? '#bbb' : '#555' }}>{labels[hover !== -1 ? hover : value]}</Box>
                    )}
                </Box>
                <Typography variant="body2" sx={{ color: darkMode ? '#bbb' : '#666', mt: 1 }}>
                    Bạn đang đánh giá bài viết: {postId}
                </Typography>
                <Typography variant="body2" sx={{ color: darkMode ? '#bbb' : '#666' }}>
                    Với vai trò người dùng: {userId}
                </Typography>

                <Divider sx={{ my: 2, width: '100%', borderColor: darkMode ? '#555' : '#eee' }} />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', mb: 1 }}>
                        Điểm trung bình: {averageRating ? averageRating.toFixed(1) : '0.0'}/5.0
                    </Typography>
                    <Typography variant="body1" sx={{ color: darkMode ? '#b0b3b8' : '#666' }}>
                        Tổng số lượt đánh giá: {totalRatings || 0}
                    </Typography>
                </Box>

                {allRatings && allRatings.length > 0 ? (
                    <List sx={{ width: '100%', maxHeight: 200, overflowY: 'auto', bgcolor: darkMode ? '#444' : '#f9f9f9', borderRadius: '8px', p: 1 }}>
                        {allRatings.map((item, index) => (
                            <React.Fragment key={item._id}>
                                <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{ fontWeight: 'bold', color: darkMode ? '#90caf9' : 'primary.main' }}
                                                >
                                                    {item.userId?.fullName || 'Người dùng ẩn danh'}
                                                </Typography>
                                                <Rating
                                                    name={`user-rating-${item._id}`}
                                                    value={item.rating}
                                                    precision={1}
                                                    readOnly
                                                    size="small"
                                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" sx={{ color: darkMode ? '#888' : '#ccc' }} />}
                                                    icon={<StarIcon fontSize="inherit" sx={{ color: '#ffb400' }} />}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography
                                                sx={{ display: 'inline', color: darkMode ? '#bbb' : '#777' }}
                                                component="span"
                                                variant="body2"
                                            >
                                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < allRatings.length - 1 && <Divider component="li" sx={{ borderColor: darkMode ? '#555' : '#ddd' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" sx={{ color: darkMode ? '#bbb' : '#777', mt: 1 }}>
                        Chưa có đánh giá nào cho bài viết này. Hãy là người đầu tiên!
                    </Typography>
                )}

            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    disabled={loading}
                    sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' } }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || value === 0} // Vô hiệu hóa nếu đang loading hoặc chưa chọn sao nào
                    sx={{
                        minWidth: 100,
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#1565c0' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi đánh giá'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RatingDialog;
