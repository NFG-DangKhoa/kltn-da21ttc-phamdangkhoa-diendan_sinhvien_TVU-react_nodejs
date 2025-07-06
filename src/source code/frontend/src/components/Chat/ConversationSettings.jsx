import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    CircularProgress,
    Paper,
    DialogContentText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import chatService from '../../services/chatService';
import { useChat } from '../../context/ChatContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(1),
        maxWidth: 600,
        width: '100%'
    }
}));

const SettingSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper
}));

const SettingHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2)
}));

const ConversationSettings = ({ 
    open, 
    onClose, 
    conversationId,
    currentUserId 
}) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        requireAcceptance: false,
        autoAcceptFromKnownUsers: true
    });
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

    const { deleteAllMessagesInConversation } = useChat();

    useEffect(() => {
        if (open && conversationId) {
            loadSettings();
        }
    }, [open, conversationId]);

    const loadSettings = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await chatService.getConversationSettings(conversationId);
            const userSettings = response.settings || {};
            
            setSettings({
                requireAcceptance: userSettings.requireAcceptance || false,
                autoAcceptFromKnownUsers: userSettings.autoAcceptFromKnownUsers !== false
            });
        } catch (error) {
            console.error('Error loading settings:', error);
            setError('Không thể tải cài đặt cuộc trò chuyện');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        
        try {
            await chatService.updateConversationSettings(conversationId, settings);
            onClose();
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Có lỗi xảy ra khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (key) => (event) => {
        setSettings(prev => ({
            ...prev,
            [key]: event.target.checked
        }));
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Cài đặt cuộc trò chuyện
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Quản lý cách bạn nhận tin nhắn trong cuộc trò chuyện này
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <SettingSection elevation={0}>
                            <SettingHeader>
                                <SecurityIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Bảo mật tin nhắn
                                </Typography>
                            </SettingHeader>
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.requireAcceptance}
                                        onChange={handleSettingChange('requireAcceptance')}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Yêu cầu chấp nhận tin nhắn
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Tin nhắn từ người lạ sẽ cần được chấp nhận trước khi hiển thị
                                        </Typography>
                                    </Box>
                                }
                                sx={{ alignItems: 'flex-start', ml: 0 }}
                            />
                        </SettingSection>

                        {settings.requireAcceptance && (
                            <SettingSection elevation={0}>
                                <SettingHeader>
                                    <NotificationsIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Tự động chấp nhận
                                    </Typography>
                                </SettingHeader>
                                
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.autoAcceptFromKnownUsers}
                                            onChange={handleSettingChange('autoAcceptFromKnownUsers')}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Tự động chấp nhận từ người quen
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Tự động chấp nhận tin nhắn từ những người đã từng trò chuyện
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start', ml: 0 }}
                                />
                            </SettingSection>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Lưu ý:</strong> Cài đặt này chỉ áp dụng cho cuộc trò chuyện hiện tại. 
                                Bạn có thể thay đổi cài đặt bất cứ lúc nào.
                            </Typography>
                        </Alert>

                        <SettingSection elevation={0} sx={{ mt: 3 }}>
                            <SettingHeader>
                                <DeleteForeverIcon color="error" />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                                    Xóa tin nhắn
                                </Typography>
                            </SettingHeader>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Xóa tất cả tin nhắn trong cuộc trò chuyện này cho riêng bạn. Hành động này không thể hoàn tác.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteForeverIcon />}
                                onClick={() => setOpenConfirmDeleteDialog(true)}
                            >
                                Xóa tất cả tin nhắn
                            </Button>
                        </SettingSection>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                    onClick={onClose}
                    disabled={saving}
                    color="inherit"
                >
                    Hủy
                </Button>
                <Button 
                    onClick={handleSave}
                    disabled={loading || saving}
                    color="primary"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : null}
                >
                    Lưu cài đặt
                </Button>
            </DialogActions>

            <Dialog
                open={openConfirmDeleteDialog}
                onClose={() => setOpenConfirmDeleteDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Xác nhận xóa tất cả tin nhắn?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa tất cả tin nhắn trong cuộc trò chuyện này cho riêng bạn không? 
                        Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn các tin nhắn khỏi lịch sử trò chuyện của bạn.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDeleteDialog(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={async () => {
                        try {
                            await deleteAllMessagesInConversation(conversationId);
                            onClose(); // Close settings dialog after deletion
                        } catch (err) {
                            console.error('Error deleting all messages:', err);
                            setError('Lỗi khi xóa tất cả tin nhắn.');
                        }
                        setOpenConfirmDeleteDialog(false);
                    }} color="error" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledDialog>
    );
};

export default ConversationSettings;
