import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box, Link, Divider, useTheme } from '@mui/material'; // Import useTheme
import { useNavigate } from 'react-router-dom';
import { Comment, CalendarToday, Whatshot } from '@mui/icons-material';

// Đổi tên prop 'darkMode' thành 'isDarkMode' để nhất quán
const TopicCard = ({ topic, isDarkMode }) => {
    const navigate = useNavigate();
    const theme = useTheme(); // Lấy theme object hiện tại

    const handleCardClick = () => {
        navigate(`/topic/${topic._id}`);
    };

    return (
        <Card
            sx={{
                // Sử dụng theme.palette.background.paper cho nền Card
                backgroundColor: theme.palette.background.paper,
                // Sử dụng theme.palette.text.primary cho màu chữ mặc định của Card
                color: theme.palette.text.primary,
                borderRadius: '12px',
                // Box shadow tùy chỉnh theo isDarkMode
                boxShadow: isDarkMode ? '0px 4px 10px rgba(0,0,0,0.5)' : '0px 4px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: isDarkMode ? '0px 6px 15px rgba(0,0,0,0.7)' : '0px 6px 15px rgba(0,0,0,0.15)',
                },
                '&:active': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode ? '0px 2px 5px rgba(0,0,0,0.3)' : '0px 2px 5px rgba(0,0,0,0.05)',
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
                <CardContent>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            // Sử dụng theme.palette.primary.main cho tiêu đề chủ đề
                            color: theme.palette.primary.main,
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {topic.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        // Sử dụng theme.palette.text.secondary cho mô tả
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

                    <Box display="flex" alignItems="center" mb={1}>
                        <Comment
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                // Sử dụng theme.palette.info.light cho icon Comment
                                color: theme.palette.info.light,
                            }}
                        />
                        <Typography
                            variant="body2"
                            // Sử dụng theme.palette.text.secondary cho số lượng bài viết
                            color={theme.palette.text.secondary}
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {topic.postCount ?? 0} bài viết
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            {topic.latestPost && (
                <CardContent sx={{ pt: 0, mx: 2, pb: '16px !important' }}>
                    {/* Sử dụng theme.palette.divider cho đường phân cách */}
                    <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />
                    <Box display="flex" alignItems="center" mb={0.5}>
                        <Whatshot
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                // Sử dụng theme.palette.warning.main cho icon Whatshot
                                color: theme.palette.warning.main,
                            }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                // Sử dụng theme.palette.text.primary cho "Bài mới nhất:"
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
                            // Sử dụng theme.palette.primary.main cho màu link
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
                        // Sử dụng theme.palette.text.secondary cho thông tin tác giả và ngày đăng
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
                                // Sử dụng theme.palette.text.secondary cho icon Calendar
                                color: theme.palette.text.secondary,
                            }}
                        />
                        <Typography
                            variant="caption"
                            // Sử dụng theme.palette.text.secondary cho ngày đăng
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