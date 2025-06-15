import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    TextField,
    InputAdornment,
    Divider,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { OnlineBadge } from './OnlineIndicator';
import {
    Search as SearchIcon,
    Person as PersonIcon
} from '@mui/icons-material';

const SimpleConversationList = ({
    conversations = [],
    onSelectConversation,
    selectedConversation,
    loading = false,
    currentUser,
    isMobile = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to get other participant - moved before usage
    const getOtherParticipant = (conversation) => {
        if (!currentUser) {
            return {
                fullName: 'Người dùng',
                email: '',
                avatar: null,
                role: 'user'
            };
        }

        // Thử tìm từ participantDetails trước (cho mock conversations)
        if (conversation.participantDetails && Array.isArray(conversation.participantDetails)) {
            const otherParticipant = conversation.participantDetails.find(p => p._id !== currentUser._id);
            if (otherParticipant) {
                return otherParticipant;
            }
        }

        // Nếu không có participantDetails, thử tìm từ participants (cho real conversations)
        if (conversation.participants && Array.isArray(conversation.participants)) {
            const otherParticipant = conversation.participants.find(p => {
                // participants có thể là array of objects hoặc array of IDs
                const participantId = typeof p === 'object' ? p._id : p;
                return participantId !== currentUser._id;
            });

            if (otherParticipant && typeof otherParticipant === 'object') {
                return otherParticipant;
            }
        }

        return {
            fullName: 'Người dùng',
            email: '',
            avatar: null,
            role: 'user'
        };
    };

    // Filter conversations based on search term
    const filteredConversations = conversations.filter(conversation => {
        if (!searchTerm.trim()) return true;

        const otherParticipant = getOtherParticipant(conversation);
        return otherParticipant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            otherParticipant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';

        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now - messageTime) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
            return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} giờ`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} ngày`;
        }
    };

    const truncateMessage = (message, maxLength = 50) => {
        if (!message) return 'Không có tin nhắn';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    if (loading && conversations.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search Bar */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="🔍 Tìm kiếm cuộc trò chuyện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#667eea' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                            backgroundColor: 'white',
                            border: '2px solid rgba(102, 126, 234, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                            },
                            '&.Mui-focused': {
                                border: '2px solid #667eea',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                            },
                            '& fieldset': {
                                border: 'none'
                            }
                        },
                        '& .MuiInputBase-input': {
                            padding: '12px 16px',
                            fontSize: '0.95rem'
                        }
                    }}
                />
            </Box>

            {/* Conversations List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        color: 'text.secondary'
                    }}>
                        <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2">
                            {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1 }}>
                            Hãy tìm người dùng để bắt đầu chat mới
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredConversations.map((conversation) => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const isSelected = selectedConversation?._id === conversation._id;
                            const unreadCount = conversation.unreadCount || 0;

                            return (
                                <React.Fragment key={conversation._id}>
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            selected={isSelected}
                                            onClick={() => onSelectConversation(conversation)}
                                            sx={{
                                                py: 3,
                                                px: 3.5,
                                                borderRadius: '12px',
                                                mx: 1,
                                                mb: 1.5,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                    transform: 'translateX(4px)',
                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                                                },
                                                '&.Mui-selected': {
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                                    borderLeft: '4px solid #667eea',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <OnlineBadge
                                                    userId={otherParticipant._id}
                                                    size="small"
                                                    showTooltip={true}
                                                >
                                                    <Avatar
                                                        src={otherParticipant.avatarUrl || otherParticipant.avatar}
                                                        sx={{
                                                            width: 52,
                                                            height: 52,
                                                            background: otherParticipant.role === 'admin'
                                                                ? 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)'
                                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '1.1rem',
                                                            border: '2px solid rgba(255,255,255,0.2)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }}
                                                    >
                                                        {!otherParticipant.avatarUrl && !otherParticipant.avatar ?
                                                            (otherParticipant.fullName?.charAt(0)?.toUpperCase() || 'U') :
                                                            null
                                                        }
                                                    </Avatar>
                                                </OnlineBadge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                                            {otherParticipant.fullName || 'Người dùng'}
                                                        </span>
                                                        {otherParticipant.role === 'admin' && (
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
                                                    </span>
                                                }
                                                secondary={
                                                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ flex: 1, color: '#666', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {truncateMessage(conversation.lastMessage?.content)}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {unreadCount > 0 && (
                                                                <Chip
                                                                    label={unreadCount > 5 ? '5+' : unreadCount}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 20,
                                                                        minWidth: 20,
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 'bold',
                                                                        background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        '& .MuiChip-label': {
                                                                            px: 0.5
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                            <span style={{ color: '#999', fontSize: '0.7rem' }}>
                                                                {formatLastMessageTime(conversation.lastMessage?.createdAt)}
                                                            </span>
                                                        </span>
                                                    </span>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default SimpleConversationList;
