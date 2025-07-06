import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Avatar,
    TextField,
    Button,
    Paper,
    Chip,
    Divider,
    CircularProgress,
    Menu,
    MenuItem
} from '@mui/material';
import { OnlineBadge } from './OnlineIndicator';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../../context/ChatContext';
import socket from '../../socket';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    Settings as SettingsIcon,
    NotificationImportant as NotificationImportantIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import MessageAcceptanceDialog from './MessageAcceptanceDialog';
import ConversationSettings from './ConversationSettings';

const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const ConversationView = ({
    conversation,
    messages = [],
    onBack,
    onSendMessage,
    currentUser,
    isMobile = false
}) => {
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { startTyping, stopTyping, recallMessage, deleteMessage } = useChat();
    const typingTimeoutRef = useRef(null);
    const [pendingMessage, setPendingMessage] = useState(null);
    const [showAcceptanceDialog, setShowAcceptanceDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    // Auto scroll to bottom when new messages arrive (với delay để tránh conflict)
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // Listen for new messages in real-time
    useEffect(() => {
        if (!conversation || conversation.isMock) return;

        const handleNewMessage = (message) => {
            // Kiểm tra xem tin nhắn có thuộc conversation hiện tại không
            if (message.conversationId === conversation._id) {
                console.log('📨 ConversationView: New message received for current conversation');
                // Message sẽ được thêm vào state thông qua ChatContext
                // Chỉ cần scroll to bottom
                setTimeout(() => scrollToBottom(), 200);
            }
        };

        // Lắng nghe socket events
        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [conversation]);

    // Listen for pending message events
    useEffect(() => {
        const handlePendingMessage = (data) => {
            if (data.conversationId === conversation?._id) {
                setPendingMessage(data);
                setShowAcceptanceDialog(true);
                setPendingCount(prev => prev + 1);
            }
        };

        const handleMessageAccepted = (data) => {
            if (data.conversationId === conversation?._id) {
                setPendingCount(prev => Math.max(0, prev - 1));
            }
        };

        const handleMessageRejected = (data) => {
            if (data.conversationId === conversation?._id) {
                setPendingCount(prev => Math.max(0, prev - 1));
            }
        };

        socket.on('pendingMessage', handlePendingMessage);
        socket.on('messageAccepted', handleMessageAccepted);
        socket.on('messageRejected', handleMessageRejected);

        return () => {
            socket.off('pendingMessage', handlePendingMessage);
            socket.off('messageAccepted', handleMessageAccepted);
            socket.off('messageRejected', handleMessageRejected);
        };
    }, [conversation?._id]);

    const scrollToBottom = () => {
        // Scroll trong messages container, không scroll toàn page
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const getOtherParticipant = () => {
        console.log('ConversationView: getOtherParticipant called');
        console.log('ConversationView: conversation:', conversation);
        console.log('ConversationView: currentUser:', currentUser);

        if (!currentUser) {
            console.log('ConversationView: Missing currentUser, returning default');
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
                console.log('ConversationView: Found other participant from participantDetails:', otherParticipant);
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
                console.log('ConversationView: Found other participant from participants:', otherParticipant);
                return otherParticipant;
            }
        }

        console.log('ConversationView: No other participant found, returning default');
        return {
            fullName: 'Người dùng',
            email: '',
            avatar: null,
            role: 'user'
        };
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || sending || !currentUser) return;

        const messageContent = messageText.trim();
        setSending(true);
        setMessageText(''); // Clear input immediately for better UX

        try {
            if (conversation.isMock) {
                // For mock conversation, add message directly to UI
                console.log('Mock message sent:', messageContent);

                // Call onSendMessage if provided to update parent state
                if (onSendMessage) {
                    const mockMessage = {
                        _id: `mock_${Date.now()}`,
                        content: messageContent,
                        senderId: currentUser._id,
                        createdAt: new Date(),
                        isRead: false
                    };
                    onSendMessage(mockMessage);
                }
            } else {
                // For real conversation, use the provided onSendMessage function
                if (onSendMessage) {
                    await onSendMessage(messageContent);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message text if there was an error
            setMessageText(messageContent);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleMessageChange = (e) => {
        const value = e.target.value;
        setMessageText(value);

        // Handle typing indicator
        if (value.trim() && conversation._id && currentUser._id) {
            // Start typing
            startTyping(conversation._id);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(conversation._id);
            }, 3000);
        } else {
            // Stop typing if message is empty
            stopTyping(conversation._id);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (conversation._id) {
                stopTyping(conversation._id);
            }
        };
    }, [conversation._id, stopTyping]);

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';

        const messageTime = new Date(timestamp);
        return messageTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAcceptMessage = (message) => {
        console.log('Message accepted:', message);
        // Message will be added to conversation through socket event
    };

    const handleRejectMessage = (message) => {
        console.log('Message rejected:', message);
        // Message will be removed from pending list
    };

    const handleOpenSettings = () => {
        setShowSettings(true);
    };

    const handleMenuOpen = (event, message) => {
        setAnchorEl(event.currentTarget);
        setSelectedMessage(message);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMessage(null);
    };

    const handleRevokeMessage = async () => {
        if (selectedMessage && selectedMessage._id) {
            try {
                await recallMessage(selectedMessage._id);
            } catch (error) {
                console.error('Error recalling message:', error);
            }
        }
        handleMenuClose();
    };

    const handleDeleteMessage = async () => {
        if (selectedMessage && selectedMessage._id) {
            try {
                await deleteMessage(selectedMessage._id);
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
        handleMenuClose();
    };

    const otherParticipant = getOtherParticipant();

    return (
        <Box
            className="conversation-view"
            sx={{
                height: '100%',
                width: '100%',
                maxWidth: '100%', // Đảm bảo không vượt quá container
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                overflow: 'hidden' // Ngăn overflow
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    boxShadow: '0 2px 10px rgba(102, 126, 234, 0.2)',
                    width: '100%',
                    flexShrink: 0, // Không cho header co lại
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                    }
                }}
            >
                {isMobile && onBack && (
                    <IconButton
                        onClick={onBack}
                        sx={{
                            mr: 2,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                )}
                <OnlineBadge
                    userId={otherParticipant._id}
                    size="medium"
                    showTooltip={true}
                >
                    <Avatar
                        src={constructUrl(otherParticipant.avatarUrl || otherParticipant.avatar)}
                        sx={{
                            mr: 3,
                            width: 48,
                            height: 48,
                            bgcolor: otherParticipant.role === 'admin' ? '#ff4757' : '#667eea',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            border: '3px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        {!otherParticipant.avatarUrl && !otherParticipant.avatar ?
                            (otherParticipant.fullName?.charAt(0)?.toUpperCase() || 'U') :
                            null
                        }
                    </Avatar>
                </OnlineBadge>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}
                        >
                            {otherParticipant.fullName || 'Người dùng'}
                        </Typography>
                        {otherParticipant.role === 'admin' && (
                            <Chip
                                label="👑 Admin"
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    '& .MuiChip-label': {
                                        px: 1.5
                                    }
                                }}
                            />
                        )}
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: 400
                        }}
                    >
                        {otherParticipant.email}
                    </Typography>
                </Box>

                {/* Settings and Pending Messages */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {pendingCount > 0 && (
                        <IconButton
                            onClick={() => setShowAcceptanceDialog(true)}
                            sx={{
                                color: 'white',
                                backgroundColor: 'rgba(255,193,7,0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,193,7,0.3)'
                                }
                            }}
                        >
                            <NotificationImportantIcon />
                            {pendingCount > 0 && (
                                <Chip
                                    label={pendingCount}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        minWidth: 20,
                                        height: 20,
                                        backgroundColor: '#ff4757',
                                        color: 'white',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            )}
                        </IconButton>
                    )}
                    <IconButton
                        onClick={handleOpenSettings}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Messages */}
            <Box
                ref={messagesContainerRef}
                className="messages-container custom-scrollbar"
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: { xs: 2, sm: 3 },
                    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
                    scrollBehavior: 'smooth',
                    position: 'relative',
                    minHeight: 0, // Important for flex child to shrink
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        minHeight: '300px',
                        color: 'text.secondary'
                    }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            <Typography sx={{ fontSize: '2rem' }}>💬</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                            Chưa có tin nhắn nào
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                            Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với {otherParticipant.fullName}
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {messages.map((message, index) => {
                            // So sánh cả string và object ID
                            const messageSenderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
                            const currentUserId = typeof currentUser._id === 'object' ? currentUser._id._id : currentUser._id;
                            const isOwnMessage = messageSenderId === currentUserId;
                            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                            // Debug log
                            if (index === messages.length - 1) { // Log chỉ tin nhắn cuối
                                console.log('ConversationView: Message debug');
                                console.log('ConversationView: message.senderId (raw):', message.senderId);
                                console.log('ConversationView: messageSenderId (processed):', messageSenderId);
                                console.log('ConversationView: currentUser._id (raw):', currentUser._id);
                                console.log('ConversationView: currentUserId (processed):', currentUserId);
                                console.log('ConversationView: isOwnMessage:', isOwnMessage);
                                console.log('ConversationView: Types:', typeof message.senderId, typeof currentUser._id);
                            }

                            return (
                                <Box
                                    key={message._id || index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                        alignItems: 'flex-end'
                                    }}
                                    onMouseEnter={() => setHoveredMessageId(message._id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    {!isOwnMessage && showAvatar && (
                                        <Avatar
                                            src={constructUrl(otherParticipant.avatarUrl || otherParticipant.avatar)}
                                            sx={{
                                                width: { xs: 28, sm: 32 },
                                                height: { xs: 28, sm: 32 },
                                                mr: { xs: 0.5, sm: 1 },
                                                bgcolor: otherParticipant.role === 'admin' ? 'error.main' : 'primary.main',
                                                flexShrink: 0
                                            }}
                                        >
                                            {otherParticipant.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </Avatar>
                                    )}
                                    {!isOwnMessage && !showAvatar && (
                                        <Box sx={{ width: { xs: 28, sm: 32 }, mr: { xs: 0.5, sm: 1 } }} />
                                    )}

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: { xs: 1.5, sm: 2 },
                                            maxWidth: { xs: '85%', sm: '80%', md: '75%' },
                                            minWidth: '120px',
                                            background: isOwnMessage
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            color: isOwnMessage ? 'white' : 'text.primary',
                                            borderRadius: { xs: '16px', sm: '20px' },
                                            borderBottomLeftRadius: !isOwnMessage && showAvatar ? '6px' : { xs: '16px', sm: '20px' },
                                            borderBottomRightRadius: isOwnMessage && showAvatar ? '6px' : { xs: '16px', sm: '20px' },
                                            wordBreak: 'break-word',
                                            boxShadow: isOwnMessage
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.1)',
                                            border: isOwnMessage ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            '&::before': isOwnMessage ? {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                                                borderRadius: 'inherit',
                                                pointerEvents: 'none'
                                            } : {}
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontStyle: message.isRecalled || message.isDeletedForUser ? 'italic' : 'normal', color: message.isRecalled || message.isDeletedForUser ? 'text.secondary' : 'inherit' }}>
                                            {message.isRecalled ? 'Tin nhắn đã được thu hồi' : message.isDeletedForUser ? 'Tin nhắn đã bị xóa' : message.content}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                mt: 0.5,
                                                opacity: 0.7,
                                                textAlign: 'right'
                                            }}
                                        >
                                            {formatMessageTime(message.createdAt)}
                                        </Typography>
                                        {isOwnMessage && (hoveredMessageId === message._id || Boolean(anchorEl)) && (
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    color: 'white',
                                                    opacity: 0.7,
                                                    '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' }
                                                }}
                                                onClick={(event) => handleMenuOpen(event, message)}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Paper>
                                </Box>
                            );
                        })}

                        {/* Typing Indicator */}
                        <TypingIndicator
                            conversationId={conversation._id}
                            currentUserId={currentUser._id}
                        />

                        <div ref={messagesEndRef} />
                    </Box>
                )}
            </Box>

            {/* Message Input - At bottom of flex container */}
            <Box
                className="message-input-container"
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    flexShrink: 0,
                    width: '100%',
                    maxWidth: '100%',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: { xs: 1, sm: 2 },
                    width: '100%',
                    maxWidth: '100%'
                }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="💬 Nhập tin nhắn..."
                        value={messageText}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyPress}
                        disabled={sending}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: '20px', sm: '25px' },
                                backgroundColor: 'white',
                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    border: '2px solid rgba(102, 126, 234, 0.4)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                                },
                                '&.Mui-focused': {
                                    border: '2px solid #667eea',
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)'
                                },
                                '& fieldset': {
                                    border: 'none'
                                }
                            },
                            '& .MuiInputBase-input': {
                                padding: { xs: '10px 16px', sm: '12px 20px' },
                                fontSize: { xs: '0.9rem', sm: '0.95rem' }
                            },
                            flex: 1,
                            minWidth: 0,
                            width: '100%',
                            maxWidth: '100%'
                        }}
                    />
                    <IconButton
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sending}
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease',
                            flexShrink: 0, // Không cho button co lại
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#e2e8f0',
                                color: '#94a3b8',
                                transform: 'none',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {sending ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                            <SendIcon />
                        )}
                    </IconButton>
                </Box>
            </Box>

            {/* Message Acceptance Dialog */}
            <MessageAcceptanceDialog
                open={showAcceptanceDialog}
                onClose={() => setShowAcceptanceDialog(false)}
                pendingMessage={pendingMessage}
                onAccept={handleAcceptMessage}
                onReject={handleRejectMessage}
            />

            {/* Conversation Settings Dialog */}
            <ConversationSettings
                open={showSettings}
                onClose={() => setShowSettings(false)}
                conversationId={conversation?._id}
                currentUserId={currentUser?._id}
            />

            {/* Message Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleRevokeMessage}>Thu hồi</MenuItem>
                <MenuItem onClick={handleDeleteMessage}>Xóa</MenuItem>
            </Menu>
        </Box>
    );
};

export default ConversationView;
