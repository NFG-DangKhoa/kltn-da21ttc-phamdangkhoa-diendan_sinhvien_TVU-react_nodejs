// Đây là cột bên phải trong bố cục 3 cột, hiển thị các chủ đề phổ biến.
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, useTheme } from '@mui/material';
import { Whatshot } from '@mui/icons-material';

const PopularTopicsSidebar = ({ trendingTopics, darkMode }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                borderRadius: 3,
                boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                width: { xs: '100%', md: '220px' },
                minWidth: { xs: 'auto', md: '220px' },
                color: darkMode ? '#e0e0e0' : '#1c1e21',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                flexShrink: 0,
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    color: darkMode ? '#ffffff' : 'text.primary',
                    fontWeight: 600,
                    mb: 2,
                    borderBottom: `1px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                    pb: 1,
                }}
            >
                Chủ đề phổ biến
            </Typography>
            <List disablePadding>
                {trendingTopics.map((topic) => (
                    <ListItem
                        key={topic.id}
                        button
                        sx={{
                            borderRadius: '8px',
                            mb: 1,
                            '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center">
                                    <Whatshot fontSize="small" sx={{ mr: 1, color: '#FF5722' }} />
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: darkMode ? '#e0e0e0' : 'text.primary',
                                            fontWeight: 500,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {topic.name}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color={darkMode ? '#bdbdbd' : 'text.secondary'} sx={{ ml: 3 }}>
                                    {topic.postCount} bài viết
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
                <Divider sx={{ mt: 2, mb: 2, borderColor: darkMode ? '#424242' : '#e0e0e0' }} />
                <Button
                    fullWidth
                    variant="text"
                    sx={{
                        color: darkMode ? '#90caf9' : 'primary.main',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.04)' },
                    }}
                >
                    Xem tất cả chủ đề
                </Button>
            </List>
        </Box>
    );
};

export default PopularTopicsSidebar;