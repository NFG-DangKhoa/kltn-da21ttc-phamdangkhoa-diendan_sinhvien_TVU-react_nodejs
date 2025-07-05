import React, { useState, useEffect } from 'react';
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Divider,
    Slide,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Close as CloseIcon,
    Minimize as MinimizeIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ChatSettings from './ChatSettings';

const ChatWindow = ({ open, onClose, isMobile }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'messages' | 'users'
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { currentConversation, setCurrentConversation } = useChat();
    const theme = useTheme();

    // Reset state when window opens/closes
    useEffect(() => {
        if (open) {
            setIsMinimized(false);
            if (isMobile) {
                setIsFullscreen(true);
            }
        }
    }, [open, isMobile]);

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleBackToConversations = () => {
        setCurrentConversation(null);
        setActiveTab('conversations');
    };

    const windowStyle = {
        position: 'fixed',
        bottom: isMobile ? 0 : 24,
        right: isMobile ? 0 : 24,
        width: isFullscreen ? '100vw' : isMobile ? '100vw' : 400,
        height: isFullscreen ? '100vh' : isMinimized ? 60 : isMobile ? '100vh' : 600,
        zIndex: 1000,
        borderRadius: isFullscreen || isMobile ? 0 : '12px 12px 0 0',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    const contentStyle = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
    };

    // Mobile full-screen dialog
    if (isMobile) {
        return (
            <Dialog
                fullScreen
                open={open}
                onClose={onClose}
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' }}
            >
                <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {currentConversation ? 'Tin nhắn' : 'Chat'}
                        </Typography>
                        <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                        <IconButton color="inherit" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {currentConversation ? (
                        <ChatContent
                            conversation={currentConversation}
                            onBack={handleBackToConversations}
                            isMobile={true}
                        />
                    ) : (
                        <ConversationList
                            onSelectConversation={setCurrentConversation}
                            isMobile={true}
                        />
                    )}
                </Box>

                {/* Chat Settings Dialog */}
                <ChatSettings
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                />
            </Dialog>
        );
    }

    // Desktop window
    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Paper sx={windowStyle} elevation={8}>
                <Box sx={contentStyle}>
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: 48,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            {currentConversation ? 'Tin nhắn' : 'Chat'}
                        </Typography>

                        <Box>
                            <IconButton
                                size="small"
                                onClick={() => setSettingsOpen(true)}
                                sx={{ color: 'white', mr: 0.5 }}
                            >
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleMinimize}
                                sx={{ color: 'white', mr: 0.5 }}
                            >
                                <MinimizeIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleFullscreen}
                                sx={{ color: 'white', mr: 0.5 }}
                            >
                                {isFullscreen ?
                                    <FullscreenExitIcon fontSize="small" /> :
                                    <FullscreenIcon fontSize="small" />
                                }
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={onClose}
                                sx={{ color: 'white' }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Content */}
                    {!isMinimized && (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {currentConversation ? (
                                <ChatContent
                                    conversation={currentConversation}
                                    onBack={handleBackToConversations}
                                    isFullscreen={isFullscreen}
                                />
                            ) : (
                                <ConversationList
                                    onSelectConversation={setCurrentConversation}
                                    isFullscreen={isFullscreen}
                                />
                            )}
                        </Box>
                    )}
                </Box>

                {/* Chat Settings Dialog */}
                <ChatSettings
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                />
            </Paper>
        </Slide>
    );
};

// Chat content component
const ChatContent = ({ conversation, onBack, isMobile = false, isFullscreen = false }) => {
    const { messages, loadMessages } = useChat();

    useEffect(() => {
        if (conversation) {
            loadMessages(conversation._id);
        }
    }, [conversation, loadMessages]);

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Conversation Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    background: theme => theme.palette.grey[50],
                }}
            >
                <IconButton onClick={onBack} sx={{ mr: 1 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {conversation.participantDetails?.find(p => p._id !== conversation.currentUserId)?.fullName || 'Người dùng'}
                </Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1 }}>
                <MessageList
                    messages={messages}
                    conversation={conversation}
                />
            </Box>

            {/* Message Input */}
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                <MessageInput conversation={conversation} />
            </Box>
        </Box>
    );
};

export default ChatWindow;
