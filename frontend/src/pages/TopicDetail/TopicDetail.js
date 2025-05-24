import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, IconButton, useTheme, Typography } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';

const TopicDetail = () => {
    const { topicId } = useParams();
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [topic, setTopic] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});
    const { user } = useContext(AuthContext);

    // Sử dụng localStorage để lưu trạng thái darkMode
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true' ? true : false;
    });

    const theme = useTheme(); // Giữ lại useTheme nếu bạn có dùng theme của Material-UI ở nơi khác

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                setDetailedPosts(postsRes.data);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
            }
        };
        fetchData();
    }, [topicId]);

    // Lưu trạng thái darkMode vào localStorage mỗi khi nó thay đổi
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
        // Có thể thêm class cho body hoặc root element để áp dụng style toàn cục
        document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f2f5';
        document.body.style.color = darkMode ? '#ffffff' : '#1c1e21';
    }, [darkMode]);

    const handlePostSubmit = async (postWithUserId) => {
        try {
            await axios.post(`http://localhost:5000/api/posts/crr`, {
                ...postWithUserId,
                topicId,
            });
            const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
            setDetailedPosts(postsRes.data);
            setNewPost({ title: '', content: '', tags: '' });
        } catch (err) {
            console.error('Lỗi khi đăng bài viết:', err);
        }
    };

    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    if (!user) return <Navigate to="/login" replace />;

    const handleToggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 2,
                mt: 0,
                // Nền chính của trang: màu đen cho ban đêm, màu trắng xám cho ban ngày
                backgroundColor: darkMode ? '#121212' : '#f0f2f5',
                color: darkMode ? '#ffffff' : '#1c1e21',
                minHeight: '100vh',
                transition: 'background-color 0.4s ease, color 0.4s ease',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton
                    onClick={handleToggleDarkMode}
                    aria-label="toggle dark mode"
                    sx={{
                        color: darkMode ? '#f9d71c' : '#4a4a4a',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                            color: darkMode ? '#fff176' : '#616161',
                        }
                    }}
                >
                    {darkMode ? <WbSunnyIcon fontSize="large" /> : <NightlightRoundIcon fontSize="large" />}
                </IconButton>
            </Box>
            {/* Hiển thị tên chủ đề */}
            <Typography
                variant="h4"
                align="center"
                sx={{
                    fontWeight: 'bold',
                    mb: 3,
                    color: darkMode ? '#f9d71c' : '#333',
                    transition: 'color 0.4s ease',
                }}
            >
                Chủ đề: {topic ? topic.name : 'Đang tải...'}
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <LeftColumn user={user} darkMode={darkMode} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CenterColumn
                        user={user}
                        topic={topic}
                        topicId={topicId}
                        newPost={newPost}
                        setNewPost={setNewPost}
                        handlePostSubmit={handlePostSubmit}
                        detailedPosts={detailedPosts}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        showReplies={showReplies}
                        toggleReplies={toggleReplies}
                        darkMode={darkMode}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <RightColumn darkMode={darkMode} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TopicDetail;