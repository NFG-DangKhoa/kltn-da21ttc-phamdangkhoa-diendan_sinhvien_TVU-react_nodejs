import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import chatService from '../../services/chatService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(1),
        maxWidth: 500,
        width: '100%'
    }
}));

const SenderInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: 12,
    marginBottom: theme.spacing(2)
}));

const MessagePreview = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    marginBottom: theme.spacing(2)
}));

const MessageAcceptanceDialog = ({ 
    open, 
    onClose, 
    pendingMessage,
    onAccept,
    onReject 
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccept = async () => {
        if (!pendingMessage) return;
        
        setLoading(true);
        setError('');
        
        try {
            await chatService.acceptMessage(pendingMessage.messageId);
            onAccept && onAccept(pendingMessage);
            onClose();
        } catch (error) {
            console.error('Error accepting message:', error);
            setError('Có lỗi xảy ra khi chấp nhận tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!pendingMessage) return;
        
        setLoading(true);
        setError('');
        
        try {
            await chatService.rejectMessage(pendingMessage.messageId);
            onReject && onReject(pendingMessage);
            onClose();
        } catch (error) {
            console.error('Error rejecting message:', error);
            setError('Có lỗi xảy ra khi từ chối tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (!pendingMessage) return null;

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Tin nhắn mới
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Bạn có muốn chấp nhận tin nhắn này không?
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <SenderInfo>
                    <Avatar 
                        src={pendingMessage.senderId?.avatarUrl}
                        sx={{ width: 48, height: 48 }}
                    >
                        {pendingMessage.senderName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {pendingMessage.senderName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            @{pendingMessage.senderId?.username}
                        </Typography>
                    </Box>
                    <Chip 
                        label="Người dùng mới" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                    />
                </SenderInfo>

                <MessagePreview>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Nội dung tin nhắn:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {pendingMessage.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Gửi lúc: {formatTime(pendingMessage.timestamp)}
                    </Typography>
                </MessagePreview>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        Nếu bạn chấp nhận, tin nhắn này sẽ xuất hiện trong cuộc trò chuyện. 
                        Nếu từ chối, tin nhắn sẽ bị xóa vĩnh viễn.
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                    onClick={onClose}
                    disabled={loading}
                    color="inherit"
                >
                    Đóng
                </Button>
                <Button 
                    onClick={handleReject}
                    disabled={loading}
                    color="error"
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    Từ chối
                </Button>
                <Button 
                    onClick={handleAccept}
                    disabled={loading}
                    color="primary"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    Chấp nhận
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default MessageAcceptanceDialog;
