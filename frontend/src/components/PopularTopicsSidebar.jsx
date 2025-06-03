import React, { useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, useTheme } from '@mui/material';
import { Whatshot } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const PopularTopicsSidebar = ({ trendingTopics }) => {
    const theme = useTheme();
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff', // Sử dụng mode
                borderRadius: 3,
                boxShadow: mode === 'dark' ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)', // Sử dụng mode
                width: { xs: '100%', md: '220px' },
                minWidth: { xs: 'auto', md: '220px' },
                color: mode === 'dark' ? '#e0e0e0' : '#1c1e21', // Sử dụng mode
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                flexShrink: 0,
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    color: mode === 'dark' ? '#ffffff' : 'text.primary', // Sử dụng mode
                    fontWeight: 600,
                    mb: 2,
                    borderBottom: `1px solid ${mode === 'dark' ? '#424242' : '#e0e0e0'}`, // Sử dụng mode
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
                                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)', // Sử dụng mode
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
                                            color: mode === 'dark' ? '#e0e0e0' : 'text.primary', // Sử dụng mode
                                            fontWeight: 500,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {topic.name}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color={mode === 'dark' ? '#bdbdbd' : 'text.secondary'} sx={{ ml: 3 }}>
                                    {topic.postCount} bài viết
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
                <Divider sx={{ mt: 2, mb: 2, borderColor: mode === 'dark' ? '#424242' : '#e0e0e0' }} /> {/* Sử dụng mode */}
                <Button
                    fullWidth
                    variant="text"
                    sx={{
                        color: mode === 'dark' ? '#90caf9' : 'primary.main', // Sử dụng mode
                        fontWeight: 600,
                        '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.04)' }, // Sử dụng mode
                    }}
                >
                    Xem tất cả chủ đề
                </Button>
            </List>
        </Box>
    );
};

export default PopularTopicsSidebar;