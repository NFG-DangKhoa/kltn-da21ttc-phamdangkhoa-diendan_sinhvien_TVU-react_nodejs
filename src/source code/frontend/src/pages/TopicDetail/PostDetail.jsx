import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, Divider, useTheme, Card, CardContent, CardMedia,
    Menu, MenuItem, CircularProgress, Rating, Container,
    Paper, Chip, Avatar, Stack, Fab, Tooltip,
    Skeleton, Badge, LinearProgress, Select, FormControl, InputLabel
} from '@mui/material';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import TopicIcon from '@mui/icons-material/Topic';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import parse, { domToReact, attributesToProps } from 'html-react-parser';
import slugify from 'slugify';
import TableOfContents from '../../components/TableOfContents';


import CommentDialog from './CenterColumn/CommentDialog';
import LikeDialog from './CenterColumn/LikeDialog';
import RatingDialog from './CenterColumn/RatingDialog';
import PostForm from './CenterColumn/PostForm';
import PostDetailSkeleton from '../../components/PostDetailSkeleton';
import { ThemeContext } from '../../context/ThemeContext';
import usePostDetail from './usePostDetail';
import { AuthContext } from '../../context/AuthContext';

const constructUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `http://localhost:5000${path}`;
};

// Helper function to recursively extract text content from nodes for slug generation
const getTextContent = (nodes) => {
    let text = '';
    if (nodes) {
        for (const node of nodes) {
            if (node.type === 'text') {
                text += node.data;
            } else if (node.type === 'tag' && node.children) {
                text += getTextContent(node.children);
            }
        }
    }
    return text;
};


// Related posts will be fetched from API

const PostDetail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const topicId = searchParams.get('topicId');
    const postId = searchParams.get('postId');

    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const darkMode = mode === 'dark';

    // State for editing post
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState(null);

    // State for Rating Dialog
    const [openRatingDialog, setOpenRatingDialog] = useState(false);

    // New states for enhanced UI
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [readingProgress, setReadingProgress] = useState(0);
    const [estimatedReadTime, setEstimatedReadTime] = useState(0);
    const [topicInfo, setTopicInfo] = useState(null);
    const [authorInfo, setAuthorInfo] = useState(null);
    const [sortOrder, setSortOrder] = useState('latest');

    const {
        postDetail,
        setPostDetail, // Kept this if you need to update postDetail directly sometimes
        comments,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
        handleDeletePost,
        averageRating,
        totalRatings,
        userRating,
        allRatings,
        handleRatePost,
        // loading, // Can be passed from usePostDetail for more granular control
        // error
    } = usePostDetail(topicId, postId, user);

    const [openLikes, setOpenLikes] = useState(false);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Used for CommentDialog

    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const contentRef = useRef(null);

    const parseOptions = {
        replace: domNode => {
            if (domNode.type === 'tag' && /h[1-6]/.test(domNode.name)) {
                const textContent = getTextContent(domNode.children);
                if (textContent) {
                    const slug = slugify(textContent, { lower: true, strict: true });
                    const props = attributesToProps(domNode.attribs);
                    props.id = slug;

                    return React.createElement(
                        domNode.name,
                        props,
                        domToReact(domNode.children, parseOptions)
                    );
                }
            }
            return undefined;
        }
    };

    const [showReplies, setShowReplies] = useState({});

    const [anchorEl, setAnchorEl] = useState(null);
    const [postToEditOrDelete, setPostToEditOrDelete] = useState(null);

    const [anchorElRelated, setAnchorElRelated] = useState(null);
    const [postToEditOrDeleteRelated, setPostToEditOrDeleteRelated] = useState(null);

    // Handle opening the menu for edit/delete
    const handleClickMenu = useCallback((event) => {
        setAnchorEl(event.currentTarget);
        setPostToEditOrDelete(postDetail);
    }, [postDetail]);

    // Handle closing the menu
    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setPostToEditOrDelete(null);
    }, []);

    // Handle deleting the post
    const handleDeleteClick = useCallback(async () => {
        if (!postToEditOrDelete) return;
        const success = await handleDeletePost(postToEditOrDelete._id);
        if (success) {
            handleCloseMenu();
            navigate(-1); // Navigate back after deletion
        }
    }, [postToEditOrDelete, handleDeletePost, handleCloseMenu, navigate]);

    // Function to open the post edit dialog
    const handleEditPost = useCallback(() => {
        handleCloseMenu();
        if (postDetail) {
            setCurrentEditingPost(postDetail);
            setIsEditingPost(true);
        }
    }, [handleCloseMenu, postDetail]);

    // Function to handle updated post submission from PostForm
    const handleUpdatePostSubmit = async (updatedPostData) => {
        try {
            const token = localStorage.getItem('token');
            // Assuming currentEditingPost._id is available
            await axios.put(`http://localhost:5000/api/posts/${currentEditingPost._id}`, updatedPostData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // The `usePostDetail` hook should handle updating the postDetail state via socket events.
            alert('Bài viết đã được cập nhật thành công!');
            setIsEditingPost(false);
            setCurrentEditingPost(null);
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
            alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
        }
    };

    // Function to close the post edit dialog
    const handleCloseEditMode = useCallback(() => {
        setIsEditingPost(false);
        setCurrentEditingPost(null);
    }, []);

    // Handle opening the menu for related posts
    const handleClickMenuRelated = useCallback((event, post) => {
        event.stopPropagation(); // Prevent card click
        setAnchorElRelated(event.currentTarget);
        setPostToEditOrDeleteRelated(post);
    }, []);

    // Handle closing the menu for related posts
    const handleCloseMenuRelated = useCallback(() => {
        setAnchorElRelated(null);
        setPostToEditOrDeleteRelated(null);
    }, []);

    // Handle deleting a related post
    const handleDeleteClickRelated = useCallback(async () => {
        if (!postToEditOrDeleteRelated) return;
        const success = await handleDeletePost(postToEditOrDeleteRelated.id);
        if (success) {
            handleCloseMenuRelated();
            // Remove the deleted post from relatedPosts state
            setRelatedPosts(prev => prev.filter(p => p.id !== postToEditOrDeleteRelated.id));
            alert('Bài viết liên quan đã được xóa thành công!');
        }
    }, [postToEditOrDeleteRelated, handleDeletePost, handleCloseMenuRelated]);

    // Handle editing a related post
    const handleEditPostRelated = useCallback(async () => {
        handleCloseMenuRelated();
        if (postToEditOrDeleteRelated) {
            try {
                // Fetch full post details before editing
                const response = await axios.get(`http://localhost:5000/api/posts/${postToEditOrDeleteRelated.id}`);
                const fullPostDetails = response.data.post; // Assuming the API returns { post: {...} }
                setCurrentEditingPost(fullPostDetails);
                setIsEditingPost(true);
            } catch (error) {
                console.error('Error fetching full post details for editing:', error);
                alert('Không thể tải chi tiết bài viết để chỉnh sửa.');
            }
        }
    }, [postToEditOrDeleteRelated, handleCloseMenuRelated]);

    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    // Define helper functions first
    const calculateReadTime = useCallback((content) => {
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }, []);

    const handleScroll = useCallback(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        setReadingProgress(Math.min(scrollPercent, 100));
    }, []);

    // Calculate reading time when post loads
    useEffect(() => {
        if (postDetail?.content) {
            const readTime = calculateReadTime(postDetail.content);
            setEstimatedReadTime(readTime);
        }
    }, [postDetail, calculateReadTime]);

    // Add scroll listener for reading progress
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Scroll to anchor (comment) when page loads with hash
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#comment-') && postDetail && comments.length > 0) {
            // Extract comment ID from hash
            const commentId = hash.replace('#comment-', '');

            // Open comments dialog first
            setSelectedPost(postDetail);
            setOpenComments(true);

            // Wait for dialog to open and render, then scroll to comment
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    // Highlight the comment briefly
                    element.style.backgroundColor = theme.palette.primary.main + '20';
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                    }, 3000);
                }
            }, 1500); // Longer delay for dialog to render
        }
    }, [postDetail, comments, theme.palette.primary.main]);

    // Fetch and sort related posts
    useEffect(() => {
        const fetchAndSortRelatedPosts = async () => {
            if (!topicId || !postId) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                const allPosts = response.data || [];

                // Filter out the current post
                const otherPosts = allPosts.filter(post => post._id !== postId);

                // Sort the posts based on the selected order
                const sortedPosts = otherPosts.sort((a, b) => {
                    switch (sortOrder) {
                        case 'popular':
                            // Simple popularity: likes + views
                            return (b.likeCount + b.views) - (a.likeCount + a.views);
                        case 'oldest':
                            return new Date(a.createdAt) - new Date(b.createdAt);
                        case 'latest':
                        default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });

                // Map sorted posts to the required format
                const formattedPosts = sortedPosts.slice(0, 8).map(post => {
                    let thumbnail = null;
                    if (post.content) {
                        const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/);
                        thumbnail = imgMatch ? imgMatch[1] : null;
                    }
                    return {
                        id: post._id,
                        title: post.title,
                        excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '',
                        author: post.authorId?.fullName || 'Ẩn danh',
                        authorId: post.authorId, // Thêm authorId vào đây
                        publishDate: new Date(post.createdAt).toLocaleDateString('vi-VN'),
                        likes: post.likeCount || 0,
                        comments: post.commentCount || 0,
                        views: post.views || 0,
                        thumbnail: thumbnail,
                        link: `/posts/detail?topicId=${topicId}&postId=${post._id}`
                    };
                });

                setRelatedPosts(formattedPosts);

                // Find current post index for navigation (optional, might need adjustment)
                const currentIndex = allPosts.findIndex(post => post._id === postId);
                setCurrentPostIndex(currentIndex >= 0 ? currentIndex : 0);

            } catch (error) {
                console.error('Error fetching or sorting related posts:', error);
                setRelatedPosts([]);
            }
        };

        fetchAndSortRelatedPosts();
    }, [topicId, postId, sortOrder]);

    // useEffect to apply styles to post content and images
    useEffect(() => {
        if (!postDetail || !contentRef.current) return;

        const contentElement = contentRef.current;
        const images = contentElement.querySelectorAll('img');

        images.forEach(img => {
            // Preserve original dimensions if specified, otherwise make responsive
            const originalWidth = img.getAttribute('width');
            const originalHeight = img.getAttribute('height');
            const hasOriginalDimensions = originalWidth || originalHeight;

            Object.assign(img.style, {
                maxWidth: hasOriginalDimensions ? 'none' : '100%',
                width: originalWidth ? `${originalWidth}px` : (hasOriginalDimensions ? 'auto' : '100%'),
                height: originalHeight ? `${originalHeight}px` : 'auto',
                borderRadius: '10px',
                marginTop: '20px',
                marginBottom: '20px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                objectFit: 'contain',
                imageRendering: 'auto',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
            });
            img.setAttribute('loading', 'lazy');
            img.onclick = () => {
                setModalImageSrc(img.src);
                setOpenImageModal(true);
            };
        });

        const updateContentStyles = () => {
            const elements = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, strong, em, pre, code, ul, ol, li, a, blockquote');
            elements.forEach(el => {
                if (el.tagName === 'A') {
                    el.style.color = mode === 'dark' ? '#90caf9' : '#1976d2';
                } else if (el.tagName === 'BLOCKQUOTE') {
                    el.style.borderLeft = mode === 'dark' ? '4px solid #666' : '4px solid #ccc';
                    el.style.color = mode === 'dark' ? '#aaa' : '#555';
                } else if (el.tagName === 'PRE') {
                    el.style.backgroundColor = mode === 'dark' ? '#333' : '#f4f4f4';
                    el.style.color = mode === 'dark' ? '#eee' : '#333';
                    el.style.border = mode === 'dark' ? '1px solid #444' : '1px solid #ddd';
                } else if (el.tagName === 'CODE') {
                    el.style.backgroundColor = mode === 'dark' ? '#444' : '#f0f0f0';
                    el.style.color = mode === 'dark' ? '#ffb300' : '#d81b60';
                } else {
                    el.style.color = mode === 'dark' ? '#d0d0d0' : '#333333';
                }
            });
        };
        updateContentStyles();

        return () => {
            images.forEach(img => {
                img.onclick = null;
                img.onmouseenter = null;
                img.onmouseleave = null;
            });
        };
    }, [postDetail, mode]);

    const handleOpenLikes = useCallback(() => {
        setOpenLikes(true);
    }, []);

    const handleCloseLikes = useCallback(() => {
        setOpenLikes(false);
    }, []);

    const handleOpenComments = useCallback((post) => {
        setSelectedPost(post);
        setOpenComments(true);
    }, []);

    const handleCloseComments = useCallback(() => {
        setOpenComments(false);
        setSelectedPost(null);
    }, []);

    const handleCloseImageModal = useCallback(() => {
        setOpenImageModal(false);
        setModalImageSrc('');
    }, []);

    // Function to open the Rating Dialog
    const handleOpenRating = useCallback(() => {
        if (!user || !user._id) {
            alert('Bạn cần đăng nhập để đánh giá bài viết.');
            return;
        }
        setOpenRatingDialog(true);
    }, [user]);

    // Function to close the Rating Dialog
    const handleCloseRating = useCallback(() => {
        setOpenRatingDialog(false);
    }, []);

    // Function to handle rating submission, passed to RatingDialog
    const handleRatingSubmit = useCallback(async (postId, userId, rating) => {
        console.log("Attempting to submit rating from PostDetail for postId:", postId, "with rating:", rating);
        try {
            await handleRatePost(postId, userId, rating);
            console.log("Rating submitted successfully from PostDetail for postId:", postId);
            // Rating states will be updated via Socket.IO, no explicit update here
        } catch (error) {
            console.error("Error submitting rating from PostDetail (caught by PostDetail):", error);
            throw error; // Rethrow to RatingDialog for its error handling
        }
    }, [handleRatePost]);

    // New handler functions
    const handleBookmark = useCallback(() => {
        setIsBookmarked(!isBookmarked);
        // TODO: Implement bookmark API call
    }, [isBookmarked]);

    const handleShare = useCallback((event) => {
        setShareMenuAnchor(event.currentTarget);
    }, []);

    const handleCloseShareMenu = useCallback(() => {
        setShareMenuAnchor(null);
    }, []);

    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        handleCloseShareMenu();
        // TODO: Show success message
    }, [handleCloseShareMenu]);



    // Navigation between posts
    const handlePreviousPost = useCallback(() => {
        if (currentPostIndex > 0) {
            const prevPost = relatedPosts[currentPostIndex - 1];
            window.location.href = prevPost.link;
        }
    }, [currentPostIndex, relatedPosts]);

    const handleNextPost = useCallback(() => {
        if (currentPostIndex < relatedPosts.length - 1) {
            const nextPost = relatedPosts[currentPostIndex + 1];
            window.location.href = nextPost.link;
        }
    }, [currentPostIndex, relatedPosts]);


    // Loading and Error States
    if (!postDetail && (topicId && postId)) {
        return <PostDetailSkeleton />;
    }

    if (!postDetail) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 64px)',
                width: '65vw',
                ml: 8,
                mt: 10,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2
            }}>
                <Typography variant="h6">Không tìm thấy bài viết hoặc có lỗi xảy ra.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: darkMode ? '#18191a' : '#f0f2f5' }}>
            {/* Reading Progress Bar */}
            <LinearProgress
                variant="determinate"
                value={readingProgress}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                    height: 3,
                    backgroundColor: 'transparent',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.primary.main
                    }
                }}
            />

            {/* Global Breadcrumb Navigation */}
            <Box>
                <BreadcrumbNavigation
                    topicName={postDetail?.topicId?.name}
                    postTitle={postDetail?.title}
                    darkMode={darkMode}
                    key={`${postDetail?.topicId?.name}-${postDetail?.title}`} // Force re-render when data changes
                />
            </Box>

            {/* Seamless Content Container */}
            <Box sx={{
                backgroundColor: darkMode ? '#242526' : '#fff',
                minHeight: '100vh',
                mt: '20px', // Margin-top để không bị che bởi header + breadcrumb
                pb: 6,
                width: '100%',
                overflow: 'visible'
            }}>
                <Container maxWidth="xl" sx={{ height: 'auto' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 3,
                            width: '100%',
                            minHeight: 'auto',
                            '@media (max-width: 899px)': {
                                flexDirection: 'column'
                            }
                        }}
                    >
                        {/* Main Content - Reduced to 70% Width */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '70%' },
                                minWidth: { md: '70%' },
                                maxWidth: { md: '70%' },
                                flex: 'none',
                                height: 'auto',
                                minHeight: 'auto'
                            }}
                        >
                            <Box sx={{
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 2,
                                overflow: 'visible',
                                height: 'auto',
                                minHeight: 'auto',
                                maxHeight: 'none',
                                boxShadow: darkMode
                                    ? '0 2px 8px rgba(0,0,0,0.3)'
                                    : '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                {/* Main Article Content - Seamless */}
                                <Box sx={{
                                    mb: 4,
                                    height: 'auto',
                                    minHeight: 'auto',
                                    maxHeight: 'none',
                                    overflow: 'visible'
                                }}>
                                    {/* Article Header - Enhanced */}
                                    <Box sx={{
                                        p: { xs: 3, md: 5 },
                                        pb: 3,
                                        background: darkMode
                                            ? 'linear-gradient(135deg, #242526 0%, #2d2e30 100%)'
                                            : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                                        borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
                                        position: 'relative' // Thêm thuộc tính này
                                    }}>
                                        {/* Article Title - Larger and More Prominent */}
                                        <Typography
                                            variant="h2"
                                            component="h1"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 800,
                                                lineHeight: 1.1,
                                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                mb: 4,
                                                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                                                textAlign: 'left'
                                            }}
                                        >
                                            {postDetail.title}
                                        </Typography>

                                        {/* Edit Button for Author */}
                                        {user && (user._id === postDetail.authorId?._id || user.role === 'admin') && (
                                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls="long-menu"
                                                    aria-haspopup="true"
                                                    onClick={handleClickMenu}
                                                    sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    id="long-menu"
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl) && postToEditOrDelete?._id === postDetail._id}
                                                    onClose={handleCloseMenu}
                                                    PaperProps={{
                                                        style: {
                                                            maxHeight: 48 * 4.5,
                                                            width: '20ch',
                                                            backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                                                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={handleEditPost} sx={{
                                                        '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                                    }}>
                                                        Chỉnh sửa
                                                    </MenuItem>
                                                    <MenuItem onClick={handleDeleteClick} sx={{
                                                        color: 'red',
                                                        '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                                    }}>
                                                        Xóa
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        )}

                                        {/* Article Meta - Enhanced */}
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                                            <Box display="flex" alignItems="center" gap={3}>
                                                <Tooltip title="Xem trang cá nhân">
                                                    <Box
                                                        onClick={() => navigate(`/profile/${postDetail.authorId?._id}`)}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <Avatar
                                                            src={constructUrl(postDetail.authorId?.avatarUrl)}
                                                            sx={{
                                                                width: 64,
                                                                height: 64,
                                                                border: `3px solid ${theme.palette.primary.main}`,
                                                                boxShadow: darkMode
                                                                    ? '0 4px 12px rgba(0,0,0,0.3)'
                                                                    : '0 4px 12px rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            {postDetail.authorId?.fullName?.[0] || 'U'}
                                                        </Avatar>
                                                    </Box>
                                                </Tooltip>
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        sx={{
                                                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                            mb: 0.5,
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                        onClick={() => navigate(`/profile/${postDetail.authorId?._id}`)}
                                                    >
                                                        {postDetail.authorId?.fullName || 'Ẩn danh'}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                                        <Chip
                                                            icon={<AccessTimeIcon />}
                                                            label={new Date(postDetail.createdAt).toLocaleDateString('vi-VN')}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: darkMode ? '#3a3b3c' : '#ddd',
                                                                color: darkMode ? '#b0b3b8' : 'text.secondary'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>

                                        </Box>

                                        {/* Tags and Image Controls */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                            {/* Tags */}
                                            {postDetail.tags && postDetail.tags.length > 0 && (
                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                    {postDetail.tags.map((tag, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={tag}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: darkMode ? '#3a3b3c' : '#ddd',
                                                                color: darkMode ? '#b0b3b8' : 'text.secondary',
                                                                '&:hover': {
                                                                    backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5'
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}


                                        </Box>
                                    </Box>

                                    <Divider sx={{ borderColor: darkMode ? '#3a3b3c' : '#e0e0e0' }} />

                                    {/* Table of Contents */}
                                    {postDetail.content && (
                                        <Box sx={{ p: { xs: 3, md: 4 } }}>
                                            <TableOfContents content={postDetail.content} />
                                        </Box>
                                    )}


                                    {/* Article Content - Enhanced */}
                                    <Box sx={{
                                        p: { xs: 3, md: 5 },
                                        pt: 4,
                                        pb: 4, // Padding-bottom bình thường vì action buttons không sticky nữa
                                        width: '100%',
                                        height: 'auto',
                                        minHeight: 'auto',
                                        maxHeight: 'none',
                                        overflow: 'visible',
                                        overflowY: 'visible',
                                        overflowX: 'visible',
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        {/* Article Body - Enhanced Typography */}
                                        <Typography
                                            ref={contentRef}
                                            variant="body1"
                                            component="div"
                                            sx={{
                                                lineHeight: 1.8,
                                                fontSize: { xs: '1rem', md: '1.125rem' },
                                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                maxWidth: '100%',
                                                width: '100%',
                                                height: 'auto',
                                                minHeight: 'auto',
                                                maxHeight: 'none',
                                                overflow: 'visible',
                                                overflowY: 'visible',
                                                overflowX: 'visible',
                                                display: 'block',
                                                position: 'relative',
                                                zIndex: 1,
                                                '& p': {
                                                    mb: 3,
                                                    textAlign: 'justify',
                                                    textIndent: '1.5em'
                                                },
                                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                    mt: 4,
                                                    mb: 2.5,
                                                    fontWeight: 700,
                                                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                    lineHeight: 1.3,
                                                    scrollMarginTop: '100px' // Offset for fixed header
                                                },
                                                '& h1': { fontSize: '2.5rem' },
                                                '& h2': { fontSize: '2rem' },
                                                '& h3': { fontSize: '1.5rem' },
                                                '& img': {
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    borderRadius: 2,
                                                    my: 3,
                                                    display: 'block',
                                                    margin: '20px auto',
                                                    objectFit: 'contain',
                                                    boxShadow: darkMode
                                                        ? '0 4px 20px rgba(0,0,0,0.3)'
                                                        : '0 4px 20px rgba(0,0,0,0.1)',
                                                    cursor: 'pointer',
                                                },
                                                '& blockquote': {
                                                    borderLeft: `5px solid ${theme.palette.primary.main}`,
                                                    pl: 3,
                                                    py: 2,
                                                    my: 3,
                                                    backgroundColor: darkMode ? '#2a2b2c' : '#f8f9fa',
                                                    borderRadius: 1,
                                                    fontStyle: 'italic',
                                                    fontSize: '1.1em',
                                                    position: 'relative',
                                                    '&::before': {
                                                        content: '"""',
                                                        fontSize: '3rem',
                                                        color: theme.palette.primary.main,
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        left: '10px',
                                                        opacity: 0.3
                                                    }
                                                },
                                                '& code': {
                                                    backgroundColor: darkMode ? '#3a3b3c' : '#f1f3f4',
                                                    padding: '3px 8px',
                                                    borderRadius: 1,
                                                    fontSize: '0.9em',
                                                    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                                                    border: `1px solid ${darkMode ? '#555' : '#e0e0e0'}`
                                                },
                                                '& pre': {
                                                    backgroundColor: darkMode ? '#2d2e30' : '#f8f9fa',
                                                    p: 3,
                                                    borderRadius: 2,
                                                    overflow: 'auto',
                                                    my: 3,
                                                    border: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                                    '& code': {
                                                        backgroundColor: 'transparent',
                                                        padding: 0,
                                                        border: 'none'
                                                    }
                                                },
                                                '& ul, & ol': {
                                                    pl: 3,
                                                    my: 2,
                                                    '& li': {
                                                        mb: 1,
                                                        lineHeight: 1.6
                                                    }
                                                },
                                                '& a': {
                                                    color: theme.palette.primary.main,
                                                    textDecoration: 'none',
                                                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: '#fff',
                                                        padding: '2px 4px',
                                                        borderRadius: 1
                                                    }
                                                }
                                            }}
                                        >
                                            {postDetail.content && parse(postDetail.content, parseOptions)}
                                        </Typography>
                                    </Box>

                                    {/* Article Interaction Section - Consistent with PostCard */}
                                    <Box sx={{ mt: 2, p: { xs: 1, md: 2 } }}>
                                        {/* Stats Display */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleOpenLikes}>
                                                <FavoriteIcon sx={{ color: 'red', fontSize: '1rem' }} />
                                                <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                                    {currentLikeCount || 0}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b', cursor: 'pointer' }} onClick={() => handleOpenComments(postDetail)}>
                                                    {currentCommentCount || 0} bình luận
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleOpenRating}>
                                                    <Rating
                                                        name="read-only"
                                                        value={averageRating}
                                                        precision={0.5}
                                                        readOnly
                                                        size="small"
                                                        emptyIcon={<StarBorderIcon sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)' }} />}
                                                    />
                                                    <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                                        ({totalRatings || 0})
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />

                                        {/* Main Action Buttons */}
                                        <Box display="flex" justifyContent="space-around">
                                            <Button
                                                fullWidth
                                                startIcon={isLikedByUser ? <FavoriteIcon sx={{ color: 'red' }} /> : <FavoriteBorderIcon />}
                                                sx={{
                                                    color: isLikedByUser ? 'red' : (darkMode ? '#b0b3b8' : '#65676b'),
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                                                }}
                                                onClick={handleLikeToggle}
                                            >
                                                Thích
                                            </Button>
                                            <Button
                                                fullWidth
                                                startIcon={<ChatBubbleOutlineIcon />}
                                                sx={{
                                                    color: darkMode ? '#b0b3b8' : '#65676b',
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                                                }}
                                                onClick={() => handleOpenComments(postDetail)}
                                            >
                                                Bình luận
                                            </Button>
                                            <Button
                                                fullWidth
                                                startIcon={<StarBorderIcon />}
                                                sx={{
                                                    color: darkMode ? '#b0b3b8' : '#65676b',
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                                                }}
                                                onClick={handleOpenRating}
                                            >
                                                Đánh giá
                                            </Button>
                                        </Box>
                                        {/* Edit Button for Author */}
                                        {user && (user._id === postDetail.authorId?._id || user.role === 'admin') && (
                                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls="long-menu"
                                                    aria-haspopup="true"
                                                    onClick={handleClickMenu}
                                                    sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    id="long-menu"
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl) && postToEditOrDelete?._id === postDetail._id}
                                                    onClose={handleCloseMenu}
                                                    PaperProps={{
                                                        style: {
                                                            maxHeight: 48 * 4.5,
                                                            width: '20ch',
                                                            backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                                                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={handleEditPost} sx={{
                                                        '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                                    }}>
                                                        Chỉnh sửa
                                                    </MenuItem>
                                                    <MenuItem onClick={handleDeleteClick} sx={{
                                                        color: 'red',
                                                        '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                                    }}>
                                                        Xóa
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Comments Section - Seamless */}
                                    <Box sx={{ mt: 4, p: 4, borderTop: darkMode ? '1px solid #3a3b3c' : '1px solid #e0e0e0' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                            <Typography variant="h5" fontWeight="bold">
                                                💬 Bình luận ({currentCommentCount})
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleOpenComments(postDetail)}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Viết bình luận
                                            </Button>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary">
                                            Nhấn vào nút "Viết bình luận" để tham gia thảo luận về bài viết này.
                                        </Typography>
                                    </Box>

                                    {/* Navigation between posts */}
                                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            startIcon={<NavigateBeforeIcon />}
                                            onClick={handlePreviousPost}
                                            disabled={currentPostIndex === 0}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Bài trước
                                        </Button>
                                        <Button
                                            endIcon={<NavigateNextIcon />}
                                            onClick={handleNextPost}
                                            disabled={currentPostIndex >= relatedPosts.length - 1}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Bài tiếp theo
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Sidebar - Increased to 30% Width */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '30%' },
                                minWidth: { md: '30%' },
                                maxWidth: { md: '30%' },
                                flex: 'none'
                            }}
                        >
                            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, mb: { xs: 3, md: 0 } }}>
                                <Card sx={{ mb: 3, backgroundColor: darkMode ? '#242526' : '#fff', boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                                📚 Bài viết liên quan
                                            </Typography>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel>Sắp xếp</InputLabel>
                                                <Select
                                                    value={sortOrder}
                                                    label="Sắp xếp"
                                                    onChange={(e) => setSortOrder(e.target.value)}
                                                >
                                                    <MenuItem value="latest">Mới nhất</MenuItem>
                                                    <MenuItem value="oldest">Cũ nhất</MenuItem>
                                                    <MenuItem value="popular">Phổ biến</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Stack spacing={3}>
                                            {relatedPosts.length > 0 ? (
                                                relatedPosts.map((relatedPost) => (
                                                    <Box
                                                        key={relatedPost.id}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: darkMode ? '1px solid #3a3b3c' : '1px solid #e0e0e0',
                                                            transition: 'all 0.2s ease',
                                                            backgroundColor: darkMode ? '#2a2b2c' : '#fafafa',
                                                            position: 'relative',
                                                            '&:hover': {
                                                                backgroundColor: darkMode ? '#3a3b3c' : '#f0f0f0',
                                                                borderColor: theme.palette.primary.main,
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                                                            }
                                                        }}
                                                        onClick={() => window.location.href = relatedPost.link}
                                                    >
                                                        {/* Removed the MoreVertIcon and Menu for related posts */}
                                                        <Box display="flex" alignItems="center">
                                                            {/* Thumbnail from content or placeholder */}
                                                            {relatedPost.thumbnail ? (
                                                                <Box
                                                                    sx={{
                                                                        width: 64,
                                                                        height: 48,
                                                                        borderRadius: 1.5,
                                                                        mr: 2,
                                                                        overflow: 'hidden',
                                                                        flexShrink: 0,
                                                                        boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={relatedPost.thumbnail}
                                                                        alt={relatedPost.title}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            // Fallback to placeholder if image fails to load
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.innerHTML = `
                                                                                <div style="
                                                                                    width: 100%;
                                                                                    height: 100%;
                                                                                    background-color: #f0f0f0;
                                                                                    display: flex;
                                                                                    align-items: center;
                                                                                    justify-content: center;
                                                                                    font-size: 0.7rem;
                                                                                    color: #999;
                                                                                ">📄</div>
                                                                            `;
                                                                        }}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        width: 64,
                                                                        height: 48,
                                                                        borderRadius: 1.5,
                                                                        mr: 2,
                                                                        bgcolor: darkMode ? '#3a3b3c' : 'grey.200',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '1rem',
                                                                        color: darkMode ? '#b0b3b8' : 'grey.500',
                                                                        flexShrink: 0,
                                                                        boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                                                    }}
                                                                >
                                                                    📄
                                                                </Box>
                                                            )}
                                                            <Box flex={1}>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight="bold"
                                                                    sx={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        lineHeight: 1.4,
                                                                        fontSize: '0.9rem',
                                                                        mb: 1,
                                                                        color: darkMode ? '#e4e6eb' : '#1c1e21'
                                                                    }}
                                                                >
                                                                    {relatedPost.title}
                                                                </Typography>
                                                                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                                        <ThumbUpIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                                            {relatedPost.likes}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                                            💬 {relatedPost.comments}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Chưa có bài viết liên quan khác trong chủ đề này
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box >

            {/* Floating Action Buttons */}
            < Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    zIndex: 1000
                }}
            >
                <Tooltip title="Scroll to top" placement="left">
                    <Fab
                        size="medium"
                        color="primary"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <NavigateBeforeIcon sx={{ transform: 'rotate(90deg)' }} />
                    </Fab>
                </Tooltip>

                <Tooltip title="Chia sẻ bài viết" placement="left">
                    <Fab
                        size="medium"
                        color="secondary"
                        onClick={handleShare}
                    >
                        <ShareIcon />
                    </Fab>
                </Tooltip>
            </Box >

            {/* Dialogs */}
            {/* Comment Dialog */}
            <CommentDialog
                open={openComments}
                onClose={handleCloseComments}
                post={postDetail}
                user={user}
                comments={comments}
                showReplies={showReplies}
                toggleReplies={toggleReplies}
                mode={mode}
            />

            {/* Like Dialog */}
            <LikeDialog
                open={openLikes}
                onClose={handleCloseLikes}
                likedUsers={currentLikedUsers}
                likeCount={currentLikeCount}
                darkMode={darkMode}
            />

            {/* Edit Post Dialog */}
            {
                isEditingPost && currentEditingPost && (
                    <Dialog
                        open={isEditingPost}
                        onClose={handleCloseEditMode}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                                boxShadow: theme.shadows[5],
                            }
                        }}
                    >
                        <DialogTitle sx={{
                            borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            Chỉnh sửa bài viết
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseEditMode}
                                sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 2 }}>
                            <PostForm
                                user={user}
                                newPost={currentEditingPost}
                                setNewPost={setCurrentEditingPost}
                                handlePostSubmit={handleUpdatePostSubmit}
                                isEditMode={true}
                            />
                        </DialogContent>
                    </Dialog>
                )
            }

            {/* Rating Dialog */}
            {
                postDetail && user && (
                    <RatingDialog
                        open={openRatingDialog}
                        onClose={handleCloseRating}
                        postId={postDetail._id}
                        userId={user._id}
                        currentRating={userRating}
                        onRatePost={handleRatingSubmit}
                        totalRatings={totalRatings}
                        allRatings={allRatings}
                        averageRating={averageRating}
                    />
                )
            }

            {/* Image Modal */}
            <Dialog
                open={openImageModal}
                onClose={handleCloseImageModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: darkMode ? '#242526' : '#fff',
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}` }}>
                    Xem ảnh
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseImageModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: darkMode ? '#b0b3b8' : 'text.secondary'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderColor: darkMode ? '#3a3b3c' : '#e0e0e0',
                    }}
                >
                    <img
                        src={modalImageSrc}
                        alt="Zoomed"
                        style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                    />
                </DialogContent>
            </Dialog>
        </Box >
    );
};

export default PostDetail;
