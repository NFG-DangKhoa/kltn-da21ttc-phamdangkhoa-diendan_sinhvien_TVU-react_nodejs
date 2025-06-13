import React from 'react';
import { Badge, Box, Tooltip, Typography } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';

const OnlineIndicator = ({ 
    userId, 
    showTooltip = true, 
    size = 'small',
    position = { vertical: 'bottom', horizontal: 'right' }
}) => {
    const { isUserOnline, getUserLastSeen } = useChat();
    const isOnline = isUserOnline(userId);
    const lastSeen = getUserLastSeen(userId);

    const getIndicatorSize = () => {
        switch (size) {
            case 'small': return 8;
            case 'medium': return 12;
            case 'large': return 16;
            default: return 8;
        }
    };

    const formatLastSeen = (lastSeenTime) => {
        if (!lastSeenTime) return 'Chưa xác định';
        
        const now = new Date();
        const lastSeenDate = new Date(lastSeenTime);
        const diffMs = now - lastSeenDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return lastSeenDate.toLocaleDateString('vi-VN');
    };

    const indicator = (
        <CircleIcon
            sx={{
                fontSize: getIndicatorSize(),
                color: isOnline ? '#4caf50' : '#9e9e9e',
                filter: isOnline ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.6))' : 'none',
                animation: isOnline ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                    '0%': {
                        opacity: 1,
                        transform: 'scale(1)',
                    },
                    '50%': {
                        opacity: 0.7,
                        transform: 'scale(1.1)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'scale(1)',
                    },
                },
            }}
        />
    );

    const tooltipContent = (
        <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {isOnline ? '🟢 Đang hoạt động' : '⚫ Không hoạt động'}
            </Typography>
            {!isOnline && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Hoạt động lần cuối: {formatLastSeen(lastSeen)}
                </Typography>
            )}
        </Box>
    );

    if (showTooltip) {
        return (
            <Tooltip 
                title={tooltipContent} 
                placement="top"
                arrow
                componentsProps={{
                    tooltip: {
                        sx: {
                            bgcolor: 'rgba(0, 0, 0, 0.9)',
                            '& .MuiTooltip-arrow': {
                                color: 'rgba(0, 0, 0, 0.9)',
                            },
                        },
                    },
                }}
            >
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    {indicator}
                </Box>
            </Tooltip>
        );
    }

    return indicator;
};

// Component để wrap với Badge
export const OnlineBadge = ({ 
    children, 
    userId, 
    showTooltip = true,
    size = 'small',
    anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
    const { isUserOnline } = useChat();
    const isOnline = isUserOnline(userId);

    return (
        <Badge
            overlap="circular"
            anchorOrigin={anchorOrigin}
            badgeContent={
                isOnline ? (
                    <OnlineIndicator 
                        userId={userId} 
                        showTooltip={showTooltip}
                        size={size}
                    />
                ) : null
            }
            sx={{
                '& .MuiBadge-badge': {
                    border: '2px solid white',
                    borderRadius: '50%',
                    padding: 0,
                    minWidth: 'auto',
                    height: 'auto',
                }
            }}
        >
            {children}
        </Badge>
    );
};

export default OnlineIndicator;
