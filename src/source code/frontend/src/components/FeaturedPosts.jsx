// File này sẽ chứa phần "Bài Viết Nổi Bật" với các Card hiển thị theo chiều ngang.
import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, useTheme } from '@mui/material';
import { Star } from '@mui/icons-material';

// Thay đổi prop 'darkMode' thành 'isDarkMode' để nhất quán với Home.js
const FeaturedPosts = ({ featuredPosts, isDarkMode }) => {
    const theme = useTheme(); // Hook này đã truy cập được theme hiện tại (light/dark)

    return (
        <Box mb={6}>
            <Typography
                variant="h5"
                mb={3}
                sx={{
                    fontWeight: 700,
                    // Sử dụng theme.palette.text.primary cho màu chữ chính
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    // Sử dụng theme.palette.divider cho đường viền
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    pb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Star sx={{ mr: 1, color: '#FFD700' }} /> Bài Viết Nổi Bật
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    gap: 3,
                    py: 2,
                    px: 1,
                    // Sử dụng theme.palette.background.paper cho nền của Box chứa các card
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    // Sử dụng theme.palette.shadows hoặc tùy chỉnh dựa trên mode
                    boxShadow: isDarkMode ? '0px 4px 15px rgba(0,0,0,0.5)' : '0px 4px 15px rgba(0,0,0,0.15)',
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-track': {
                        // Màu track scrollbar
                        background: isDarkMode ? theme.palette.background.default : theme.palette.grey[300],
                        borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        // Màu thumb scrollbar
                        background: isDarkMode ? theme.palette.grey[700] : theme.palette.grey[500],
                        borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        // Màu thumb scrollbar khi hover
                        background: isDarkMode ? theme.palette.grey[600] : theme.palette.grey[700]
                    },
                }}
            >
                {featuredPosts.map((post) => (
                    <Card
                        key={post.id}
                        sx={{
                            flexShrink: 0,
                            width: { xs: '90%', sm: '45%', md: '320px' },
                            borderRadius: 3,
                            // Box shadow tùy chỉnh
                            boxShadow: isDarkMode ? '0px 6px 12px rgba(0,0,0,0.4)' : '0px 6px 12px rgba(0,0,0,0.1)',
                            // Màu nền của Card: sử dụng background.paper
                            backgroundColor: theme.palette.background.paper,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: isDarkMode ? '0px 10px 20px rgba(0,0,0,0.6)' : '0px 10px 20px rgba(0,0,0,0.2)',
                            },
                            scrollSnapAlign: 'start',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="160"
                            image={post.image}
                            alt={post.title}
                            sx={{
                                borderTopLeftRadius: 3,
                                borderTopRightRadius: 3,
                                objectFit: 'cover',
                            }}
                        />
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    fontWeight: 600,
                                    // Sử dụng theme.palette.text.primary
                                    color: theme.palette.text.primary,
                                    mb: 1,
                                    minHeight: '48px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {post.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                // Sử dụng theme.palette.text.secondary
                                color={theme.palette.text.secondary}
                                sx={{ mt: 'auto' }}
                            >
                                {post.author} - {new Date(post.date).toLocaleDateString()}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    mt: 2,
                                    alignSelf: 'flex-end',
                                    // Sử dụng primary.main cho màu border và color
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        // Sử dụng primary.main với alpha channel cho hover background
                                        backgroundColor: theme.palette.primary.light + '1A', // 10% opacity for hover
                                    },
                                }}
                            >
                                Xem chi tiết
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default FeaturedPosts;