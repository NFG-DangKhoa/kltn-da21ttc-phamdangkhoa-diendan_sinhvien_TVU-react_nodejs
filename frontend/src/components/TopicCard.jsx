// TopicCard.jsx
import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box, Link, Divider, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Comment, CalendarToday, Whatshot } from '@mui/icons-material';

// Thêm 'variant' vào destructuring props
const TopicCard = ({ topic, isDarkMode, variant }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleCardClick = () => {
        navigate(`/topic/${topic._id}`);
    };

    // Bạn có thể destructure các thuộc tính của topic nếu muốn
    // const { _id, name, description, postCount, latestPost } = topic;

    // Các variant khác nhau
    const isVertical = variant === 'vertical';
    const isCompact = variant === 'compact';
    const isHorizontal = variant === 'horizontal';

    return (
        <Card
            sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: isCompact ? '8px' : '12px',
                boxShadow: isDarkMode ? '0px 4px 10px rgba(0,0,0,0.5)' : '0px 4px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: isCompact ? 'translateY(-3px)' : 'translateY(-5px)',
                    boxShadow: isDarkMode ? '0px 6px 15px rgba(0,0,0,0.7)' : '0px 6px 15px rgba(0,0,0,0.15)',
                },
                '&:active': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode ? '0px 2px 5px rgba(0,0,0,0.3)' : '0px 2px 5px rgba(0,0,0,0.05)',
                },
                height: '100%',
                display: 'flex',
                flexDirection: isHorizontal ? 'row' : 'column',
                justifyContent: 'space-between',
            }}
        >
            <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
                <CardContent sx={{ p: isCompact ? 2 : 3 }}>
                    <Typography
                        gutterBottom
                        variant={isCompact ? "subtitle1" : "h6"}
                        component="div"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {topic.name}
                    </Typography>

                    {!isCompact && (
                        <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                            sx={{
                                mb: 2,
                                fontFamily: 'Inter, sans-serif',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {topic.description || 'Không có mô tả.'}
                        </Typography>
                    )}

                    <Box display="flex" alignItems="center" mb={isCompact ? 0 : 1}>
                        <Comment
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                color: theme.palette.info.light,
                            }}
                        />
                        <Typography
                            variant={isCompact ? "caption" : "body2"}
                            color={theme.palette.text.secondary}
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {topic.postCount ?? 0} bài viết
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            {topic.latestPost && !isCompact && (
                <CardContent sx={{ pt: 0, mx: 2, pb: '16px !important' }}>
                    <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />
                    <Box display="flex" alignItems="center" mb={0.5}>
                        <Whatshot
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                color: theme.palette.warning.main,
                            }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                fontFamily: 'Inter, sans-serif',
                            }}
                        >
                            Bài mới nhất:
                        </Typography>
                    </Box>
                    <Link
                        href={`/topic/${topic._id}?postId=${topic.latestPost._id}`}
                        sx={{
                            textDecoration: 'none',
                            color: theme.palette.primary.main,
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                            display: 'block',
                            ml: 2,
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {topic.latestPost.title}
                        </Typography>
                    </Link>
                    <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}
                        sx={{ ml: 2, display: 'block', fontFamily: 'Inter, sans-serif' }}
                    >
                        bởi {topic.latestPost.author}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5} ml={2}>
                        <CalendarToday
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                color: theme.palette.text.secondary,
                            }}
                        />
                        <Typography
                            variant="caption"
                            color={theme.palette.text.secondary}
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {new Date(topic.latestPost.date).toLocaleDateString('vi-VN')}
                        </Typography>
                    </Box>
                </CardContent>
            )}
        </Card>
    );
};

export default TopicCard;