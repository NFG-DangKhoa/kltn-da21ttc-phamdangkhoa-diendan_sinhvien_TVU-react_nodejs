import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Typography, CircularProgress, Tabs, Tab, Paper,
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    const theme = useTheme();
    const navigate = useNavigate();

    const sanitizedContent = useMemo(() => DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }), [post.content]);
    const plainTextContent = useMemo(() => {
        const parsed = parse(sanitizedContent);

        const getTextFromNode = (node) => {
            if (typeof node === 'string') {
                return node;
            }
            if (Array.isArray(node)) {
                return node.map(getTextFromNode).join('');
            }
            if (node && node.props && node.props.children) {
                return getTextFromNode(node.props.children);
            }
            return '';
        };

        return getTextFromNode(parsed);
    }, [sanitizedContent]);


    const isLongContent = plainTextContent.length > 200;

    const handleTitleClick = () => {
        navigate(`/posts/detail?topicId=${post.topicId?._id}&postId=${post._id}`);
    };

    return (
        <ActivityCard>
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <PostAddIcon color="action" sx={{ mt: 0.5 }} />
                <Box flexGrow={1}>
                    <Typography
                        variant="h6"
                        onClick={handleTitleClick}
                        sx={{
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        {formatTimeAgo(post.createdAt)} trong chủ đề <Link component={RouterLink} to={`/topic/${post.topicId?._id}`}>{post.topicId?.name}</Link>
                    </Typography>
                </Box>
            </Stack>
            <Box
                sx={{
                    my: 2,
                    flexGrow: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'max-height 0.4s ease-in-out',
                }}
            >
                <Typography component="div" variant="body2" color="text.secondary"
                    sx={{
                        maxHeight: isExpanded ? 'none' : '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {parse(sanitizedContent)}
                </Typography>
            </Box>

            {isLongContent && (
                <Button onClick={() => setIsExpanded(!isExpanded)} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto', pt: 2 }}>
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
                <Link component={RouterLink} to={`/posts/detail?topicId=${comment.topicId}&postId=${comment.postId}`} sx={{ fontWeight: 'medium' }}>
                    {comment.postTitle || 'Không có tiêu đề'}
                </Link>
            </Box>
        </Stack>
        <Box sx={{ mt: 'auto', pt: 2, textAlign: 'right' }}>
            <Link
                component={RouterLink}
                to={`/posts/detail?topicId=${comment.topicId}&postId=${comment.postId}#comment-${comment._id}`}
                sx={{ fontWeight: 'bold' }}
            >
                Xem chi tiết
            </Link>
        </Box>
    </ActivityCard>
);

// Card for Like activities (Likes Received)
const LikeActivityCard = ({ like, currentUser }) => {
    const navigate = useNavigate();

    const isSelfLike = currentUser && like.liker?._id === currentUser._id;

    const handleLikerClick = () => {
        if (like.liker?._id && !isSelfLike) {
            navigate(`/profile/${like.liker._id}`);
        }
    };

    return (
        <ActivityCard>
            <Stack direction="row" spacing={2} alignItems="center">
                <FavoriteIcon color="error" />
                <Box flexGrow={1}>
                    <Typography variant="body1">
                        {isSelfLike ? (
                            "Bạn đã thích bài viết của bạn"
                        ) : (
                            <>
                                <Link
                                    component="span"
                                    onClick={handleLikerClick}
                                    sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'primary.main' }}
                                >
                                    {like.liker?.fullName || 'Một người dùng'}
                                </Link>
                                {' đã thích bài viết của bạn'}
                            </>
                        )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(like.createdAt)}
                    </Typography>
                </Box>
            </Stack>
            <Box sx={{ my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    <Link component={RouterLink} to={`/posts/detail?topicId=${like.topicId}&postId=${like.postId}`} sx={{ fontWeight: 'medium' }}>
                        {like.postTitle || 'Nội dung không có sẵn'}
                    </Link>
                </Typography>
            </Box>
            <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                <Link
                    component={RouterLink}
                    to={`/posts/detail?topicId=${like.topicId}&postId=${like.postId}`}
                    sx={{ fontWeight: 'bold' }}
                >
                    Xem bài viết
                </Link>
            </Box>
        </ActivityCard>
    );
};

const UserActivity = ({ userId, currentUser, activityVisibility }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState({ posts: [], comments: [], likes: [] });
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

    const tabConfig = useMemo(() => ({
        posts: {
            key: 'posts',
            label: `Bài viết`,
            icon: <PostAddIcon />,
            data: sortedActivities.posts,
            card: PostActivityCard,
            emptyIcon: <ArticleIcon sx={{ fontSize: 60 }} />,
            emptyMessage: "Người dùng này chưa có bài viết nào.",
        },
        comments: {
            key: 'comments',
            label: `Bình luận`,
            icon: <ChatBubbleOutlineIcon />,
            data: sortedActivities.comments,
            card: CommentActivityCard,
            emptyIcon: <CommentIcon sx={{ fontSize: 60 }} />,
            emptyMessage: "Chưa tìm thấy bình luận nào.",
        },
        likes: {
            key: 'likes',
            label: `Lượt thích nhận được`,
            icon: <FavoriteIcon />,
            data: sortedActivities.likes,
            card: LikeActivityCard,
            emptyIcon: <FavoriteIcon sx={{ fontSize: 60 }} />,
            emptyMessage: "Chưa có lượt thích nào được ghi nhận.",
        },
    }), [sortedActivities]);

    const visibleTabs = useMemo(() => {
        const defaultVisibility = { posts: true, comments: true, likes: true };
        const visibility = activityVisibility || defaultVisibility;
        return Object.values(tabConfig).filter(tab => visibility[tab.key] ?? true);
    }, [tabConfig, activityVisibility]);

    const [activeTab, setActiveTab] = useState(visibleTabs.length > 0 ? visibleTabs[0].key : null);

    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.find(t => t.key === activeTab)) {
            setActiveTab(visibleTabs[0].key);
        } else if (visibleTabs.length === 0) {
            setActiveTab(null);
        }
    }, [visibleTabs, activeTab]);

    const renderContent = () => {
        if (loading) {
            return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }

        if (!activeTab) {
            return <EmptyState icon={<ArticleIcon sx={{ fontSize: 60 }} />} message="Không có hoạt động nào được hiển thị." />;
        }

        const currentTabData = tabConfig[activeTab];
        if (!currentTabData) return null;

        const { data: items, card: CardComponent, emptyIcon, emptyMessage } = currentTabData;

        if (items.length === 0) {
            return <EmptyState icon={emptyIcon} message={emptyMessage} />;
        }

        return (
            <Stack spacing={3} sx={{ pt: 3, alignItems: 'center' }}>
                {items.map(item => (
                    <Box key={item._id} sx={{ width: { xs: '100%', sm: '90%', md: '80%' } }}>
                        <CardComponent
                            {...{ [CardComponent.name.replace('ActivityCard', '').toLowerCase()]: item }}
                            currentUser={currentUser}
                        />
                    </Box>
                ))}
            </Stack>
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
                    {visibleTabs.length > 0 ? (
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
                            {visibleTabs.map(tab => (
                                <Tab
                                    key={tab.key}
                                    value={tab.key}
                                    icon={tab.icon}
                                    label={`${tab.label} (${tab.data.length})`}
                                />
                            ))}
                        </Tabs>
                    ) : (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Người dùng đã ẩn tất cả các hoạt động.
                            </Typography>
                        </Box>
                    )}

                    {visibleTabs.length > 0 && (
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
                    )}
                </Stack>
            </Paper>

            {renderContent()}
        </Box>
    );
};

export default UserActivity;
