import React from 'react';
import { Box, Typography, Grid, Card, useTheme, CardMedia, CardContent } from '@mui/material';
import { Whatshot } from '@mui/icons-material';

const TrendingTopicsSection = ({ trendingTopics, darkMode }) => {
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
                <Whatshot sx={{ mr: 1, color: '#FF5722' }} /> Chủ Đề Đáng Chú Ý
            </Typography>
            <Grid container spacing={3} justifyContent="center">
                {/* Sử dụng dữ liệu trendingTopics được truyền từ props */}
                {trendingTopics.map((topic) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={topic.id}>
                        <Card
                            sx={{
                                backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                                borderRadius: 2,
                                boxShadow: darkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="140"
                                image={topic.image} // Sử dụng image từ dữ liệu trendingTopics
                                alt={topic.name}
                                sx={{
                                    borderTopLeftRadius: 2,
                                    borderTopRightRadius: 2,
                                    objectFit: 'cover',
                                }}
                            />
                            <CardContent sx={{ p: 2 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: darkMode ? '#e0e0e0' : 'text.primary',
                                    }}
                                >
                                    {topic.name}
                                </Typography>
                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                    {topic.postCount} bài viết
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default TrendingTopicsSection;