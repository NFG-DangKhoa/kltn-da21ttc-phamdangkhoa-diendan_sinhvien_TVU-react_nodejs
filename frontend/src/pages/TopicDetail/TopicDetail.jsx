import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn/CenterColumn';
import RightColumn from './RightColumn';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';

const TopicDetail = () => {
    const { topicId } = useParams();
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [topic, setTopic] = useState(null);
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});

    const { user, loadingAuth, getToken } = useContext(AuthContext);

    const theme = useTheme();

    useEffect(() => {
        if (topicId) {
            const fetchTopic = async () => {
                try {
                    setLoadingTopic(true);
                    const topicRes = await axios.get(`http://localhost:5000/api/topics/topics/${topicId}`);
                    setTopic(topicRes.data);
                    setError(null);
                } catch (err) {
                    console.error('Lỗi khi tải thông tin chủ đề:', err);
                    setError('Không thể tải thông tin chủ đề. Vui lòng thử lại sau hoặc chủ đề không tồn tại.');
                } finally {
                    setLoadingTopic(false);
                }
            };
            fetchTopic();
        }
    }, [topicId]);

    useEffect(() => {
        if (topicId) {
            const fetchPosts = async () => {
                try {
                    setLoadingPosts(true);
                    console.log(`Fetching posts for topic: ${topicId}`);
                    const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                    console.log(`Posts response:`, postsRes.data);
                    setDetailedPosts(postsRes.data);
                    setError(null);
                } catch (err) {
                    console.error('Lỗi khi tải dữ liệu bài viết:', err);
                    setError(prevError => prevError || 'Không thể tải bài viết. Vui lòng thử lại sau.');
                } finally {
                    setLoadingPosts(false);
                }
            };
            fetchPosts();
        }
    }, [topicId]);

    const handlePostSubmit = async (postWithUserId) => {
        try {
            const currentToken = getToken();
            if (!currentToken) {
                console.error("No token found. User is not logged in.");
                alert("Bạn cần đăng nhập để đăng bài viết.");
                return;
            }
            await axios.post(
                `http://localhost:5000/api/posts/cr`,
                {
                    ...postWithUserId,
                    topicId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );
            const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
            setDetailedPosts(postsRes.data);
            setNewPost({ title: '', content: '', tags: '' });
        } catch (err) {
            console.error('Lỗi khi đăng bài viết:', err);
            alert('Có lỗi xảy ra khi đăng bài viết. Vui lòng thử lại.');
        }
    };

    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    if (loadingAuth) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', mt: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang kiểm tra phiên đăng nhập...</Typography>
            </Box>
        );
    }

    // Cho phép truy cập TopicDetail mà không cần đăng nhập
    // Chỉ redirect đến login khi user cố gắng thực hiện actions cần auth
    // if (!user && !loadingAuth) {
    //     return <Navigate to="/login" replace />;
    // }

    if (loadingTopic || loadingPosts) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', mt: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải dữ liệu chủ đề...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', mt: 8 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                minHeight: '100vh',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: theme.palette.background.default,
                transition: 'background-color 0.4s ease',
            }}
        >
            {/* Global Breadcrumb Navigation */}
            <BreadcrumbNavigation
                topicName={topic?.name}
                darkMode={theme.palette.mode === 'dark'}
            />

            <Box sx={{ p: 2 }}>

                <Grid
                    container
                    spacing={2}
                    sx={{
                        // Đảm bảo Grid container không bị tràn hoặc gây ra vấn đề với các cột
                        width: 'calc(100% - 32px)', // Trừ đi padding của Box cha (2 * 16px)
                        ml: '16px', // Bù lại padding trái
                        mr: '16px', // Bù lại padding phải
                        // Thêm thuộc tính flex container để kiểm soát tốt hơn các item
                        display: 'flex',
                        flexWrap: 'nowrap', // Ngăn các cột xuống dòng nếu không gian bị hạn chế
                    }}
                >
                    <Grid item xs={12} md={3}>
                        <LeftColumn user={user} />
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
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        {/* Grid item này không cần ml: 10 nữa vì RightColumn đã có ml: 10 */}
                        <RightColumn />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default TopicDetail;