import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Grid, Box, Typography, useTheme, CircularProgress, Container, GlobalStyles, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn/CenterColumn';
import RightColumn from './RightColumn';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';

const TopicDetail = () => {
    const { topicId } = useParams();
    const [sideColumnsVisible, setSideColumnsVisible] = useState(false);
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [sortBy, setSortBy] = useState('newest'); // State for sorting option
    const [topic, setTopic] = useState(null);
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'quick' or 'table'

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

    const fetchPostsAndDetails = useCallback(async () => {
        if (!topicId) return;

        try {
            setLoadingPosts(true);
            // Step 1: Fetch the initial list of posts
            const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}?sortBy=${sortBy}`);
            const initialPosts = postsRes.data;

            // Step 2: Fetch detailed data for each post
            const enrichedPosts = await Promise.all(
                initialPosts.map(async (post) => {
                    try {
                        // Fetch ratings data
                        const ratingRes = await axios.get(`http://localhost:5000/api/ratings/post/${post._id}`);
                        const { averageRating, totalRatings } = ratingRes.data;

                        // The author should already be populated from the first call, but we can ensure it.
                        // likeCount and commentCount are also expected from the initial call.
                        // If they are not, additional calls would be needed here.
                        return {
                            ...post,
                            averageRating: averageRating || 0,
                            totalRatings: totalRatings || 0,
                            // Ensure author is at least an empty object to prevent crashes
                            author: post.author || {},
                        };
                    } catch (error) {
                        console.error(`Failed to fetch details for post ${post._id}`, error);
                        // Return the post with default values if details fetch fails
                        return {
                            ...post,
                            averageRating: 0,
                            totalRatings: 0,
                            author: post.author || {},
                        };
                    }
                })
            );

            setDetailedPosts(enrichedPosts);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu bài viết:', err);
            setError(prevError => prevError || 'Không thể tải bài viết. Vui lòng thử lại sau.');
        } finally {
            setLoadingPosts(false);
        }
    }, [topicId, sortBy]);

    useEffect(() => {
        fetchPostsAndDetails();
    }, [fetchPostsAndDetails]);

    useEffect(() => {
        const filtered = detailedPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPosts(filtered);
    }, [searchTerm, detailedPosts]);

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
            // Re-fetch all data to ensure consistency
            fetchPostsAndDetails();
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
                <Box>
                    <BreadcrumbNavigation
                        topicName={topic?.name}
                        darkMode={theme.palette.mode === 'dark'}
                    />
                </Box>

                {/* Main Content Container */}
                <Box
                    sx={{
                        px: { xs: 1, sm: 2, md: 3 },
                        mt: '20px', // Margin-top để không bị che bởi header + breadcrumb
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: '100vw',
                        mx: 'auto'
                    }}
                >
                    <Grid container spacing={3} sx={{ alignItems: 'flex-start', width: '100%', flexWrap: 'nowrap' }}>
                        {/* Left Column - Combined User Info & Sidebar */}
                        <Grid
                            item
                            sx={{
                                width: sideColumnsVisible ? { md: '35%', lg: '30%' } : '0',
                                minWidth: sideColumnsVisible ? { md: '35%', lg: '30%' } : '0',
                                opacity: sideColumnsVisible ? 1 : 0,
                                transition: 'width 0.4s ease-in-out, min-width 0.4s ease-in-out, opacity 0.4s ease-in-out, padding 0.4s ease-in-out',
                                display: { xs: 'none', md: 'block' },
                                position: 'sticky',
                                top: 80,
                                alignSelf: 'flex-start',
                                maxHeight: 'calc(100vh - 100px)',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                pr: sideColumnsVisible ? 2 : 0,
                                '&::-webkit-scrollbar': { width: '6px' },
                                '&::-webkit-scrollbar-track': { background: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSideColumnsVisible(false)}
                                sx={{
                                    mb: 2,
                                    width: '100%',
                                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)',
                                    }
                                }}
                                startIcon={<ChevronLeft />}
                            >
                                Đóng
                            </Button>
                            <Box sx={{ mb: 3 }}>
                                <LeftColumn user={user} />
                            </Box>
                            <Box>
                                <RightColumn />
                            </Box>
                        </Grid>

                        {/* Center Column - Main Content (Posts) */}
                        <Grid
                            item
                            sx={{
                                width: sideColumnsVisible ? { xs: '100%', md: '65%', lg: '70%' } : '100%',
                                transition: 'width 0.4s ease-in-out',
                                pl: { md: sideColumnsVisible ? 2 : 0 }
                            }}
                        >
                            <Box sx={{
                                background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#ffffff',
                                borderRadius: { xs: 2, md: 2.5 },
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                border: `1px solid ${theme.palette.divider}`,
                                overflow: 'hidden',
                                minHeight: 'calc(100vh - 200px)',
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
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    filteredPosts={filteredPosts}
                                    loadingPosts={loadingPosts}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                {!sideColumnsVisible && (
                    <Button
                        variant="contained"
                        onClick={() => setSideColumnsVisible(true)}
                        sx={{
                            position: 'fixed',
                            top: '50%',
                            left: 0,
                            transform: 'translateY(-50%)',
                            minWidth: 'auto',
                            width: '32px',
                            height: '48px',
                            p: 0,
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            zIndex: 1100,
                        }}
                    >
                        <ChevronRight />
                    </Button>
                )}
            </Box>
        </>
    );
};

export default TopicDetail;
