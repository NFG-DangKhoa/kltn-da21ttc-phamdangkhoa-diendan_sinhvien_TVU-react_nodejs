import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, Divider, useTheme, Card, CardContent, CardMedia,
    Menu, MenuItem, CircularProgress, Rating, Container,
    Paper, Chip, Avatar, Stack, Fab, Tooltip,
    Skeleton, Badge, LinearProgress
} from '@mui/material';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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

import CommentDialog from './CenterColumn/CommentDialog';
import LikeDialog from './CenterColumn/LikeDialog';
import RatingDialog from './CenterColumn/RatingDialog';
import PostForm from './CenterColumn/PostForm';
import PostDetailSkeleton from '../../components/PostDetailSkeleton';
import { ThemeContext } from '../../context/ThemeContext';
import usePostDetail from './usePostDetail';
import { AuthContext } from '../../context/AuthContext';

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

    const [showReplies, setShowReplies] = useState({});

    const [anchorEl, setAnchorEl] = useState(null);
    const [postToEditOrDelete, setPostToEditOrDelete] = useState(null);

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

    // Fetch related posts from same topic
    useEffect(() => {
        const fetchRelatedPosts = async () => {
            if (!topicId || !postId) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                const allPosts = response.data || [];

                // Filter out current post and get other posts from same topic
                const otherPosts = allPosts
                    .filter(post => post._id !== postId)
                    .slice(0, 8) // Limit to 8 related posts
                    .map(post => {
                        // Extract thumbnail from content (first image)
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
                            publishDate: new Date(post.createdAt).toLocaleDateString('vi-VN'),
                            likes: post.likeCount || 0,
                            comments: post.commentCount || 0,
                            views: post.views || 0,
                            thumbnail: thumbnail, // Add thumbnail from content
                            link: `/posts/detail?topicId=${topicId}&postId=${post._id}`
                        };
                    });

                setRelatedPosts(otherPosts);

                // Find current post index in the list for navigation
                const currentIndex = allPosts.findIndex(post => post._id === postId);
                setCurrentPostIndex(currentIndex >= 0 ? currentIndex : 0);

            } catch (error) {
                console.error('Error fetching related posts:', error);
                setRelatedPosts([]); // Set empty array on error
            }
        };

        fetchRelatedPosts();
    }, [topicId, postId]);

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
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
            });
            img.setAttribute('loading', 'lazy');
            img.onclick = () => {
                setModalImageSrc(img.src);
                setOpenImageModal(true);
            };
            img.onmouseenter = () => {
                img.style.transform = 'scale(1.015)';
                img.style.boxShadow = mode === 'dark' ? '0 4px 16px rgba(255,255,255,0.2)' : '0 4px 16px rgba(0,0,0,0.2)';
            };
            img.onmouseleave = () => {
                img.style.transform = 'scale(1)';
                img.style.boxShadow = mode === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
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
            <BreadcrumbNavigation
                topicName={postDetail?.topicId?.name}
                postTitle={postDetail?.title}
                darkMode={darkMode}
                key={`${postDetail?.topicId?.name}-${postDetail?.title}`} // Force re-render when data changes
            />

            {/* Seamless Content Container */}
            <Box sx={{
                backgroundColor: darkMode ? '#242526' : '#fff',
                minHeight: '100vh',
                pt: 2,
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
                        {/* Main Content - Absolute Fixed 75% Width */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '75%' },
                                minWidth: { md: '75%' },
                                maxWidth: { md: '75%' },
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
                                        borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`
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

                                        {/* Article Meta - Enhanced */}
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                                            <Box display="flex" alignItems="center" gap={3}>
                                                <Avatar
                                                    src={postDetail.authorId?.avatarUrl || postDetail.authorId?.avatar}
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
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        sx={{
                                                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                            mb: 0.5
                                                        }}
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
                                                        <Chip
                                                            label={`${estimatedReadTime} phút đọc`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: darkMode ? '#3a3b3c' : '#ddd',
                                                                color: darkMode ? '#b0b3b8' : 'text.secondary'
                                                            }}
                                                        />
                                                        <Chip
                                                            icon={<VisibilityIcon />}
                                                            label={`${postDetail.views || 0} lượt xem`}
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

                                            {/* Action Buttons */}
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Tooltip title={isBookmarked ? "Bỏ lưu" : "Lưu bài viết"}>
                                                    <IconButton onClick={handleBookmark} size="large">
                                                        {isBookmarked ?
                                                            <BookmarkIcon sx={{ color: theme.palette.primary.main }} /> :
                                                            <BookmarkBorderIcon />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chia sẻ">
                                                    <IconButton onClick={handleShare} size="large">
                                                        <ShareIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Menu
                                                    anchorEl={shareMenuAnchor}
                                                    open={Boolean(shareMenuAnchor)}
                                                    onClose={handleCloseShareMenu}
                                                >
                                                    <MenuItem onClick={handleCopyLink}>
                                                        Sao chép liên kết
                                                    </MenuItem>
                                                    <MenuItem onClick={handleCloseShareMenu}>
                                                        Chia sẻ lên Facebook
                                                    </MenuItem>
                                                    <MenuItem onClick={handleCloseShareMenu}>
                                                        Chia sẻ lên Twitter
                                                    </MenuItem>
                                                </Menu>
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

                                    {/* Article Content - Enhanced */}
                                    <Box sx={{
                                        p: { xs: 3, md: 5 },
                                        pt: 4,
                                        pb: 8, // Thêm padding-bottom lớn để tránh che nội dung cuối bởi vùng nút
                                        mb: 4, // Thêm margin-bottom để tạo khoảng cách
                                        width: '100%',
                                        height: 'auto',
                                        minHeight: 'auto',
                                        maxHeight: 'none',
                                        overflow: 'visible',
                                        overflowY: 'visible',
                                        overflowX: 'visible'
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
                                                    lineHeight: 1.3
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
                                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                        boxShadow: darkMode
                                                            ? '0 8px 30px rgba(0,0,0,0.4)'
                                                            : '0 8px 30px rgba(0,0,0,0.15)'
                                                    }
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
                                            dangerouslySetInnerHTML={{ __html: postDetail.content }}
                                        />
                                    </Box>

                                    {/* Article Interaction Section - Forum Style */}
                                    <Box sx={{
                                        background: darkMode
                                            ? 'linear-gradient(135deg, #2a2b2c 0%, #242526 100%)'
                                            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                        borderTop: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
                                        p: { xs: 3, md: 4 },
                                        mt: 4, // Thêm margin-top để tạo khoảng cách với nội dung
                                        position: 'relative',
                                        zIndex: 2, // Tăng z-index để đảm bảo không bị che khuất
                                        boxShadow: darkMode
                                            ? '0 -4px 20px rgba(0,0,0,0.3)'
                                            : '0 -4px 20px rgba(0,0,0,0.1)' // Thêm shadow để tách biệt
                                    }}>
                                        {/* Main Action Buttons - Centered Layout */}
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            gap={{ xs: 2, sm: 3, md: 4 }}
                                            mb={4}
                                            sx={{
                                                width: '100%',
                                                maxWidth: '700px',
                                                mx: 'auto',
                                                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                                '@media (max-width: 600px)': {
                                                    flexDirection: 'column',
                                                    gap: 2
                                                },
                                                '@media (min-width: 601px) and (max-width: 900px)': {
                                                    flexWrap: 'wrap',
                                                    gap: 2
                                                }
                                            }}
                                        >
                                            <Button
                                                variant={isLikedByUser ? "contained" : "outlined"}
                                                size="medium"
                                                startIcon={isLikedByUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                onClick={handleLikeToggle}
                                                sx={{
                                                    minWidth: 100,
                                                    py: 0.75,
                                                    px: 2,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: isLikedByUser ? '#fff' : (darkMode ? '#e4e6eb' : '#1c1e21'),
                                                    backgroundColor: isLikedByUser ? '#e91e63' : 'transparent',
                                                    borderColor: '#e91e63',
                                                    '&:hover': {
                                                        backgroundColor: '#e91e63',
                                                        color: '#fff',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                Thích ({currentLikeCount || 0})
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                startIcon={<ChatBubbleOutlineIcon />}
                                                onClick={() => handleOpenComments(postDetail)}
                                                sx={{
                                                    minWidth: 100,
                                                    py: 0.75,
                                                    px: 2,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                    borderColor: theme.palette.primary.main,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: '#fff',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: `0 4px 12px ${theme.palette.primary.main}22`
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                Bình luận ({currentCommentCount})
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                startIcon={<StarBorderIcon />}
                                                onClick={handleOpenRating}
                                                sx={{
                                                    minWidth: 100,
                                                    py: 0.75,
                                                    px: 2,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                    borderColor: '#ff9800',
                                                    '&:hover': {
                                                        backgroundColor: '#ff9800',
                                                        color: '#fff',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                Đánh giá
                                            </Button>
                                        </Box>

                                        {/* Stats Display */}
                                        <Box display="flex" justifyContent="center" gap={4} mb={0}>
                                            <Box textAlign="center">
                                                <Typography
                                                    variant="h4"
                                                    fontWeight="bold"
                                                    color="primary"
                                                    sx={{
                                                        cursor: currentLikeCount > 0 ? 'pointer' : 'default',
                                                        '&:hover': currentLikeCount > 0 ? {
                                                            textDecoration: 'underline',
                                                            transform: 'scale(1.05)'
                                                        } : {},
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={currentLikeCount > 0 ? () => setOpenLikes(true) : undefined}
                                                >
                                                    {currentLikeCount || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Lượt thích
                                                </Typography>
                                            </Box>
                                            <Box textAlign="center">
                                                <Typography variant="h4" fontWeight="bold" color="primary">
                                                    {currentCommentCount || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Bình luận
                                                </Typography>
                                            </Box>
                                            <Box textAlign="center">
                                                <Typography variant="h4" fontWeight="bold" color="primary">
                                                    {postDetail.views || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Lượt xem
                                                </Typography>
                                            </Box>
                                            <Box textAlign="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <Rating
                                                        value={averageRating || 0}
                                                        precision={0.1}
                                                        readOnly
                                                        size="small"
                                                    />
                                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                                        {averageRating ? averageRating.toFixed(1) : '0.0'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    ({totalRatings || 0} đánh giá)
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Liked Users Display */}
                                        {currentLikedUsers && currentLikedUsers.length > 0 && (
                                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    👍 Những người đã thích bài viết này:
                                                </Typography>
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    flexWrap="wrap"
                                                    gap={1}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: darkMode ? '1px solid #3a3b3c' : '1px solid #e0e0e0',
                                                        backgroundColor: darkMode ? '#2a2b2c' : '#f8f9fa',
                                                        '&:hover': {
                                                            backgroundColor: darkMode ? '#3a3b3c' : '#e9ecef',
                                                            borderColor: theme.palette.primary.main
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => setOpenLikes(true)}
                                                >
                                                    {currentLikedUsers.slice(0, 10).map((user, index) => (
                                                        <Tooltip
                                                            key={user._id}
                                                            title={user.fullName || 'Người dùng ẩn danh'}
                                                            placement="top"
                                                        >
                                                            <Avatar
                                                                src={user.avatarUrl || user.avatar}
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    border: `2px solid ${theme.palette.primary.main}`,
                                                                    marginLeft: index > 0 ? '-8px' : '0',
                                                                    zIndex: currentLikedUsers.length - index,
                                                                    '&:hover': {
                                                                        transform: 'scale(1.1)',
                                                                        zIndex: 999
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                {user.fullName?.[0] || 'U'}
                                                            </Avatar>
                                                        </Tooltip>
                                                    ))}
                                                    {currentLikedUsers.length > 10 && (
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                backgroundColor: theme.palette.primary.main,
                                                                color: '#fff',
                                                                fontSize: '0.75rem',
                                                                marginLeft: '-8px',
                                                                zIndex: 0
                                                            }}
                                                        >
                                                            +{currentLikedUsers.length - 10}
                                                        </Avatar>
                                                    )}
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 1,
                                                        display: 'block',
                                                        fontStyle: 'italic'
                                                    }}
                                                >
                                                    Nhấn để xem danh sách đầy đủ
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Edit Button for Author */}
                                        {user && user._id === postDetail.authorId?._id && (
                                            <>
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
                                            </>
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

                        {/* Sidebar - Absolute Fixed 25% Width */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '25%' },
                                minWidth: { md: '25%' },
                                maxWidth: { md: '25%' },
                                flex: 'none'
                            }}
                        >
                            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, mb: { xs: 3, md: 0 } }}>
                                <Card sx={{ mb: 3, backgroundColor: darkMode ? '#242526' : '#fff', boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: '1rem' }}>
                                            📚 Bài viết liên quan
                                        </Typography>
                                        <Stack spacing={2}>
                                            {relatedPosts.length > 0 ? (
                                                relatedPosts.slice(0, 8).map((relatedPost) => (
                                                    <Box
                                                        key={relatedPost.id}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            border: darkMode ? '1px solid #3a3b3c' : '1px solid #e0e0e0',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                backgroundColor: darkMode ? '#3a3b3c' : '#f8f9fa',
                                                                borderColor: theme.palette.primary.main
                                                            }
                                                        }}
                                                        onClick={() => window.location.href = relatedPost.link}
                                                    >
                                                        <Box display="flex" alignItems="center">
                                                            {/* Thumbnail from content or placeholder */}
                                                            {relatedPost.thumbnail ? (
                                                                <Box
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 36,
                                                                        borderRadius: 1,
                                                                        mr: 1.5,
                                                                        overflow: 'hidden',
                                                                        flexShrink: 0
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
                                                                        width: 48,
                                                                        height: 36,
                                                                        borderRadius: 1,
                                                                        mr: 1.5,
                                                                        bgcolor: 'grey.200',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.7rem',
                                                                        color: 'grey.500',
                                                                        flexShrink: 0
                                                                    }}
                                                                >
                                                                    📄
                                                                </Box>
                                                            )}
                                                            <Box flex={1}>
                                                                <Typography variant="body2" fontWeight="bold" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4, fontSize: '0.8rem', mb: 0.5 }}>
                                                                    {relatedPost.title}
                                                                </Typography>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                        <ThumbUpIcon sx={{ fontSize: 11, mr: 0.5 }} />
                                                                        {relatedPost.likes}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                        <VisibilityIcon sx={{ fontSize: 11, mr: 0.5 }} />
                                                                        {relatedPost.views}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                        💬 {relatedPost.comments}
                                                                    </Typography>
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