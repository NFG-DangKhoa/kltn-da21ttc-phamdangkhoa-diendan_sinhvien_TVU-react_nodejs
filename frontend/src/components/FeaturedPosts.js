// File này sẽ chứa phần "Bài Viết Nổi Bật" với các Card hiển thị theo chiều ngang.
import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, useTheme } from '@mui/material';
import { Star } from '@mui/icons-material';

const FeaturedPosts = ({ featuredPosts, darkMode }) => {
    const theme = useTheme();

    return (
        <Box mb={6}>
            <Typography
                variant="h5"
                mb={3}
                sx={{
                    fontWeight: 700,
                    color: darkMode ? '#ffffff' : 'text.primary',
                    textAlign: 'center',
                    borderBottom: `2px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
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
                    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                    borderRadius: 3,
                    boxShadow: darkMode ? '0px 4px 15px rgba(0,0,0,0.5)' : '0px 4px 15px rgba(0,0,0,0.15)',
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-track': { background: darkMode ? '#2c2c2c' : '#e0e0e0', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: darkMode ? '#555' : '#888', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: darkMode ? '#777' : '#555' },
                }}
            >
                {featuredPosts.map((post) => (
                    <Card
                        key={post.id}
                        sx={{
                            flexShrink: 0,
                            width: { xs: '90%', sm: '45%', md: '320px' },
                            borderRadius: 3,
                            boxShadow: darkMode ? '0px 6px 12px rgba(0,0,0,0.4)' : '0px 6px 12px rgba(0,0,0,0.1)',
                            backgroundColor: darkMode ? '#2c2c2c' : '#f8f8f8',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: darkMode ? '0px 10px 20px rgba(0,0,0,0.6)' : '0px 10px 20px rgba(0,0,0,0.2)',
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
                                    color: darkMode ? '#e0e0e0' : 'text.primary',
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
                                color={darkMode ? '#bdbdbd' : 'text.secondary'}
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
                                    borderColor: darkMode ? '#64b5f6' : 'primary.main',
                                    color: darkMode ? '#64b5f6' : 'primary.main',
                                    '&:hover': {
                                        backgroundColor: darkMode ? 'rgba(100, 181, 246, 0.08)' : 'rgba(25, 118, 210, 0.04)',
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