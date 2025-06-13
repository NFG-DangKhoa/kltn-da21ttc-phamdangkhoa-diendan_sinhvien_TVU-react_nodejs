import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    VolumeUp as VolumeIcon,
    Palette as ThemeIcon,
    Security as PrivacyIcon,
    Storage as StorageIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const ChatSettings = ({ open, onClose }) => {
    const [settings, setSettings] = useState({
        notifications: {
            enabled: true,
            sound: true,
            desktop: true,
            email: false
        },
        appearance: {
            theme: 'auto', // 'light', 'dark', 'auto'
            fontSize: 14,
            bubbleStyle: 'rounded', // 'rounded', 'square'
            showAvatars: true,
            showTimestamps: true
        },
        privacy: {
            readReceipts: true,
            typingIndicators: true,
            lastSeen: true,
            onlineStatus: true
        },
        storage: {
            autoDownload: false,
            cacheSize: 100, // MB
            deleteAfter: 30 // days
        }
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('chatSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Save settings to localStorage
    const saveSettings = () => {
        localStorage.setItem('chatSettings', JSON.stringify(settings));
        onClose();
    };

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const resetSettings = () => {
        const defaultSettings = {
            notifications: {
                enabled: true,
                sound: true,
                desktop: true,
                email: false
            },
            appearance: {
                theme: 'auto',
                fontSize: 14,
                bubbleStyle: 'rounded',
                showAvatars: true,
                showTimestamps: true
            },
            privacy: {
                readReceipts: true,
                typingIndicators: true,
                lastSeen: true,
                onlineStatus: true
            },
            storage: {
                autoDownload: false,
                cacheSize: 100,
                deleteAfter: 30
            }
        };
        setSettings(defaultSettings);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <SettingsIcon />
                        <Typography variant="h6">Cài đặt Chat</Typography>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ py: 1 }}>
                    {/* Notifications Section */}
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <NotificationsIcon color="primary" />
                            <Typography variant="h6">Thông báo</Typography>
                        </Box>
                        
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="Bật thông báo"
                                    secondary="Nhận thông báo khi có tin nhắn mới"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.enabled}
                                        onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Âm thanh thông báo"
                                    secondary="Phát âm thanh khi có tin nhắn mới"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.sound}
                                        onChange={(e) => updateSetting('notifications', 'sound', e.target.checked)}
                                        disabled={!settings.notifications.enabled}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Thông báo desktop"
                                    secondary="Hiển thị thông báo trên desktop"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.desktop}
                                        onChange={(e) => updateSetting('notifications', 'desktop', e.target.checked)}
                                        disabled={!settings.notifications.enabled}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Appearance Section */}
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <ThemeIcon color="primary" />
                            <Typography variant="h6">Giao diện</Typography>
                        </Box>
                        
                        <List dense>
                            <ListItem>
                                <ListItemText primary="Chủ đề" />
                                <ListItemSecondaryAction>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <Select
                                            value={settings.appearance.theme}
                                            onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                                        >
                                            <MenuItem value="light">Sáng</MenuItem>
                                            <MenuItem value="dark">Tối</MenuItem>
                                            <MenuItem value="auto">Tự động</MenuItem>
                                        </Select>
                                    </FormControl>
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Kích thước chữ"
                                    secondary={`${settings.appearance.fontSize}px`}
                                />
                                <ListItemSecondaryAction sx={{ width: 120 }}>
                                    <Slider
                                        value={settings.appearance.fontSize}
                                        onChange={(e, value) => updateSetting('appearance', 'fontSize', value)}
                                        min={12}
                                        max={18}
                                        step={1}
                                        size="small"
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText primary="Hiển thị avatar" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.appearance.showAvatars}
                                        onChange={(e) => updateSetting('appearance', 'showAvatars', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText primary="Hiển thị thời gian" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.appearance.showTimestamps}
                                        onChange={(e) => updateSetting('appearance', 'showTimestamps', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Privacy Section */}
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <PrivacyIcon color="primary" />
                            <Typography variant="h6">Quyền riêng tư</Typography>
                        </Box>
                        
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="Xác nhận đã đọc"
                                    secondary="Cho phép người khác biết bạn đã đọc tin nhắn"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.privacy.readReceipts}
                                        onChange={(e) => updateSetting('privacy', 'readReceipts', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Hiển thị đang gõ"
                                    secondary="Cho phép người khác biết bạn đang gõ tin nhắn"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.privacy.typingIndicators}
                                        onChange={(e) => updateSetting('privacy', 'typingIndicators', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Trạng thái online"
                                    secondary="Hiển thị trạng thái online của bạn"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.privacy.onlineStatus}
                                        onChange={(e) => updateSetting('privacy', 'onlineStatus', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Storage Section */}
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <StorageIcon color="primary" />
                            <Typography variant="h6">Lưu trữ</Typography>
                        </Box>
                        
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="Tự động tải file"
                                    secondary="Tự động tải file đính kèm"
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.storage.autoDownload}
                                        onChange={(e) => updateSetting('storage', 'autoDownload', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemText 
                                    primary="Kích thước cache"
                                    secondary={`${settings.storage.cacheSize} MB`}
                                />
                                <ListItemSecondaryAction sx={{ width: 120 }}>
                                    <Slider
                                        value={settings.storage.cacheSize}
                                        onChange={(e, value) => updateSetting('storage', 'cacheSize', value)}
                                        min={50}
                                        max={500}
                                        step={50}
                                        size="small"
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={resetSettings} color="secondary">
                    Đặt lại mặc định
                </Button>
                <Button onClick={onClose}>
                    Hủy
                </Button>
                <Button onClick={saveSettings} variant="contained">
                    Lưu cài đặt
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChatSettings;
