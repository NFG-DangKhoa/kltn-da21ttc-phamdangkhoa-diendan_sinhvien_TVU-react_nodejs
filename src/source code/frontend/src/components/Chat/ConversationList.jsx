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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Circle as CircleIcon
} from '@mui/icons-material';
import { OnlineBadge } from './OnlineIndicator';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const ConversationList = ({ onSelectConversation, isMobile = false, isFullscreen = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatDialog, setShowNewChatDialog] = useState(false);
    const [searchUsers, setSearchUsers] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const {
        conversations,
        loading,
        error,
        onlineUsers,
        loadConversations,
        createConversation
    } = useChat();
    const { user } = useAuth();

    // Load conversations on mount
    useEffect(() => {
        if (user && user._id) {
            loadConversations();
        }
    }, [user, loadConversations]);

    // Search users for new chat
    useEffect(() => {
        const searchUsersDebounced = async () => {
            if (userSearchQuery.trim().length > 0) {
                setSearchingUsers(true);
                try {
                    const response = await chatService.searchUsers(userSearchQuery);
                    setSearchUsers(response.data);
                } catch (error) {
                    console.error('Error searching users:', error);
                } finally {
                    setSearchingUsers(false);
                }
            } else {
                setSearchUsers([]);
            }
        };

        const timeoutId = setTimeout(searchUsersDebounced, 300);
        return () => clearTimeout(timeoutId);
    }, [userSearchQuery]);

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conversation => {
        if (!searchQuery.trim()) return true;

        const otherParticipant = conversation.participantDetails?.find(
            p => p._id !== user._id
        );

        return otherParticipant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleStartNewChat = async (selectedUser) => {
        try {
            const conversation = await createConversation(selectedUser._id);
            onSelectConversation(conversation);
            setShowNewChatDialog(false);
            setUserSearchQuery('');
            setSearchUsers([]);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    const getLastMessagePreview = (conversation) => {
        if (!conversation.lastMessageDetails) {
            return 'Chưa có tin nhắn';
        }

        const message = conversation.lastMessageDetails;
        if (message.messageType === 'image') {
            return '📷 Hình ảnh';
        } else if (message.messageType === 'file') {
            return '📎 File đính kèm';
        }

        return message.content.length > 50
            ? message.content.substring(0, 50) + '...'
            : message.content;
    };

    if (loading && conversations.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search and New Chat */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setShowNewChatDialog(true)}
                                    sx={{ color: 'primary.main' }}
                                >
                                    <AddIcon />
                                </IconButton>
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

            {/* Conversations List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
                        </Typography>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setShowNewChatDialog(true)}
                            sx={{ mt: 2 }}
                        >
                            Bắt đầu chat
                        </Button>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredConversations.map((conversation, index) => {
                            const otherParticipant = conversation.participantDetails?.find(
                                p => p._id !== user._id
                            );
                            const isOnline = isUserOnline(otherParticipant?._id);
                            const unreadCount = conversation.unreadCount || 0;

                            return (
                                <React.Fragment key={conversation._id}>
                                    <ListItem
                                        button
                                        onClick={() => onSelectConversation(conversation)}
                                        sx={{
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                            backgroundColor: unreadCount > 0 ? 'action.selected' : 'transparent',
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    isOnline ? (
                                                        <CircleIcon
                                                            sx={{
                                                                color: 'success.main',
                                                                fontSize: 12,
                                                                border: '2px solid white',
                                                                borderRadius: '50%'
                                                            }}
                                                        />
                                                    ) : null
                                                }
                                            >
                                                <Avatar
                                                    src={otherParticipant?.avatarUrl}
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        border: otherParticipant?.role === 'admin' ? '2px solid #f44336' : 'none'
                                                    }}
                                                >
                                                    {otherParticipant?.fullName?.charAt(0) || <PersonIcon />}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: unreadCount > 0 ? 600 : 400,
                                                            flex: 1
                                                        }}
                                                    >
                                                        {otherParticipant?.fullName || 'Người dùng'}
                                                    </Typography>
                                                    {otherParticipant?.role === 'admin' && (
                                                        <Chip
                                                            label="Admin"
                                                            size="small"
                                                            color="error"
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    )}
                                                    {unreadCount > 0 && (
                                                        <Badge
                                                            badgeContent={unreadCount}
                                                            color="primary"
                                                            max={99}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontWeight: unreadCount > 0 ? 500 : 400,
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {getLastMessagePreview(conversation)}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    >
                                                        {chatService.formatConversationTime(conversation.lastMessageAt)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredConversations.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Box>

            {/* New Chat Dialog */}
            <Dialog
                open={showNewChatDialog}
                onClose={() => setShowNewChatDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Bắt đầu cuộc trò chuyện mới</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm người dùng..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchingUsers && (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} />
                                </InputAdornment>
                            )
                        }}
                        sx={{ mt: 1, mb: 2 }}
                    />

                    {searchUsers.length > 0 && (
                        <List>
                            {searchUsers.map((searchUser) => (
                                <ListItem
                                    key={searchUser._id}
                                    button
                                    onClick={() => handleStartNewChat(searchUser)}
                                >
                                    <ListItemAvatar>
                                        <OnlineBadge
                                            userId={searchUser._id}
                                            size="small"
                                            showTooltip={true}
                                        >
                                            <Avatar
                                                src={searchUser.avatarUrl}
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
                                                <Typography variant="subtitle2">
                                                    {searchUser.fullName}
                                                </Typography>
                                                {searchUser.role === 'admin' && (
                                                    <Chip
                                                        label="👑 Admin"
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            '& .MuiChip-label': {
                                                                px: 1
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={`@${searchUser.username || searchUser.email}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNewChatDialog(false)}>
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConversationList;
