import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon,
    Image as ImageIcon,
    AttachFile as AttachFileIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    DeleteSweep as DeleteSweepIcon,
    Undo as UndoIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const MessageList = ({ messages, conversation }) => {
    const messagesEndRef = useRef(null);
    const { markAsRead, typingUsers, deleteMessage } = useChat();
    const { user } = useAuth();
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when they come into view
    useEffect(() => {
        if (messages.length > 0) {
            const unreadMessages = messages.filter(
                msg => msg.receiverId === user._id && msg.status !== 'read'
            );

            unreadMessages.forEach(msg => {
                markAsRead(msg._id);
            });
        }
    }, [messages, user._id, markAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMenuClick = (event, message) => {
        setSelectedMessage(message);
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setSelectedMessage(null);
    };

    const handleDeleteMessage = async () => {
        if (selectedMessage) {
            try {
                await deleteMessage(selectedMessage._id);
                console.log('✅ Message deleted successfully');
            } catch (error) {
                console.error('❌ Error deleting message:', error);
                // Could show a snackbar or toast here
            }
        }
        handleCloseMenu();
    };

    const handleDeleteAllMessages = async () => {
        if (!conversation?._id) return;

        setDeletingAll(true);
        try {
            await chatService.deleteAllMessages(conversation._id);
            console.log('✅ All messages deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting all messages:', error);
            // Could show a snackbar or toast here
        } finally {
            setDeletingAll(false);
        }
        handleCloseMenu();
    };

    const handleRecallMessage = async () => {
        if (selectedMessage) {
            try {
                await chatService.recallMessage(selectedMessage._id);
                console.log('✅ Message recalled successfully');
            } catch (error) {
                console.error('❌ Error recalling message:', error);
                // Could show a snackbar or toast here
            }
        }
        handleCloseMenu();
    };

    const canRecallMessage = (message) => {
        if (!isMyMessage(message)) return false;

        const now = new Date();
        const messageTime = new Date(message.createdAt);
        const diffMinutes = (now - messageTime) / (1000 * 60);

        return diffMinutes <= 5; // 5 minutes recall window
    };

    const isMyMessage = (message) => {
        return message.senderId === user._id || message.senderId._id === user._id;
    };

    const getMessageStatus = (message) => {
        if (!isMyMessage(message)) return null;

        switch (message.status) {
            case 'sent':
                return <DoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
            case 'delivered':
                return <DoneAllIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
            case 'read':
                return <DoneAllIcon sx={{ fontSize: 16, color: 'primary.main' }} />;
            default:
                return null;
        }
    };

    const renderMessageContent = (message) => {
        if (message.isDeleted) {
            return (
                <Typography
                    variant="body2"
                    sx={{
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        opacity: 0.7
                    }}
                >
                    Tin nhắn đã bị xóa
                </Typography>
            );
        }

        if (message.isRecalled) {
            return (
                <Typography
                    variant="body2"
                    sx={{
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        opacity: 0.7
                    }}
                >
                    Tin nhắn đã được thu hồi
                </Typography>
            );
        }

        switch (message.messageType) {
            case 'image':
                return (
                    <Box>
                        {message.attachments?.map((attachment, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                                <img
                                    src={attachment.fileUrl}
                                    alt={attachment.fileName}
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                                />
                            </Box>
                        ))}
                        {message.content && (
                            <Typography variant="body2">
                                {message.content}
                            </Typography>
                        )}
                    </Box>
                );

            case 'file':
                return (
                    <Box>
                        {message.attachments?.map((attachment, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                            >
                                <AttachFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" noWrap>
                                        {attachment.fileName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {chatService.formatFileSize(attachment.fileSize)}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                        {message.content && (
                            <Typography variant="body2">
                                {message.content}
                            </Typography>
                        )}
                    </Box>
                );

            default:
                return (
                    <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{
                            __html: chatService.formatMessageContent(message.content)
                        }}
                    />
                );
        }
    };

    const renderTypingIndicator = () => {
        const conversationTyping = typingUsers[conversation._id];
        if (!conversationTyping) return null;

        const typingUserIds = Object.keys(conversationTyping).filter(
            userId => conversationTyping[userId] && userId !== user._id
        );

        if (typingUserIds.length === 0) return null;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    <Typography variant="caption">...</Typography>
                </Avatar>
                <Paper
                    sx={{
                        p: 1,
                        backgroundColor: 'grey.100',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Đang gõ
                    </Typography>
                    <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                        {[0, 1, 2].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    backgroundColor: 'text.secondary',
                                    animation: 'typing 1.4s infinite',
                                    animationDelay: `${i * 0.2}s`,
                                    '@keyframes typing': {
                                        '0%, 60%, 100%': { opacity: 0.3 },
                                        '30%': { opacity: 1 }
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
            </Box>
        );
    };

    if (!messages) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isMe = isMyMessage(message);
                            const showAvatar = !isMe && (
                                index === 0 ||
                                !isMyMessage(messages[index - 1])
                            );
                            const showTime = index === 0 ||
                                new Date(message.createdAt).getTime() -
                                new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes

                            return (
                                <Box
                                    key={message._id}
                                    onMouseEnter={() => setHoveredMessageId(message._id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    {showTime && (
                                        <Box sx={{ textAlign: 'center', my: 2 }}>
                                            <Chip
                                                label={chatService.formatMessageTime(message.createdAt)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        </Box>
                                    )}

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                            mb: 1,
                                            alignItems: 'center'
                                        }}
                                    >
                                        {showAvatar && !isMe && (
                                            <Avatar
                                                src={message.senderId?.avatarUrl && !message.senderId?.isAvatarBlocked ? message.senderId?.avatarUrl : undefined}
                                                sx={{ width: 32, height: 32, mr: 1 }}
                                            >
                                                {message.senderId?.fullName?.charAt(0)}
                                            </Avatar>
                                        )}

                                        {isMe && hoveredMessageId === message._id && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuClick(e, message)}
                                                sx={{ mr: 0.5 }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        )}

                                        <Box
                                            sx={{
                                                position: 'relative',
                                                maxWidth: '70%',
                                                ml: !isMe && !showAvatar ? 5 : 0,
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    backgroundColor: isMe ? 'primary.main' : 'grey.100',
                                                    color: isMe ? 'primary.contrastText' : 'text.primary',
                                                    borderRadius: 2,
                                                    borderTopRightRadius: isMe ? 0.5 : 2,
                                                    borderTopLeftRadius: !isMe ? 0.5 : 2
                                                }}
                                            >
                                                {renderMessageContent(message)}

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            opacity: 0.7,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                        {message.isEdited && ' (đã chỉnh sửa)'}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {getMessageStatus(message)}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Box>

                                        {!isMe && hoveredMessageId === message._id && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuClick(e, message)}
                                                sx={{ ml: 0.5 }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}

                        {renderTypingIndicator()}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </Box>

            {/* Message Menu */}
            <Menu
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                anchorEl={menuAnchor}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{ zIndex: 1002 }}
            >
                {selectedMessage && isMyMessage(selectedMessage) && canRecallMessage(selectedMessage) && (
                    <MenuItem onClick={handleRecallMessage}>
                        <UndoIcon sx={{ mr: 1 }} />
                        Thu hồi tin nhắn
                    </MenuItem>
                )}
                {selectedMessage && isMyMessage(selectedMessage) && (
                    <MenuItem>
                        <EditIcon sx={{ mr: 1 }} />
                        Chỉnh sửa tin nhắn
                    </MenuItem>
                )}
                {selectedMessage && (
                    <MenuItem onClick={handleDeleteMessage}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Xóa tin nhắn
                    </MenuItem>
                )}
                {selectedMessage && isMyMessage(selectedMessage) && (
                    <MenuItem
                        onClick={handleDeleteAllMessages}
                        disabled={deletingAll}
                        sx={{ color: 'error.main' }}
                    >
                        <DeleteSweepIcon sx={{ mr: 1 }} />
                        {deletingAll ? 'Đang xóa...' : 'Xóa tất cả tin nhắn'}
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default MessageList;
