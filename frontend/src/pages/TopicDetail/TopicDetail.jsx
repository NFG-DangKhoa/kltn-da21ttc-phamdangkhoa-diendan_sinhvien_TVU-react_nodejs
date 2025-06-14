import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, useTheme, CircularProgress, Container, GlobalStyles } from '@mui/material';
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
        <>
            <GlobalStyles
                styles={{
                    body: {
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        minHeight: '100vh'
                    }
                }}
            />
            <Box
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)
                        `,
                        zIndex: 0
                    }
                }}
            >
                {/* Global Breadcrumb Navigation */}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <BreadcrumbNavigation
                        topicName={topic?.name}
                        darkMode={theme.palette.mode === 'dark'}
                    />
                </Box>

                {/* Main Content Container */}
                <Box
                    sx={{
                        py: 3,
                        px: { xs: 1, sm: 2, md: 3 },
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: '100vw',
                        mx: 'auto'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 2, md: 3 },
                            alignItems: 'flex-start',
                            minHeight: '100vh',
                            width: '100%'
                        }}
                    >
                        {/* Left Column - Combined User Info & Sidebar */}
                        <Box
                            sx={{
                                width: { xs: '100%', sm: '100%', md: '35%', lg: '30%' },
                                flexShrink: 0,
                                display: { xs: 'none', sm: 'none', md: 'block' },
                                position: 'sticky',
                                top: 80,
                                alignSelf: 'flex-start',
                                maxHeight: 'calc(100vh - 100px)',
                                overflowY: 'auto',
                                pr: 2,
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'transparent'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(0,0,0,0.1)',
                                    borderRadius: '3px'
                                }
                            }}
                        >
                            {/* User Info Section */}
                            <Box sx={{ mb: 3 }}>
                                <LeftColumn user={user} />
                            </Box>

                            {/* Sidebar Info Section */}
                            <Box>
                                <RightColumn />
                            </Box>
                        </Box>

                        {/* Right Column - Main Content (Posts) */}
                        <Box
                            sx={{
                                width: { xs: '100%', sm: '100%', md: '65%', lg: '70%' },
                                flexShrink: 0,
                                minWidth: 0,
                                pl: { md: 2 }
                            }}
                        >
                            <Box sx={{
                                background: '#ffffff',
                                borderRadius: { xs: 2, md: 2.5 },
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                overflow: 'hidden',
                                minHeight: 'calc(100vh - 200px)'
                            }}>
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
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default TopicDetail;