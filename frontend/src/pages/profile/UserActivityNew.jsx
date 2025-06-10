import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Tabs,
    Tab,
    Card,
    CardContent,
    Chip,
    Stack,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    IconButton,
    Tooltip
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SortIcon from '@mui/icons-material/Sort';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import axios from "axios";

const UserActivity = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState({
        posts: [],
        comments: [],
        likes: []
    });
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                // Fetch all data in parallel
                const [posts, comments, likes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/users/posts?authorId=${userId}`, config),
                    axios.get(`http://localhost:5000/api/users/comments?authorId=${userId}`, config),
                    axios.get(`http://localhost:5000/api/users/likes?userId=${userId}`, config)
                ]);

                setActivities({
                    posts: posts.data || [],
                    comments: comments.data || [],
                    likes: likes.data || []
                });

            } catch (error) {
                console.error("Error fetching activities:", error);
                setError("Không thể tải hoạt động người dùng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchActivities();
        }
    }, [userId]);

    const sortActivities = (items) => {
        return [...items].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });
    };

    const formatDate = (date) => {
        return format(new Date(date), "d MMMM, yyyy 'lúc' HH:mm", { locale: vi });
    };

    const formatTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    };

    const renderPostCard = (post) => (
        <Card key={post._id} sx={{
            mb: 2,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
            }
        }}>
            <CardContent>
                <Typography variant="h6" component={RouterLink} to={`/posts/${post._id}`}
                    sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    {post.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {formatTimeAgo(post.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, mb: 2, minHeight: '3em' }}>
                    {post.content?.length > 150
                        ? post.content.substring(0, 150) + '...'
                        : post.content}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Tooltip title="Số lượt thích">
                        <Chip
                            icon={<ThumbUpIcon fontSize="small" />}
                            label={post.likeCount || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Tooltip>
                    <Tooltip title="Số bình luận">
                        <Chip
                            icon={<ChatBubbleOutlineIcon fontSize="small" />}
                            label={post.commentCount || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Tooltip>
                </Stack>
            </CardContent>
        </Card>
    );

    const renderCommentCard = (comment) => (
        <Card key={comment._id} sx={{
            mb: 2,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
            }
        }}>
            <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {comment.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    Bình luận {formatTimeAgo(comment.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Trong bài viết: {comment.postTitle || 'Không có tiêu đề'}
                </Typography>
                <Link
                    component={RouterLink}
                    to={`/posts/${comment.postId}#comment-${comment._id}`}
                    sx={{ mt: 2, display: 'block' }}
                >
                    Xem bài viết gốc
                </Link>
            </CardContent>
        </Card>
    );

    const renderLikeCard = (like) => (
        <Card key={like._id} sx={{
            mb: 2,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
            }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ThumbUpIcon color="primary" fontSize="small" />
                    <Typography>
                        {like.postId ? 'Đã thích bài viết' : 'Đã thích bình luận'}
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                    {formatTimeAgo(like.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                    {like.postTitle || like.commentContent || 'Nội dung không có sẵn'}
                </Typography>
                <Link
                    component={RouterLink}
                    to={like.postId ? `/posts/${like.postId}` : `/posts/${like.commentPostId}#comment-${like.commentId}`}
                    sx={{ mt: 'auto', display: 'block' }}
                >
                    Xem chi tiết
                </Link>
            </CardContent>
        </Card>
    );

    const currentTabContent = () => {
        let items = [];
        switch (activeTab) {
            case 0:
                items = sortActivities(activities.posts);
                return items.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Chưa có bài viết nào
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {items.map(post => (
                            <Grid item xs={12} sm={6} md={4} key={post._id}>
                                {renderPostCard(post)}
                            </Grid>
                        ))}
                    </Grid>
                );
            case 1:
                items = sortActivities(activities.comments);
                return items.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Chưa có bình luận nào
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {items.map(comment => (
                            <Grid item xs={12} sm={6} md={4} key={comment._id}>
                                {renderCommentCard(comment)}
                            </Grid>
                        ))}
                    </Grid>
                );
            case 2:
                items = sortActivities(activities.likes);
                return items.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Chưa có lượt thích nào
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {items.map(like => (
                            <Grid item xs={12} sm={6} md={4} key={like._id}>
                                {renderLikeCard(like)}
                            </Grid>
                        ))}
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{
                        flex: 1,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                >
                    <Tab
                        icon={<PostAddIcon />}
                        label={`Bài viết (${activities.posts.length})`}
                        sx={{
                            minHeight: 'auto',
                            py: 2,
                            '&.Mui-selected': {
                                color: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        icon={<ChatBubbleOutlineIcon />}
                        label={`Bình luận (${activities.comments.length})`}
                        sx={{
                            minHeight: 'auto',
                            py: 2,
                            '&.Mui-selected': {
                                color: 'primary.main'
                            }
                        }}
                    />
                    <Tab
                        icon={<ThumbUpIcon />}
                        label={`Lượt thích (${activities.likes.length})`}
                        sx={{
                            minHeight: 'auto',
                            py: 2,
                            '&.Mui-selected': {
                                color: 'primary.main'
                            }
                        }}
                    />
                </Tabs>

                <FormControl sx={{ minWidth: 120, ml: 2 }} size="small">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                        <MenuItem value="newest">Mới nhất</MenuItem>
                        <MenuItem value="oldest">Cũ nhất</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                currentTabContent()
            )}
        </Box>
    );
};

export default UserActivity;
