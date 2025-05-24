import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemIcon } from '@mui/material';
import { Science, Rocket, Language, AccountBalance, Apps } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LeftColumn = ({ user }) => {
    const [topics, setTopics] = useState([]);

    // Các biểu tượng tương ứng với các chủ đề
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
                setTopics(res.data.slice(0, 10000)); // Lấy 6 chủ đề đầu tiên
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
                bgcolor: '#f9f9f9',
                borderRadius: 2,
                maxWidth: 500,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                boxShadow: 3,  // Thêm shadow cho đẹp mắt
            }}
        >
            <Typography variant="h6" gutterBottom>👤 Thông tin người dùng</Typography>
            <Typography variant="body1">Tên: {user?.fullName || 'Chưa cập nhật'}</Typography>
            <Typography variant="body2" color="text.secondary">
                Email: {user?.email ? `${user.email.slice(0, 15)}${user.email.length > 25 ? '...' : ''}` : 'Chưa đăng nhập'}
            </Typography>


            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>🔥 Các chủ đề tương tự</Typography>
            <List>
                {topics.map((topic, index) => (
                    <ListItem
                        key={topic._id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#f1f1f1',
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main', mr: 0 }}> {/* Giảm khoảng cách giữa icon và tên chủ đề */}
                            {icons[index % icons.length]} {/* Chọn icon tương ứng */}
                        </ListItemIcon>
                        <Typography
                            variant="body1"
                            component={Link}
                            to={`/topic/${topic._id}`}
                            sx={{
                                textDecoration: 'none',
                                color: 'text.primary',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'primary.main'
                                },
                            }}
                        >
                            {topic.name}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default LeftColumn;
