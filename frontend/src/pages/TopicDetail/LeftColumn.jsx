import React, { useEffect, useState, useContext } from 'react'; // Import useContext
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar, Chip, CircularProgress, ListItemAvatar } from '@mui/material';
import { Science, Rocket, Language, AccountBalance, Apps, Person, Email, Star, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext

const LeftColumn = ({ user }) => { // Remove darkMode from props
    const { mode } = useContext(ThemeContext); // Use useContext to get the current theme mode
    const darkMode = mode === 'dark'; // Determine darkMode based on the context mode

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

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/topics/all');
                setTopics(res.data.slice(0, 10000));
            } catch (error) {
                console.error('Lỗi khi lấy chủ đề nổi bật:', error);
            }
        };

        const fetchFeaturedPosts = async () => {
            try {
                // Sử dụng cùng API như Home page
                const response = await axios.get(`http://localhost:5000/api/home/featured-posts?limit=4&t=${Date.now()}`);
                if (response.data.success) {
                    console.log('LeftColumn: Featured posts loaded:', response.data.data.length);
                    setFeaturedPosts(response.data.data); // Lấy 4 bài viết nổi bật
                } else {
                    console.log('LeftColumn: Featured posts API failed');
                    setFeaturedPosts([]);
                }
            } catch (error) {
                console.error('LeftColumn: Error fetching featured posts:', error);
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
            {/* User Info Card - Compact */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    background: '#ffffff',
                    borderRadius: 2.5,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            mr: 1.5,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            fontSize: '1rem'
                        }}
                    >
                        {user?.fullName?.charAt(0) || <Person />}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{
                            color: '#1e293b',
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: '0.875rem',
                            lineHeight: 1.2
                        }}>
                            {user?.fullName || 'Khách'}
                        </Typography>
                        <Chip
                            size="small"
                            label={user?.role === 'admin' ? 'Admin' : user?.role || 'Khách'}
                            color={user?.role === 'admin' ? 'error' : 'primary'}
                            sx={{
                                fontSize: '0.65rem',
                                height: 18
                            }}
                        />
                    </Box>
                </Box>

                {user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                        <Email sx={{ fontSize: 14, mr: 1 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {user.email.length > 20 ? `${user.email.slice(0, 17)}...` : user.email}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Topics Card - Compact */}
            <Paper
                elevation={0}
                sx={{
                    background: '#ffffff',
                    borderRadius: 2.5,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, pb: 1 }}>
                    <Typography variant="subtitle1" sx={{
                        color: '#1e293b',
                        fontWeight: 600,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem'
                    }}>
                        🔥 Chủ đề nổi bật
                    </Typography>
                </Box>

                <List sx={{ pt: 0, pb: 1 }}>
                    {topics.slice(0, 6).map((topic, index) => (
                        <ListItem
                            key={topic._id}
                            component={Link}
                            to={`/topic/${topic._id}`}
                            sx={{
                                px: 2.5,
                                py: 1,
                                textDecoration: 'none',
                                borderBottom: index < 5 ? '1px solid #f1f5f9' : 'none',
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    '& .topic-icon': {
                                        transform: 'scale(1.05)',
                                        color: '#3b82f6'
                                    },
                                    '& .topic-name': {
                                        color: '#3b82f6'
                                    }
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <ListItemIcon
                                className="topic-icon"
                                sx={{
                                    color: '#64748b',
                                    minWidth: 28,
                                    transition: 'all 0.2s ease',
                                    '& svg': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            >
                                {icons[index % icons.length]}
                            </ListItemIcon>
                            <ListItemText
                                primary={topic.name}
                                primaryTypographyProps={{
                                    className: 'topic-name',
                                    color: '#374151',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s ease',
                                    lineHeight: 1.3,
                                    noWrap: true
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Featured Posts Card - Compact */}
            <Paper
                elevation={0}
                sx={{
                    background: '#ffffff',
                    borderRadius: 2.5,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, pb: 1 }}>
                    <Typography variant="subtitle1" sx={{
                        color: '#1e293b',
                        fontWeight: 600,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem'
                    }}>
                        <Star sx={{ mr: 1, color: '#f59e0b', fontSize: '1.1rem' }} />
                        Bài viết nổi bật
                    </Typography>
                </Box>

                {loadingPosts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <List sx={{ pt: 0, pb: 1 }}>
                        {featuredPosts.map((post, index) => (
                            <ListItem
                                key={post._id}
                                component={Link}
                                to={`/posts/detail?topicId=${post.topicId}&postId=${post._id}`}
                                sx={{
                                    px: 2.5,
                                    py: 1.5,
                                    textDecoration: 'none',
                                    borderBottom: index < featuredPosts.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    '&:hover': {
                                        backgroundColor: '#f8fafc',
                                        '& .post-title': {
                                            color: '#3b82f6'
                                        }
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 36 }}>
                                    <Avatar
                                        src={post.authorInfo?.[0]?.avatarUrl}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            fontSize: '0.7rem',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        }}
                                    >
                                        {!post.authorInfo?.[0]?.avatarUrl && post.authorInfo?.[0]?.fullName?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={post.title}
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {post.authorInfo?.[0]?.fullName} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    }
                                    primaryTypographyProps={{
                                        className: 'post-title',
                                        color: '#374151',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        transition: 'color 0.2s ease',
                                        lineHeight: 1.3,
                                        noWrap: true
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