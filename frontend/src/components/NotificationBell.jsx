import React, { useState, useEffect, useContext } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Chip,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsNone as NotificationsNoneIcon,
    Circle as CircleIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import API from '../services/api.jsx';

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);

    const open = Boolean(anchorEl);

    // Initialize socket connection
    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000');

            newSocket.on('connect', () => {
                // Join user's personal notification room
                newSocket.emit('joinUserRoom', user._id);
            });

            // Listen for new notifications
            newSocket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/favicon.ico'
                    });
                }
            });

            // Listen for force logout (when account is suspended/banned)
            newSocket.on('forceLogout', (data) => {
                alert(data.reason);
                localStorage.removeItem('token');
                window.location.href = '/login';
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Fetch notifications when component mounts
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await API.get('/notifications?limit=10');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await API.get('/notifications/unread-count');
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        if (notifications.length === 0) {
            fetchNotifications();
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await API.put(`/notifications/${notification.id}/read`);
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to action URL if available
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }

        handleClose();
    };

    const handleMarkAllRead = async () => {
        try {
            await API.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId, event) => {
        event.stopPropagation();
        try {
            await API.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            // Update unread count if the deleted notification was unread
            const deletedNotification = notifications.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            'post_created': '📝',
            'comment_added': '💬',
            'comment_reply': '↩️',
            'post_liked': '❤️',
            'comment_liked': '👍',
            'post_rated': '⭐',
            'account_warning': '⚠️',
            'account_suspended': '🚫',
            'account_banned': '🔨',
            'account_activated': '✅',
            'announcement': '📢',
            'system_maintenance': '🔧',
            'feature_update': '🆕'
        };
        return iconMap[type] || '🔔';
    };

    const getPriorityColor = (priority) => {
        const colorMap = {
            'low': 'default',
            'normal': 'primary',
            'high': 'warning',
            'urgent': 'error'
        };
        return colorMap[priority] || 'default';
    };

    if (!user) return null;

    return (
        <>
            <Tooltip title="Thông báo">
                <IconButton
                    color="inherit"
                    onClick={handleClick}
                    sx={{ ml: 1 }}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxHeight: 500,
                        overflow: 'auto'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            Thông báo ({unreadCount})
                        </Typography>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<MarkEmailReadIcon />}
                                onClick={handleMarkAllRead}
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography>Đang tải...</Typography>
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            Không có thông báo nào
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: notification.color || '#1976d2' }}>
                                            {getNotificationIcon(notification.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                                    {notification.title}
                                                </Typography>
                                                {!notification.isRead && (
                                                    <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                                                )}
                                                <Chip
                                                    label={notification.priority}
                                                    size="small"
                                                    color={getPriorityColor(notification.priority)}
                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.timeAgo}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                                        sx={{ ml: 1 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button
                        fullWidth
                        onClick={() => {
                            navigate('/notifications');
                            handleClose();
                        }}
                    >
                        Xem tất cả thông báo
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBell;
