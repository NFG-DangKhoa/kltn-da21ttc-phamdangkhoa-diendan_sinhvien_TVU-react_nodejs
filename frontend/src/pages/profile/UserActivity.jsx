import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Box, Typography, CircularProgress, Grid, Tabs, Tab, Paper,
    Stack, Link, Select, MenuItem, FormControl, Alert, Tooltip,
    useTheme, useMediaQuery, Button
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SortIcon from '@mui/icons-material/Sort';
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import axios from "axios";
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

// Helper function for formatting time
const formatTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
};

// A more visually appealing empty state component
const EmptyState = ({ icon, message }) => (
    <Box textAlign="center" p={5}>
        <Box component="span" sx={{ fontSize: 60, color: 'text.disabled' }}>{icon}</Box>
        <Typography variant="h6" color="text.secondary">{message}</Typography>
    </Box>
);

// Base card for activities
const ActivityCard = ({ children, ...props }) => (
    <Paper
        elevation={2}
        sx={{
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
            }
        }}
        {...props}
    >
        {children}
    </Paper>
);

// Card for Post activities
const PostActivityCard = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const theme = useTheme();

    const sanitizedContent = useMemo(() => DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }), [post.content]);

    useEffect(() => {
        const checkOverflow = () => {
            const element = containerRef.current;
            if (element) {
                const isCurrentlyOverflowing = element.scrollHeight > element.clientHeight;
                if (isCurrentlyOverflowing !== isOverflowing) {
                    setIsOverflowing(isCurrentlyOverflowing);
                }
            }
        };

        // Use a timeout to allow content (like images) to load before checking
        const timer = setTimeout(checkOverflow, 100);
        window.addEventListener('resize', checkOverflow);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkOverflow);
        };
    }, [isOverflowing, sanitizedContent]);

    return (
        <ActivityCard>
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <PostAddIcon color="action" sx={{ mt: 0.5 }} />
                <Box flexGrow={1}>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to={`/posts/${post._id}`}
                        sx={{
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        {formatTimeAgo(post.createdAt)}
                    </Typography>
                </Box>
            </Stack>
            <Box
                ref={containerRef}
                sx={{
                    my: 2,
                    flexGrow: 1,
                    maxHeight: isExpanded ? 'none' : '120px', // Reduced height
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'max-height 0.4s ease-in-out',
                    '&::after': !isExpanded && isOverflowing ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        background: `linear-gradient(to bottom, rgba(255,255,255,0), ${theme.palette.background.paper})`,
                    } : {},
                }}
            >
                <Typography component="div" variant="body2" color="text.secondary">
                    {parse(sanitizedContent)}
                </Typography>
            </Box>

            {isOverflowing && (
                <Button onClick={() => setIsExpanded(!isExpanded)} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto', pt: isOverflowing ? 0 : 2 }}>
                <Tooltip title="Lượt thích">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ThumbUpIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{post.likeCount || 0}</Typography>
                    </Stack>
                </Tooltip>
                <Tooltip title="Bình luận">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ChatBubbleOutlineIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{post.commentCount || 0}</Typography>
                    </Stack>
                </Tooltip>
            </Stack>
        </ActivityCard>
    );
};

// Card for Comment activities
const CommentActivityCard = ({ comment }) => (
    <ActivityCard>
        <Stack direction="row" spacing={2} alignItems="flex-start">
            <CommentIcon color="action" sx={{ mt: 0.5 }} />
            <Box flexGrow={1}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', flexGrow: 1 }}>
                    "{parse(DOMPurify.sanitize(comment.content))}"
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Bình luận {formatTimeAgo(comment.createdAt)} trong bài viết:
                </Typography>
                <Link component={RouterLink} to={`/posts/${comment.postId}`} sx={{ fontWeight: 'medium' }}>
                    {comment.postTitle || 'Không có tiêu đề'}
                </Link>
            </Box>
        </Stack>
        <Box sx={{ mt: 'auto', pt: 2, textAlign: 'right' }}>
            <Link
                component={RouterLink}
                to={`/posts/${comment.postId}#comment-${comment._id}`}
                sx={{ fontWeight: 'bold' }}
            >
                Xem chi tiết
            </Link>
        </Box>
    </ActivityCard>
);

// Card for Like activities
const LikeActivityCard = ({ like }) => {
    const sanitizedContent = useMemo(() => DOMPurify.sanitize(like.postTitle || like.commentContent || 'Nội dung không có sẵn'), [like]);

    return (
        <ActivityCard>
            <Stack direction="row" spacing={2} alignItems="center">
                <FavoriteIcon color="error" />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Đã thích {like.postId ? 'bài viết' : 'bình luận'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(like.createdAt)}
                    </Typography>
                </Box>
            </Stack>
            <Box sx={{ my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {parse(sanitizedContent)}
                </Typography>
            </Box>
            <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                <Link
                    component={RouterLink}
                    to={like.postId ? `/posts/${like.postId}` : `/posts/${like.commentPostId}#comment-${like.commentId}`}
                    sx={{ fontWeight: 'bold' }}
                >
                    Xem nội dung gốc
                </Link>
            </Box>
        </ActivityCard>
    );
};

const UserActivity = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState({ posts: [], comments: [], likes: [] });
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
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
            } catch (err) {
                console.error("Error fetching activities:", err);
                setError("Không thể tải hoạt động. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchActivities();
    }, [userId]);

    const sortedActivities = useMemo(() => {
        const sortable = (items) => [...items].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return {
            posts: sortable(activities.posts),
            comments: sortable(activities.comments),
            likes: sortable(activities.likes),
        };
    }, [activities, sortBy]);

    const renderContent = () => {
        if (loading) {
            return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }

        let items, CardComponent, emptyIcon, emptyMessage;
        switch (activeTab) {
            case 0:
                items = sortedActivities.posts;
                CardComponent = PostActivityCard;
                emptyIcon = <ArticleIcon sx={{ fontSize: 60 }} />;
                emptyMessage = "Người dùng này chưa có bài viết nào.";
                break;
            case 1:
                items = sortedActivities.comments;
                CardComponent = CommentActivityCard;
                emptyIcon = <CommentIcon sx={{ fontSize: 60 }} />;
                emptyMessage = "Chưa tìm thấy bình luận nào.";
                break;
            case 2:
                items = sortedActivities.likes;
                CardComponent = LikeActivityCard;
                emptyIcon = <FavoriteIcon sx={{ fontSize: 60 }} />;
                emptyMessage = "Chưa có lượt thích nào được ghi nhận.";
                break;
            default:
                return null;
        }

        if (items.length === 0) {
            return <EmptyState icon={emptyIcon} message={emptyMessage} />;
        }

        return (
            <Grid container spacing={3} sx={{ pt: 3 }} justifyContent="center">
                {items.map(item => (
                    <Grid item xs={12} md={9} lg={8} key={item._id}>
                        <CardComponent {...{ [CardComponent.name.replace('ActivityCard', '').toLowerCase()]: item }} />
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Paper elevation={1} sx={{ p: 1, mb: 3, borderRadius: 2 }}>
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={isMobile ? 2 : 0}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 'auto',
                                py: 1.5,
                                px: 3,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 'bold',
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            }
                        }}
                    >
                        <Tab icon={<PostAddIcon />} label={`Bài viết (${activities.posts.length})`} />
                        <Tab icon={<ChatBubbleOutlineIcon />} label={`Bình luận (${activities.comments.length})`} />
                        <Tab icon={<ThumbUpIcon />} label={`Lượt thích (${activities.likes.length})`} />
                    </Tabs>

                    <FormControl sx={{ minWidth: 150, pr: isMobile ? 0 : 1 }} size="small">
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="newest">Mới nhất</MenuItem>
                            <MenuItem value="oldest">Cũ nhất</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {renderContent()}
        </Box>
    );
};

export default UserActivity;
