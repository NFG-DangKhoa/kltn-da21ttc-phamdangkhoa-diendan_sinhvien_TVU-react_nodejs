import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar, Chip, CircularProgress, useTheme, alpha } from '@mui/material';
import { Science, Rocket, Language, AccountBalance, Apps, Person, Email, Star, Book } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';

const LeftColumn = ({ user }) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';
    const theme = useTheme();
    const { topicId } = useParams();
    const navigate = useNavigate();

    const [topics, setTopics] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const icons = [
        <Science />,
        <Rocket />,
        <Language />,
        <AccountBalance />,
        <Apps />,
    ];

    const handlePostClick = (post) => {
        const topicId = post.topicInfo?._id || post.topic?._id || post.topicId;
        const postId = post._id;
        if (topicId && postId) {
            navigate(`/post-detail?topicId=${topicId}&postId=${postId}`);
        } else {
            console.error('Missing topicId or postId for navigation', { post });
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes < 1) return 'vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ngày trước`;
    };

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/topics/all');
                setTopics(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy tất cả chủ đề:', error);
            }
        };

        const fetchFeaturedPosts = async () => {
            setLoadingPosts(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/home/featured-posts?limit=4&t=${Date.now()}`);
                if (response.data.success) {
                    setFeaturedPosts(response.data.data);
                } else {
                    setFeaturedPosts([]);
                }
            } catch (error) {
                console.error('Error fetching featured posts:', error);
                setFeaturedPosts([]);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchTopics();
        fetchFeaturedPosts();
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* User Info Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    background: darkMode ? '#1e293b' : '#ffffff',
                    borderRadius: 2.5,
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : undefined}
                        sx={{ width: 40, height: 40, mr: 1.5, background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
                    >
                        {user?.fullName?.charAt(0) || <Person />}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user?.fullName || 'Khách'}
                        </Typography>
                        <Chip
                            size="small"
                            label={user?.role === 'admin' ? 'Admin' : (user?.role === 'user' ? 'Người dùng' : 'Member')}
                            color={user?.role === 'admin' ? 'error' : 'primary'}
                        />
                    </Box>
                </Box>
                {user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
                        <Email sx={{ fontSize: 14, mr: 1 }} />
                        <Typography variant="caption">{user.email}</Typography>
                    </Box>
                )}
            </Paper>

            {/* Topics Card */}
            <Paper
                elevation={0}
                sx={{
                    background: darkMode ? '#1e293b' : '#ffffff',
                    borderRadius: 2.5,
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, pb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Book sx={{ mr: 1, color: 'primary.main' }} />
                        Các chủ đề
                    </Typography>
                </Box>
                <List sx={{ pt: 0, pb: 1 }}>
                    {topics.map((topic, index) => (
                        <ListItem
                            key={topic._id}
                            component={Link}
                            to={`/topic/${topic._id}`}
                            sx={{
                                px: 2.5, py: 1, textDecoration: 'none',
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
                                ...(topic._id === topicId && {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    borderRight: `3px solid ${theme.palette.primary.main}`,
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                        color: theme.palette.primary.main,
                                        fontWeight: '600',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>{icons[index % icons.length]}</ListItemIcon>
                            <ListItemText primary={topic.name} primaryTypographyProps={{ fontSize: '0.875rem', noWrap: true }} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Featured Posts Card - New Vertical Layout */}
            <Paper
                elevation={0}
                sx={{
                    background: darkMode ? '#1e293b' : '#ffffff',
                    borderRadius: 2.5,
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, pb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ mr: 1, color: '#f59e0b' }} />
                        Bài viết nổi bật
                    </Typography>
                </Box>

                {loadingPosts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {featuredPosts.map((post, index) => (
                            <ListItem
                                key={post._id}
                                alignItems="flex-start"
                                component="button"
                                onClick={() => handlePostClick(post)}
                                sx={{
                                    width: '100%',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    py: 1.5,
                                    px: 2.5,
                                    borderTop: index > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                <Avatar
                                    variant="rounded"
                                    src={post.thumbnailImage || post.images?.[0]}
                                    alt={post.title}
                                    sx={{ width: 64, height: 64, mr: 2, backgroundColor: 'grey.200' }}
                                >
                                    {!post.thumbnailImage && !post.images?.[0] && <Typography variant="caption">No Img</Typography>}
                                </Avatar>
                                <ListItemText
                                    primary={post.title}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'block' }}
                                                component="span"
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {post.authorInfo?.fullName || 'Anonymous'}
                                            </Typography>
                                            <Typography
                                                sx={{ display: 'block' }}
                                                component="span"
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatTimeAgo(post.createdAt)}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                    primaryTypographyProps={{
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        mb: 0.5,
                                        sx: {
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default LeftColumn;
