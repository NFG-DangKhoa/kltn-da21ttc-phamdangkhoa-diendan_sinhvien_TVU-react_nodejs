import React, { useState } from 'react';
import {
    Fab,
    Badge,
    Tooltip,
    useTheme,
    useMediaQuery,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatButton = () => {
    const [showError, setShowError] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Don't show chat button - disabled as requested by user
    return null;

    const handleClick = () => {
        try {
            // Navigate to chat page instead of opening popup
            navigate('/chat');
        } catch (error) {
            console.error('Error opening chat:', error);
            setShowError(true);
        }
    };

    return (
        <>
            {/* Chat Button */}
            <Tooltip title="Tin nhắn" placement="left">
                <Fab
                    color="primary"
                    onClick={handleClick}
                    sx={{
                        position: 'fixed',
                        bottom: isMobile ? 16 : 24,
                        right: isMobile ? 16 : 24,
                        zIndex: 1000,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                            transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                    }}
                >
                    <Badge
                        badgeContent={0}
                        color="error"
                        max={99}
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.75rem',
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '10px',
                                border: '2px solid white',
                                background: 'linear-gradient(45deg, #f44336 30%, #ff6b6b 90%)',
                            }
                        }}
                    >
                        <ChatIcon />
                    </Badge>
                </Fab>
            </Tooltip>

            {/* Error Snackbar */}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
            >
                <Alert onClose={() => setShowError(false)} severity="error">
                    Không thể mở chat. Vui lòng thử lại!
                </Alert>
            </Snackbar>
        </>
    );
};

export default ChatButton;
