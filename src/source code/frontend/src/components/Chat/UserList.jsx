import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Badge,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};
import {
    Search as SearchIcon,
    Person as PersonIcon,
    Circle as CircleIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { OnlineBadge } from './OnlineIndicator';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const UserList = ({ onStartChat, isMobile = false, isFullscreen = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { onlineUsers, createConversation } = useChat();
    const { user } = useAuth();

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim().length > 0) {
                setLoading(true);
                setError(null);
                try {
                    const response = await chatService.searchUsers(searchQuery);
                    setUsers(response.data);
                } catch (error) {
                    setError('Lỗi khi tìm kiếm người dùng');
                    console.error('Error searching users:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setUsers([]);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleStartChat = async (selectedUser) => {
        console.log('UserList: handleStartChat called with selectedUser:', selectedUser);
        try {
            // Thử tạo real conversation trước
            try {
                console.log('UserList: Trying to create real conversation with user ID:', selectedUser._id);
                const conversation = await createConversation(selectedUser._id);
                console.log('UserList: Real conversation created:', conversation);
                if (onStartChat) {
                    onStartChat(conversation, selectedUser);
                }
                return;
            } catch (realError) {
                console.warn('Real conversation failed, using mock:', realError.message);

                // Nếu real conversation fail, fallback to mock
                console.log('UserList: Creating mock conversation');
                console.log('UserList: Current user:', user);
                console.log('UserList: Selected user:', selectedUser);

                const mockId = '6' + Date.now().toString(16).padStart(23, '0');
                const mockConversation = {
                    _id: mockId,
                    type: 'direct',
                    participants: [user._id, selectedUser._id],
                    participantDetails: [user, selectedUser],
                    lastMessage: null,
                    lastMessageAt: new Date(),
                    createdAt: new Date(),
                    isMock: true // Flag để nhận biết đây là mock
                };

                console.log('UserList: Mock conversation created:', mockConversation);

                if (onStartChat) {
                    onStartChat(mockConversation, selectedUser);
                }
            }
        } catch (error) {
            setError('Lỗi khi tạo cuộc trò chuyện');
            console.error('Error creating conversation:', error);
        }
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    const getUserStatusColor = (userStatus) => {
        switch (userStatus) {
            case 'active':
                return 'success.main';
            case 'suspended':
                return 'warning.main';
            case 'banned':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };

    const getUserStatusText = (userStatus) => {
        switch (userStatus) {
            case 'active':
                return 'Hoạt động';
            case 'suspended':
                return 'Tạm khóa';
            case 'banned':
                return 'Bị cấm';
            default:
                return 'Không xác định';
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm người dùng để chat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: loading && (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
            </Box>

            {/* Error Alert */}
            {error && (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* Users List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {!searchQuery.trim() ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Nhập tên để tìm kiếm người dùng
                        </Typography>
                    </Box>
                ) : users.length === 0 && !loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Không tìm thấy người dùng nào
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {users.map((searchUser, index) => {
                            const isOnline = isUserOnline(searchUser._id);
                            const statusColor = getUserStatusColor(searchUser.status);
                            const statusText = getUserStatusText(searchUser.status);

                            return (
                                <React.Fragment key={searchUser._id}>
                                    <ListItem
                                        sx={{
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <OnlineBadge
                                                userId={searchUser._id}
                                                size="small"
                                                showTooltip={true}
                                            >
                                                <Avatar
                                                    src={constructUrl(searchUser.avatarUrl)}
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        background: searchUser.role === 'admin'
                                                            ? 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)'
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        border: searchUser.role === 'admin' ? '2px solid #ff4757' : '2px solid #667eea'
                                                    }}
                                                >
                                                    {!searchUser.avatarUrl ?
                                                        (searchUser.fullName?.charAt(0)?.toUpperCase() || <PersonIcon />) :
                                                        null
                                                    }
                                                </Avatar>
                                            </OnlineBadge>
                                        </ListItemAvatar>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                                        {searchUser.fullName}
                                                    </Typography>
                                                    {searchUser.role === 'admin' && (
                                                        <Chip
                                                            label="Admin"
                                                            size="small"
                                                            color="error"
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    )}
                                                    {isOnline && (
                                                        <Chip
                                                            label="Online"
                                                            size="small"
                                                            color="success"
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        @{searchUser.username || searchUser.email}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: statusColor }}
                                                    >
                                                        {statusText}
                                                    </Typography>
                                                </Box>
                                            }
                                        />

                                        <IconButton
                                            color="primary"
                                            onClick={() => handleStartChat(searchUser)}
                                            disabled={searchUser.status !== 'active'}
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                                '&:disabled': {
                                                    backgroundColor: 'action.disabledBackground',
                                                    color: 'action.disabled',
                                                }
                                            }}
                                        >
                                            <ChatIcon />
                                        </IconButton>
                                    </ListItem>
                                    {index < users.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Box>

            {/* Online Users Count */}
            {onlineUsers.length > 0 && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {onlineUsers.length} người đang online
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default UserList;
