// src/components/ActivityCard.js
import React from 'react';
import { Box, Typography, Paper, Divider, Link, useTheme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const ActivityCard = ({ type, title, content, timestamp, likes, comments, link }) => {
    const theme = useTheme();

    const formattedTimestamp = new Date(timestamp).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 1px 4px rgba(0,0,0,0.05)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
                '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' ? '0px 0px 0px 1px #3A3B3C' : '0px 4px 12px rgba(0,0,0,0.08)',
                },
            }}
        >
            <Link
                href={link}
                sx={{ textDecoration: 'none', color: 'inherit' }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
                    {title || `Hoạt động mới (${type})`}
                </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {content && content.length > 150 ? `${content.substring(0, 150)}...` : content}
                {content && content.length > 150 && (
                    <Link href={link} sx={{ ml: 0.5, color: theme.palette.primary.main }}>
                        Xem thêm
                    </Link>
                )}
            </Typography>

            <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">{formattedTimestamp}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {likes !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">{likes}</Typography>
                        </Box>
                    )}
                    {comments !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">{comments}</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default ActivityCard;