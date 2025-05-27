import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Comment, CalendarToday, Whatshot } from '@mui/icons-material';

const TopicCard = ({ topic, darkMode }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/topic/${topic._id}`);
    };

    return (
        <Card
            sx={{
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                color: darkMode ? '#e0e0e0' : '#1c1e21',
                borderRadius: '12px',
                boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.5)' : '0px 4px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: darkMode ? '0px 6px 15px rgba(0,0,0,0.7)' : '0px 6px 15px rgba(0,0,0,0.15)',
                },
                '&:active': {
                    transform: 'translateY(-2px)',
                    boxShadow: darkMode ? '0px 2px 5px rgba(0,0,0,0.3)' : '0px 2px 5px rgba(0,0,0,0.05)',
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
                            color: darkMode ? '#90caf9' : 'primary.main',
                            fontFamily: 'Inter, sans-serif',
                            // Giới hạn 1 dòng cho tiêu đề chủ đề (nếu cần)
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {topic.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={darkMode ? '#bdbdbd' : 'text.secondary'}
                        sx={{
                            mb: 2,
                            fontFamily: 'Inter, sans-serif',
                            // Giới hạn 2 dòng cho mô tả
                            display: '-webkit-box',
                            WebkitLineClamp: 2, // Giới hạn 2 dòng
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {topic.description || 'Không có mô tả.'}
                    </Typography>

                    <Box display="flex" alignItems="center" mb={1}>
                        <Comment fontSize="small" sx={{ mr: 0.5, color: darkMode ? '#bbdefb' : 'text.secondary' }} />
                        <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'} sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {topic.postCount ?? 0} bài viết
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            {topic.latestPost && (
                <CardContent sx={{ pt: 0, mx: 2, pb: '16px !important' }}>
                    <Divider sx={{ my: 1.5, borderColor: darkMode ? '#2c2c2c' : '#e0e0e0' }} />
                    <Box display="flex" alignItems="center" mb={0.5}>
                        <Whatshot fontSize="small" sx={{ mr: 0.5, color: darkMode ? '#ffc107' : '#f57c00' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: darkMode ? '#ffffff' : 'text.primary', fontFamily: 'Inter, sans-serif' }}>
                            Bài mới nhất:
                        </Typography>
                    </Box>
                    <Link
                        href={`/topic/${topic._id}?postId=${topic.latestPost._id}`}
                        sx={{
                            textDecoration: 'none',
                            color: darkMode ? '#90caf9' : 'primary.main',
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
                                // Giới hạn 1 dòng cho tiêu đề bài viết mới nhất
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {topic.latestPost.title}
                        </Typography>
                    </Link>
                    <Typography variant="caption" color={darkMode ? '#bdbdbd' : 'text.secondary'} sx={{ ml: 2, display: 'block', fontFamily: 'Inter, sans-serif' }}>
                        bởi {topic.latestPost.author}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5} ml={2}>
                        <CalendarToday fontSize="small" sx={{ mr: 0.5, color: darkMode ? '#bdbdbd' : 'text.secondary' }} />
                        <Typography variant="caption" color={darkMode ? '#bdbdbd' : 'text.secondary'} sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {new Date(topic.latestPost.date).toLocaleDateString('vi-VN')}
                        </Typography>
                    </Box>
                </CardContent>
            )}
        </Card>
    );
};

export default TopicCard;