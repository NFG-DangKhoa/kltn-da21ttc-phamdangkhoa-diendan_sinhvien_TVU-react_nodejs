import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Science, Rocket, Language, AccountBalance, Apps } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LeftColumn = ({ user, darkMode }) => {
    const [topics, setTopics] = useState([]);

    const icons = [
        <Science />,
        <Rocket />,
        <Language />,
        <AccountBalance />,
        <Apps />,
    ];

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/topics/all');
                setTopics(res.data.slice(0, 10000));
            } catch (error) {
                console.error('Lỗi khi lấy chủ đề nổi bật:', error);
            }
        };

        fetchTopics();
    }, []);

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: darkMode ? '#121212' : '#f0f2f5', // màu nền card trong dark mode giống Facebook
                color: darkMode ? '#e4e6eb' : '#1c1e21',
                borderRadius: 2,
                maxWidth: 500,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                boxShadow: 'none !important',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                border: 'none',
                textAlign: 'left',
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}>
                👤 Thông tin người dùng
            </Typography>
            <Typography variant="body1" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                Tên: <strong style={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}>{user?.fullName || 'Chưa cập nhật'}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                Email: {user?.email ? `${user.email.slice(0, 15)}${user.email.length > 25 ? '...' : ''}` : 'Chưa đăng nhập'}
            </Typography>

            <Divider sx={{ my: 2, borderColor: darkMode ? '#3a3b3c' : '#eee' }} />

            <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}>
                🔥 Các chủ đề tương tự
            </Typography>
            <List>
                {topics.map((topic, index) => (
                    <ListItem
                        key={topic._id}
                        component={Link}
                        to={`/topic/${topic._id}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 1,
                            borderRadius: 1,
                            textDecoration: 'none',
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                cursor: 'pointer',
                            },
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: darkMode ? '#90caf9' : 'primary.main',
                                minWidth: 32,
                            }}
                        >
                            {icons[index % icons.length]}
                        </ListItemIcon>
                        <ListItemText
                            primary={topic.name}
                            primaryTypographyProps={{
                                color: darkMode ? '#e4e6eb' : 'text.primary',
                                textAlign: 'left',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: darkMode ? '#90caf9' : 'primary.main'
                                },
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default LeftColumn;
