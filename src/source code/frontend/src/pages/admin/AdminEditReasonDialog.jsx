import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';

const AdminEditReasonDialog = ({ open, onClose, onConfirm, postTitle, authorName }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do chỉnh sửa');
            return;
        }
        
        onConfirm(reason.trim());
        handleClose();
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                },
            }}
        >
            <DialogTitle sx={{ 
                pb: 1,
                borderBottom: '1px solid #e4e6ea'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Lý do chỉnh sửa bài viết
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Admin cần phải điền lý do để chỉnh sửa bài viết này, lý do này sẽ được thông báo đến user (tác giả bài viết) ngay lập tức.
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Bài viết:</strong> {postTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Tác giả:</strong> {authorName}
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Lý do chỉnh sửa"
                    placeholder="Nhập lý do tại sao bạn cần chỉnh sửa bài viết này..."
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (error) setError('');
                    }}
                    error={!!error}
                    helperText={error}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                        },
                    }}
                />
            </DialogContent>
            
            <DialogActions sx={{ 
                p: 2, 
                borderTop: '1px solid #e4e6ea',
                gap: 1
            }}>
                <Button 
                    onClick={handleClose}
                    variant="outlined"
                    sx={{ borderRadius: '8px' }}
                >
                    Hủy
                </Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    sx={{ 
                        borderRadius: '8px',
                        minWidth: '120px'
                    }}
                >
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminEditReasonDialog;
