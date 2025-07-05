import React, { useState, useContext } from 'react';
import {
    Box, IconButton, Tooltip, Popover, Button, Typography, Chip, Avatar, Stack
} from '@mui/material';
import {
    ThumbUp as LikeIcon,
    Favorite as HeartIcon,
    EmojiEmotions as LaughIcon,
    LocalFireDepartment as FireIcon,
    ThumbDown as DislikeIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';

// Reaction types with emojis and colors
const REACTION_TYPES = {
    like: { emoji: '👍', icon: LikeIcon, color: '#1976d2', label: 'Thích' },
    love: { emoji: '❤️', icon: HeartIcon, color: '#e91e63', label: 'Yêu thích' },
    laugh: { emoji: '😂', icon: LaughIcon, color: '#ff9800', label: 'Haha' },
    fire: { emoji: '🔥', icon: FireIcon, color: '#f44336', label: 'Tuyệt vời' },
    dislike: { emoji: '👎', icon: DislikeIcon, color: '#757575', label: 'Không thích' }
};

const CommentReactions = ({ 
    commentId, 
    reactions = {}, 
    userReaction = null, 
    onReact, 
    disabled = false,
    showCount = true,
    size = 'medium'
}) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [hoveredReaction, setHoveredReaction] = useState(null);

    // Calculate total reactions
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    // Get top reactions (max 3)
    const topReactions = Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    // Handle reaction click
    const handleReaction = (reactionType) => {
        if (onReact) {
            onReact(commentId, reactionType);
        }
        setAnchorEl(null);
    };

    // Handle quick reaction (like button)
    const handleQuickReaction = () => {
        if (userReaction === 'like') {
            // Remove reaction if already liked
            handleReaction(null);
        } else {
            // Add like reaction
            handleReaction('like');
        }
    };

    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const buttonSize = size === 'small' ? 'small' : 'medium';

    return (
        <Box display="flex" alignItems="center" gap={0.5}>
            {/* Quick like button */}
            <Tooltip title={userReaction === 'like' ? 'Bỏ thích' : 'Thích'}>
                <IconButton
                    size={buttonSize}
                    onClick={handleQuickReaction}
                    disabled={disabled}
                    sx={{
                        color: userReaction === 'like' 
                            ? REACTION_TYPES.like.color 
                            : (darkMode ? '#90caf9' : 'primary.main'),
                        '&:hover': {
                            backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                            color: REACTION_TYPES.like.color,
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <LikeIcon sx={{ fontSize: iconSize }} />
                </IconButton>
            </Tooltip>

            {/* Reaction count */}
            {showCount && totalReactions > 0 && (
                <Typography 
                    variant={size === 'small' ? 'caption' : 'body2'} 
                    sx={{ 
                        color: darkMode ? '#b0b3b8' : 'text.secondary',
                        minWidth: 'auto',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    {totalReactions}
                </Typography>
            )}

            {/* Top reaction emojis */}
            {topReactions.length > 0 && (
                <Box display="flex" alignItems="center" gap={0.25}>
                    {topReactions.map(([reactionType, count]) => (
                        <Tooltip 
                            key={reactionType} 
                            title={`${count} ${REACTION_TYPES[reactionType]?.label || reactionType}`}
                        >
                            <span 
                                style={{ 
                                    fontSize: size === 'small' ? '12px' : '14px',
                                    cursor: 'pointer',
                                    opacity: userReaction === reactionType ? 1 : 0.7,
                                    transform: userReaction === reactionType ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => handleReaction(reactionType)}
                            >
                                {REACTION_TYPES[reactionType]?.emoji || '👍'}
                            </span>
                        </Tooltip>
                    ))}
                </Box>
            )}

            {/* Add reaction button */}
            <Tooltip title="Thêm reaction">
                <IconButton
                    size={buttonSize}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={disabled}
                    sx={{
                        color: darkMode ? '#90caf9' : 'primary.main',
                        '&:hover': {
                            backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                        }
                    }}
                >
                    <AddIcon sx={{ fontSize: iconSize }} />
                </IconButton>
            </Tooltip>

            {/* Reaction picker popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                        border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                        borderRadius: 2,
                        boxShadow: darkMode 
                            ? '0px 4px 20px rgba(0,0,0,0.5)' 
                            : '0px 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <Box sx={{ p: 1 }}>
                    {/* Reaction details */}
                    {totalReactions > 0 && (
                        <Box sx={{ mb: 2, p: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? '#fff' : '#000' }}>
                                Reactions ({totalReactions})
                            </Typography>
                            <Stack spacing={0.5}>
                                {Object.entries(reactions)
                                    .filter(([_, count]) => count > 0)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([reactionType, count]) => (
                                        <Box key={reactionType} display="flex" alignItems="center" gap={1}>
                                            <span style={{ fontSize: '16px' }}>
                                                {REACTION_TYPES[reactionType]?.emoji || '👍'}
                                            </span>
                                            <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                                {REACTION_TYPES[reactionType]?.label || reactionType}: {count}
                                            </Typography>
                                        </Box>
                                    ))
                                }
                            </Stack>
                        </Box>
                    )}

                    {/* Reaction buttons */}
                    <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? '#fff' : '#000' }}>
                        Chọn reaction:
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                        {Object.entries(REACTION_TYPES).map(([reactionType, config]) => (
                            <Tooltip key={reactionType} title={config.label}>
                                <Button
                                    variant={userReaction === reactionType ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => handleReaction(reactionType)}
                                    onMouseEnter={() => setHoveredReaction(reactionType)}
                                    onMouseLeave={() => setHoveredReaction(null)}
                                    sx={{
                                        minWidth: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        fontSize: '18px',
                                        backgroundColor: userReaction === reactionType 
                                            ? config.color 
                                            : (hoveredReaction === reactionType 
                                                ? (darkMode ? '#3a3a3a' : '#f5f5f5')
                                                : 'transparent'),
                                        borderColor: userReaction === reactionType 
                                            ? config.color 
                                            : (darkMode ? '#555' : '#ddd'),
                                        color: userReaction === reactionType 
                                            ? '#fff' 
                                            : (darkMode ? '#fff' : '#000'),
                                        '&:hover': {
                                            backgroundColor: userReaction === reactionType 
                                                ? config.color 
                                                : (darkMode ? '#3a3a3a' : '#f5f5f5'),
                                            borderColor: config.color,
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {config.emoji}
                                </Button>
                            </Tooltip>
                        ))}
                    </Box>

                    {/* Remove reaction button */}
                    {userReaction && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${darkMode ? '#555' : '#ddd'}` }}>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => handleReaction(null)}
                                sx={{ 
                                    color: darkMode ? '#b0b3b8' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5'
                                    }
                                }}
                            >
                                Xóa reaction
                            </Button>
                        </Box>
                    )}
                </Box>
            </Popover>
        </Box>
    );
};

export default CommentReactions;
