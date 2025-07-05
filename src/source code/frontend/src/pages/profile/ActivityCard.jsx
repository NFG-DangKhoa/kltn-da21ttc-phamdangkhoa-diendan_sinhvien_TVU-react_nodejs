// src/components/ActivityCard.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, Link, useTheme, Tooltip, IconButton, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CommentIcon from '@mui/icons-material/Comment';
import { Topic as TopicIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ActivityCard = ({ type, title, content, timestamp, likes, comments, link, status, topic }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTitleClick = (e) => {
        e.preventDefault();
        navigate(link);
    };

    const toggleExpanded = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const plainTextContent = stripHtml(content);
    const isLongContent = plainTextContent.length > 200;

    const getTypeInfo = () => {
        switch (type) {
            case 'post':
                return {
                    icon: <PostAddIcon />,
                    color: status === 'published' ? 'primary' : 'warning',
                    label: status === 'published' ? 'Đã đăng' : 'Chưa xuất bản'
                };
            case 'comment':
                return {
                    icon: <ChatBubbleOutlineIcon />,
                    color: 'info',
                    label: 'Bình luận'
                };
            case 'like':
                return {
                    icon: <FavoriteIcon />,
                    color: 'error',
                    label: 'Lượt thích'
                };
            default:
                return {
                    icon: <PostAddIcon />,
                    color: 'default',
                    label: 'Hoạt động'
                };
        }
    };

    const { icon, color, label } = getTypeInfo();

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
            }
        }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            icon={icon}
                            label={label}
                            color={color}
                            size="small"
                        />
                        {topic && (
                            <Tooltip title="Chủ đề">
                                <Chip
                                    icon={<TopicIcon />}
                                    label={topic.name || 'Chủ đề'}
                                    size="small"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {format(new Date(timestamp), "d MMMM, yyyy 'lúc' HH:mm", { locale: vi })}
                    </Typography>
                </Box>

                <Link
                    component="button"
                    variant="h6"
                    onClick={handleTitleClick}
                    sx={{
                        color: theme.palette.text.primary,
                        textDecoration: 'none',
                        mb: 1,
                        display: 'block',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                            color: theme.palette.primary.main,
                            textDecoration: 'underline',
                        }
                    }}
                >
                    {title}
                </Link>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'none' : 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                    component="div"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                {isLongContent && (
                    <Button onClick={toggleExpanded} size="small" sx={{ alignSelf: 'flex-start', mt: -1 }}>
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </Button>
                )}
            </CardContent>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 'auto',
                px: 2,
                pb: 2
            }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {typeof likes === 'number' && (
                        <Chip
                            icon={<ThumbUpIcon fontSize="small" />}
                            label={likes}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    {typeof comments === 'number' && (
                        <Chip
                            icon={<ChatBubbleOutlineIcon fontSize="small" />}
                            label={comments}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
                <IconButton
                    onClick={handleTitleClick}
                    size="small"
                    color="primary"
                    sx={{
                        opacity: 0.7,
                        '&:hover': {
                            opacity: 1
                        }
                    }}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Box>
        </Card>
    );
};

export default ActivityCard;