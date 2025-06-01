import React from 'react';
import { Box, Typography, Grid, Card, useTheme, CardMedia, CardContent } from '@mui/material';
import { Whatshot } from '@mui/icons-material';

// Đổi tên prop 'darkMode' thành 'isDarkMode' để nhất quán
const TrendingTopicsSection = ({ trendingTopics, isDarkMode }) => {
    const theme = useTheme(); // Lấy theme object hiện tại

    return (
        <Box mb={6}>
            <Typography
                variant="h5"
                mb={3}
                sx={{
                    fontWeight: 700,
                    // Sử dụng theme.palette.text.primary
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    // Sử dụng theme.palette.divider
                    borderBottom: `2px solid ${theme.palette.divider}`,
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
                                // Sử dụng theme.palette.background.paper cho nền Card
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 2,
                                // Box shadow tùy chỉnh theo isDarkMode
                                boxShadow: isDarkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: isDarkMode ? '0px 8px 16px rgba(0,0,0,0.5)' : '0px 8px 16px rgba(0,0,0,0.2)',
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
                                        // Sử dụng theme.palette.text.primary
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {topic.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    // Sử dụng theme.palette.text.secondary
                                    color={theme.palette.text.secondary}
                                >
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