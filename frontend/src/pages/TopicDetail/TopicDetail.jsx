import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, useTheme } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
// import { ThemeContext } from '../../context/ThemeContext'; // This line was already commented out, good!
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn/CenterColumn';
import RightColumn from './RightColumn';
// Removed WbSunnyIcon and NightlightRoundIcon imports - These were already removed, good!

const TopicDetail = () => {
    const { topicId } = useParams();
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [topic, setTopic] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});
    const { user } = useContext(AuthContext);
    // const { toggleColorMode, mode } = useContext(ThemeContext); // This line was already commented out, good!

    const theme = useTheme(); // This hook is still useful for accessing theme properties like palette.text.primary

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

    // Lấy thông tin chủ đề
    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const topicRes = await axios.get(`http://localhost:5000/api/topics/${topicId}`);
                setTopic(topicRes.data);
            } catch (err) {
                console.error('Lỗi khi tải thông tin chủ đề:', err);
            }
        };
        fetchTopic();
    }, [topicId]);

    const handlePostSubmit = async (postWithUserId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found. User is not logged in.");
                alert("Bạn cần đăng nhập để đăng bài viết.");
                return;
            }
            await axios.post(
                `http://localhost:5000/api/posts/cr`, // <--- Check this endpoint, should it be '/posts/create' or similar?
                {
                    ...postWithUserId,
                    topicId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Đây là phần quan trọng
                    }
                }
            );
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

    // Removed darkMode variable as it's no longer needed for the toggle button - This was already removed, good!

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 2,
                mt: 8,
                minHeight: '100vh',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                // The background color for TopicDetail itself should ideally be set in the App.js or main layout
                // based on the global theme, not here. This Box should take the default theme background.
                backgroundColor: theme.palette.background.default, // Ensure background adapts to theme
                transition: 'background-color 0.4s ease',
            }}
        >
            {/* Removed the IconButton for toggling dark/light mode - This was already removed, good! */}


            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <LeftColumn user={user} /> {/* Removed darkMode prop - Confirmed */}
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
                        setDetailedPosts={setDetailedPosts}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        showReplies={showReplies}
                        toggleReplies={toggleReplies}
                    // Removed darkMode prop - Confirmed
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <RightColumn /> {/* Removed darkMode prop - Confirmed */}
                </Grid>
            </Grid>
        </Box>
    );
};

export default TopicDetail;