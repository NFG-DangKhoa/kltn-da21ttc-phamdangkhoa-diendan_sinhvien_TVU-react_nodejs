import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    useTheme,
    useMediaQuery,
    Breadcrumbs,
    Link,
    Divider,
    IconButton,
    Tabs,
    Tab,
    CircularProgress,
    GlobalStyles
} from '@mui/material';
import {
    Home as HomeIcon,
    Chat as ChatIcon,
    ArrowBack as ArrowBackIcon,
    People as PeopleIcon,
    Message as MessageIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import SimpleConversationList from '../components/Chat/SimpleConversationList';
import ConversationView from '../components/Chat/ConversationView';
import UserList from '../components/Chat/UserList';
import ChatSettings from '../components/Chat/ChatSettings';
import '../styles/chat.css';

const ChatPage = () => {
    const [activeTab, setActiveTab] = useState(0); // 0: conversations, 1: users
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { user, loadingAuth } = useAuth();
    const {
        conversations,
        messages,
        loadConversations,
        loadMessages,
        sendMessage,
        addMessage,
        loading,
        error,
        socket,
        isConnected,
        markConversationAsRead,
        updateConversations,
        setCurrentConversation
    } = useChat();

    // Check if user is authenticated (chờ AuthContext load xong)
    useEffect(() => {
        // Chỉ check khi AuthContext đã load xong
        if (loadingAuth) return;

        if (!user || !user._id) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }
        console.log('User authenticated:', user);
    }, [user, navigate, loadingAuth]);

    // Load conversations on mount
    useEffect(() => {
        if (user && user._id) {
            loadConversations();
        }
    }, [user]); // Removed loadConversations from dependencies to prevent infinite loop

    // Auto-reload conversations when new messages arrive
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = () => {
            console.log('🔄 ChatPage: New message received, reloading conversations');
            // Reload conversations to update last message and order
            setTimeout(() => {
                loadConversations();
            }, 500); // Small delay to ensure message is saved to DB
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, user, loadConversations]);

    // Load conversation from URL params
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find(c => c._id === conversationId);
            if (conversation) {
                setSelectedConversation(conversation);
                loadMessages(conversationId, conversation);
            }
        }
    }, [searchParams, conversations]); // Removed loadMessages to prevent infinite loop

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);

        // Set current conversation in context for unread count logic
        setCurrentConversation(conversation);

        // Mark all messages in this conversation as read immediately (optimistic update)
        // Update conversation unread count to 0 in UI first for instant feedback
        const updatedConversations = conversations.map(conv =>
            conv._id === conversation._id
                ? { ...conv, unreadCount: 0 }
                : conv
        );
        updateConversations(updatedConversations);

        loadMessages(conversation._id, conversation);

        // Mark all messages in this conversation as read on server
        try {
            await markConversationAsRead(conversation._id);
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            // Optionally revert the optimistic update on error
            // For now, we'll keep the optimistic update even on error
        }

        if (isMobile) {
            // On mobile, we'll show the conversation in full screen
        }
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setCurrentConversation(null); // Clear current conversation in context
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle sending message for both mock and real conversations
    const handleSendMessage = async (messageOrContent) => {
        console.log('ChatPage: handleSendMessage called');
        console.log('ChatPage: selectedConversation:', selectedConversation);
        console.log('ChatPage: messageOrContent:', messageOrContent);

        if (!selectedConversation) {
            console.log('ChatPage: No selected conversation');
            return;
        }

        if (selectedConversation.isMock) {
            console.log('ChatPage: Handling mock conversation message');
            // For mock conversation, messageOrContent is the message object
            addMessage(messageOrContent);
        } else {
            console.log('ChatPage: Handling real conversation message');
            // For real conversation, messageOrContent is the content string
            const otherParticipant = selectedConversation.participantDetails?.find(p => p._id !== user._id) ||
                selectedConversation.participants?.find(p => {
                    const participantId = typeof p === 'object' ? p._id : p;
                    return participantId !== user._id;
                });

            console.log('ChatPage: Other participant:', otherParticipant);

            if (otherParticipant) {
                const receiverId = typeof otherParticipant === 'object' ? otherParticipant._id : otherParticipant;
                console.log('ChatPage: Sending message to:', receiverId);
                await sendMessage(receiverId, messageOrContent);
            } else {
                console.log('ChatPage: No other participant found');
            }
        }
    };

    // Show loading khi AuthContext đang load
    if (loadingAuth) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Đang tải...</Typography>
                </Box>
            </Container>
        );
    }

    if (!user || !user._id) {
        console.log('ChatPage: User not found, showing loading');
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    console.log('ChatPage: Rendering chat interface');
    console.log('ChatPage: activeTab =', activeTab);
    console.log('ChatPage: conversations =', conversations);

    return (
        <>
            <GlobalStyles
                styles={{
                    '@keyframes pulse': {
                        '0%': {
                            opacity: 1
                        },
                        '50%': {
                            opacity: 0.5
                        },
                        '100%': {
                            opacity: 1
                        }
                    }
                }}
            />
            <Container maxWidth={false} sx={{
                py: 3,
                px: { xs: 2, sm: 3, md: 4 },
                maxWidth: '100%',
                width: '100%',
                mx: 'auto',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
                position: 'relative'
            }}>
                {/* Subtle background pattern */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                    `,
                    zIndex: 0
                }} />

                {/* Content wrapper */}
                <Box sx={{ position: 'relative', zIndex: 1, mt: 8 }}>
                    {/* Breadcrumbs */}
                    <Breadcrumbs sx={{
                        mb: 3,
                        '& .MuiBreadcrumbs-separator': { color: 'rgba(71, 85, 105, 0.6)' },
                        '& a, & p': { color: 'rgba(71, 85, 105, 0.8)' }
                    }}>
                        <Link
                            color="inherit"
                            href="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                '&:hover': { color: '#3b82f6' }
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Trang chủ
                        </Link>
                        <Typography sx={{ display: 'flex', alignItems: 'center', color: '#475569', fontWeight: 500 }}>
                            <ChatIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Tin nhắn
                        </Typography>
                    </Breadcrumbs>

                    {/* Page Title */}
                    <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
                        {/* Settings and Connection Status */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            {/* Connection Status */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                                    animation: isConnected ? 'pulse 2s infinite' : 'none'
                                }} />
                                <Typography variant="caption" sx={{
                                    color: isConnected ? '#16a34a' : '#dc2626',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}>
                                    {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                                </Typography>
                            </Box>

                            {/* Settings Button */}
                            <IconButton
                                onClick={() => setSettingsOpen(true)}
                                sx={{
                                    color: '#64748b',
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        color: '#3b82f6',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Box>

                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                color: '#1e293b',
                                mb: 1,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            💬 Tin nhắn
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#64748b',
                                fontWeight: 400
                            }}
                        >
                            Trò chuyện với các thành viên và quản trị viên
                        </Typography>
                    </Box>
                </Box>

                {/* Chat Interface */}
                <Paper
                    elevation={0}
                    sx={{
                        height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 180px)',
                        minHeight: isMobile ? '600px' : '750px',
                        display: 'flex',
                        overflow: 'hidden',
                        borderRadius: 3,
                        background: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    {isMobile ? (
                        // Mobile Layout - Single Column
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            {selectedConversation ? (
                                // Show conversation
                                <ConversationView
                                    conversation={selectedConversation}
                                    messages={messages}
                                    onBack={handleBackToList}
                                    onSendMessage={handleSendMessage}
                                    currentUser={user}
                                    isMobile={true}
                                />
                            ) : (
                                // Show list view
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Tab Bar */}
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                                    >
                                        <Tab
                                            icon={<MessageIcon />}
                                            label="Cuộc trò chuyện"
                                            sx={{ minHeight: 48 }}
                                        />
                                        <Tab
                                            icon={<PeopleIcon />}
                                            label="Tìm người dùng"
                                            sx={{ minHeight: 48 }}
                                        />
                                    </Tabs>

                                    {/* Tab Content */}
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        {activeTab === 0 ? (
                                            <SimpleConversationList
                                                conversations={conversations}
                                                onSelectConversation={handleSelectConversation}
                                                loading={loading}
                                                currentUser={user}
                                            />
                                        ) : (
                                            <UserList
                                                onStartChat={handleSelectConversation}
                                                isMobile={true}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        // Desktop Layout - Two Columns
                        <Box sx={{ height: '100%', display: 'flex' }}>
                            {/* Left Sidebar - Fixed width */}
                            <Box
                                sx={{
                                    width: '400px',
                                    borderRight: '1px solid #e2e8f0',
                                    flexShrink: 0,
                                    minWidth: '400px',
                                    background: '#f8fafc',
                                    position: 'relative'
                                }}
                            >
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Tab Headers */}
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        sx={{
                                            borderBottom: '1px solid #e2e8f0',
                                            background: '#ffffff',
                                            '& .MuiTabs-indicator': {
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                                height: 2,
                                                borderRadius: '2px 2px 0 0'
                                            }
                                        }}
                                    >
                                        <Tab
                                            icon={<MessageIcon />}
                                            label="Cuộc trò chuyện"
                                            sx={{
                                                minHeight: 56,
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                color: '#64748b',
                                                '&.Mui-selected': {
                                                    color: '#3b82f6',
                                                    fontWeight: 600
                                                },
                                                '&:hover': {
                                                    color: '#3b82f6',
                                                    background: 'rgba(59, 130, 246, 0.05)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                        <Tab
                                            icon={<PeopleIcon />}
                                            label="Tìm người dùng"
                                            sx={{
                                                minHeight: 56,
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                color: '#64748b',
                                                '&.Mui-selected': {
                                                    color: '#3b82f6',
                                                    fontWeight: 600
                                                },
                                                '&:hover': {
                                                    color: '#3b82f6',
                                                    background: 'rgba(59, 130, 246, 0.05)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    </Tabs>

                                    {/* Tab Content */}
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        {activeTab === 0 ? (
                                            <SimpleConversationList
                                                conversations={conversations}
                                                onSelectConversation={handleSelectConversation}
                                                selectedConversation={selectedConversation}
                                                loading={loading}
                                                currentUser={user}
                                            />
                                        ) : (
                                            <UserList
                                                onStartChat={handleSelectConversation}
                                                isMobile={false}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Right Content - Messages */}
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: '500px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#ffffff',
                                    position: 'relative'
                                }}
                            >
                                {selectedConversation ? (
                                    <ConversationView
                                        conversation={selectedConversation}
                                        messages={messages}
                                        onSendMessage={handleSendMessage}
                                        currentUser={user}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: 'text.secondary',
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                                            position: 'relative',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '300px',
                                                height: '300px',
                                                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                                                borderRadius: '50%',
                                                zIndex: 0
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                                                    animation: 'pulse 2s infinite'
                                                }}
                                            >
                                                <ChatIcon sx={{ fontSize: 48, color: 'white' }} />
                                            </Box>
                                            <Typography
                                                variant="h5"
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    backgroundClip: 'text',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    mb: 2
                                                }}
                                            >
                                                Chọn một cuộc trò chuyện
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'text.secondary',
                                                    maxWidth: 400,
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                Chọn cuộc trò chuyện từ danh sách bên trái hoặc tìm người dùng để bắt đầu chat mới
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Chat Settings Dialog */}
                <ChatSettings
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                />
            </Container>
        </>
    );
};

export default ChatPage;
