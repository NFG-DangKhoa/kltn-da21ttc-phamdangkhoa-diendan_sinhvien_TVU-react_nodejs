import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, useTheme } from '@mui/material';
import {
    Rocket,
    Forum,
    SportsHandball,
    School,
    AccountCircle,
    HelpOutline,
} from '@mui/icons-material';

const CategoriesSidebar = ({ darkMode }) => {
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
                Danh mục
            </Typography>
            <List disablePadding>
                {['Bài mới', 'Thảo luận', 'Giải trí', 'Sinh hoạt', 'Tài khoản', 'Câu hỏi'].map((text, index) => (
                    <ListItem
                        key={index}
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
                                    {text === 'Bài mới' && <Rocket sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'primary.main' }} />}
                                    {text === 'Thảo luận' && <Forum sx={{ mr: 1, color: darkMode ? '#81c784' : '#4caf50' }} />}
                                    {text === 'Giải trí' && <SportsHandball sx={{ mr: 1, color: darkMode ? '#ffb74d' : '#ff9800' }} />}
                                    {text === 'Sinh hoạt' && <School sx={{ mr: 1, color: darkMode ? '#ef9a9a' : '#f44336' }} />}
                                    {text === 'Tài khoản' && <AccountCircle sx={{ mr: 1, color: darkMode ? '#b39ddb' : '#9c27b0' }} />}
                                    {text === 'Câu hỏi' && <HelpOutline sx={{ mr: 1, color: darkMode ? '#a1887f' : '#795548' }} />}
                                    <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary', fontWeight: 500 }}>
                                        {text}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CategoriesSidebar;