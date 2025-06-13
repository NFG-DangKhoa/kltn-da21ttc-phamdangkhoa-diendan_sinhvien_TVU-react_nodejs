import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useChat } from '../../context/ChatContext';

const TypingIndicator = ({ conversationId, currentUserId }) => {
    const { getTypingUsers } = useChat();
    const typingUserIds = getTypingUsers(conversationId);
    
    // Lọc bỏ current user
    const otherTypingUsers = typingUserIds.filter(userId => userId !== currentUserId);
    
    if (otherTypingUsers.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 2,
                mb: 1,
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                }
            }}
        >
            {/* Typing animation dots */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 0.5,
                    alignItems: 'center'
                }}
            >
                {[0, 1, 2].map((index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#667eea',
                            animation: 'typing 1.4s infinite',
                            animationDelay: `${index * 0.2}s`,
                            '@keyframes typing': {
                                '0%, 60%, 100%': {
                                    transform: 'translateY(0)',
                                    opacity: 0.4
                                },
                                '30%': {
                                    transform: 'translateY(-8px)',
                                    opacity: 1
                                }
                            }
                        }}
                    />
                ))}
            </Box>

            <Typography 
                variant="caption" 
                sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic'
                }}
            >
                {otherTypingUsers.length === 1 
                    ? 'Đang soạn tin nhắn...'
                    : `${otherTypingUsers.length} người đang soạn tin nhắn...`
                }
            </Typography>
        </Box>
    );
};

export default TypingIndicator;
