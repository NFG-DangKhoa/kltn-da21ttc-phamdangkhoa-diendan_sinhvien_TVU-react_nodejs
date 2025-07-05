import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, Divider, useTheme, Card, CardContent, CardMedia
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// IMPORT CÁC COMPONENT ĐẦU VÀO CỦA BẠN (nếu chúng ở file khác)
import CommentDialog from './CenterColumn/CommentDialog'; // Điều chỉnh đường dẫn nếu cần
import LikeDialog from './CenterColumn/LikeDialog';     // Điều chỉnh đường dẫn nếu cần


// Dữ liệu giả định cho Context (nếu bạn không chạy trong môi trường React thực tế có Context)
const ThemeContext = React.createContext({ mode: 'light' });
const AuthContext = React.createContext({ user: { id: 'user123', fullName: 'Người dùng hiện tại' } });


// Dữ liệu giả định cho hook usePostDetail
const usePostDetail = (topicId, postId, user) => {
    const [postDetail, setPostDetail] = useState(null);
    const [currentCommentCount, setCurrentCommentCount] = useState(0);
    const [currentLikeCount, setCurrentLikeCount] = useState(0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState([]);
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    useEffect(() => {
        if (postId === 'single-image-post-1') {
            const data = {
                id: 'single-image-post-1',
                title: 'Khám phá vẻ đẹp tiềm ẩn của Đà Lạt mộng mơ',
                authorId: {
                    fullName: 'Nguyễn Văn A',
                    avatar: 'https://via.placeholder.com/40/555555/FFFFFF?Text=NA'
                },
                // Tách URL ảnh ra khỏi nội dung chính
                imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzy9wO8tY7iTDhcLGDMQkPW-1Wl1TgaaRQVw&s',
                content: `
                    <p>
                        Đà Lạt, thành phố ngàn hoa, luôn là điểm đến hấp dẫn với du khách bởi khí hậu mát mẻ, cảnh quan thiên nhiên tuyệt đẹp và những công trình kiến trúc độc đáo. Trong chuyến hành trình gần đây, tôi đã có cơ hội khám phá những góc nhỏ bình yên và cảm nhận trọn vẹn vẻ đẹp tiềm ẩn của thành phố này.
                    </p>
                    <p>
                        Từ những đồi chè xanh mướt trải dài, đến những con dốc quanh co phủ đầy hoa dã quỳ, mỗi khoảnh khắc ở Đà Lạt đều mang đến những cảm xúc khó tả. Buổi sáng thức dậy trong làn sương mờ ảo, nhâm nhi tách cà phê nóng và ngắm nhìn khung cảnh yên bình là một trải nghiệm tuyệt vời.
                    </p>
                    <p>
                        Đừng quên ghé thăm Hồ Xuân Hương, nhà thờ Con Gà, hay dạo quanh chợ đêm Đà Lạt để thưởng thức những món ăn đặc sản và mua sắm quà lưu niệm độc đáo. Đà Lạt chắc chắn sẽ để lại trong bạn những kỷ niệm khó quên.
                    </p>
                    <p>
                        Ngoài ra, những quán cà phê độc đáo, kiến trúc Pháp cổ kính và vườn hoa đủ sắc màu cũng là những điểm nhấn không thể bỏ qua. Hãy lên kế hoạch cho chuyến đi Đà Lạt của bạn ngay hôm nay!
                    </p>
                `,
                ratingCount: 50,
                likes: [
                    { id: 'user1', fullName: 'Trần Thị B' },
                    { id: 'user2', fullName: 'Lê Văn C' },
                    { id: 'user123', fullName: 'Người dùng hiện tại' }
                ],
                comments: []
            };
            setPostDetail(data);
            setCurrentLikeCount(data.likes.length);
            setCurrentLikedUsers(data.likes);
            setIsLikedByUser(data.likes.some(likeUser => likeUser.id === user.id));
            setCurrentCommentCount(15);
        } else {
            setPostDetail(null);
            setCurrentCommentCount(0);
            setCurrentLikeCount(0);
            setCurrentLikedUsers([]);
            setIsLikedByUser(false);
        }
    }, [topicId, postId, user]);

    const handleLikeToggle = () => {
        if (user && user.id) {
            setIsLikedByUser(prev => {
                const newLikedStatus = !prev;
                if (newLikedStatus) {
                    setCurrentLikeCount(prevCount => prevCount + 1);
                    setCurrentLikedUsers(prevUsers => [...prevUsers, { id: user.id, fullName: user.fullName || 'Bạn' }]);
                } else {
                    setCurrentLikeCount(prevCount => prevCount - 1);
                    setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
                }
                return newLikedStatus;
            });
        } else {
            alert('Bạn cần đăng nhập để thích bài viết.');
        }
    };

    return {
        postDetail,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
    };
};

// Dữ liệu giả định cho các bài viết tương tự
const dummyRelatedPosts = [
    {
        id: 'related-1',
        title: 'Tối ưu hóa hình ảnh cho Web với React',
        thumbnail: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=React+Web',
        link: '/post-detail?topicId=123&postId=related-1'
    },
    {
        id: 'related-2',
        title: 'Hiểu về CSS Grid Layout trong dự án thực tế',
        thumbnail: 'https://via.placeholder.com/150/33A1FF/FFFFFF?text=CSS+Grid',
        link: '/post-detail?topicId=123&postId=related-2'
    },
    {
        id: 'related-3',
        title: 'Giới thiệu về WebAssembly và tương lai',
        thumbnail: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=WebAssembly',
        link: '/post-detail?topicId=123&postId=related-3'
    },
    {
        id: 'related-4',
        title: 'Bảo mật ứng dụng Node.js cơ bản',
        thumbnail: 'https://via.placeholder.com/150/FF33E0/FFFFFF?text=Node.js+Security',
        link: '/post-detail?topicId=123&postId=related-4'
    },
    {
        id: 'related-5',
        title: 'Sử dụng GraphQL với React và Apollo Client',
        thumbnail: 'https://via.placeholder.com/150/E0FF33/FFFFFF?text=GraphQL+React',
        link: '/post-detail?topicId=123&postId=related-5'
    },
    {
        id: 'related-6',
        title: 'Xây dựng PWA đầu tiên cho trải nghiệm người dùng',
        thumbnail: 'https://via.placeholder.com/150/5733FF/FFFFFF?text=PWA+Intro',
        link: '/post-detail?topicId=123&postId=related-6'
    },
];


const PostDetailSingleImage = () => {
    const [searchParams] = useSearchParams();
    const topicId = searchParams.get('topicId') || 'demo-topic-id';
    const postId = searchParams.get('postId') || 'single-image-post-1';

    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const { user } = useContext(AuthContext);

    const {
        postDetail,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
    } = usePostDetail(topicId, postId, user);

    const [openLikes, setOpenLikes] = useState(false);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const contentRef = useRef(null); // Ref này sẽ chỉ áp dụng cho nội dung chữ

    const [showReplies, setShowReplies] = useState({});
    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    // Áp dụng styles nội dung chữ
    useEffect(() => {
        if (!postDetail || !contentRef.current) return;

        const contentElement = contentRef.current;
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
    }, [postDetail, mode]);


    const handleOpenLikes = () => {
        setOpenLikes(true);
    };

    const handleCloseLikes = () => {
        setOpenLikes(false);
    };

    const handleOpenComments = (post) => {
        setSelectedPost(post);
        setOpenComments(true);
    };

    const handleCloseComments = () => {
        setOpenComments(false);
        setSelectedPost(null);
    };

    const handleOpenImageModal = (src) => {
        setModalImageSrc(src);
        setOpenImageModal(true);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
        setModalImageSrc('');
    };

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                width: '85vw',
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: theme.transitions.create(['background-color', 'color'], {
                    duration: theme.transitions.duration.standard,
                }),
                mt: 10,
            }}
        >
            {!postDetail ? (
                <Typography color={theme.palette.text.primary}>Đang tải bài viết...</Typography>
            ) : (
                <Box>
                    {/* Main Content Area: Image on Left, Text and Actions on Right */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens, row on medium+
                            gap: 3, // Space between columns
                            mb: 3, // Margin bottom for this section
                        }}
                    >
                        {/* Left Column: Image */}
                        <Box
                            sx={{
                                flex: { xs: 'none', md: 1 }, // Take full width on xs, 1 part on md+
                                //       minWidth: { md: '300px' }, // Minimum width for image column
                                maxWidth: { md: '80%' }, // Max width for image column
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start', // Align image to top
                                p: { xs: 0, md: 1 }, // Add some padding on medium+
                                borderRight: { md: `1px solid ${theme.palette.divider}` }, // Divider on right
                                borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' }, // Divider on bottom for xs
                                pb: { xs: 2, md: 0 }, // Padding bottom for xs
                                mr: { xs: 0, md: -1 } // Adjust margin to meet the divider cleanly
                            }}
                        >
                            {postDetail.imageUrl && (
                                <Box
                                    component="img"
                                    src={postDetail.imageUrl}
                                    alt="Featured image"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: { xs: '300px', md: '500px' }, // Max height for image
                                        height: 'auto',
                                        borderRadius: '10px',
                                        objectFit: 'cover',
                                        boxShadow: mode === 'dark' ? '0 4px 12px rgba(255, 255, 255, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: mode === 'dark' ? '0 6px 18px rgba(255,255,255,0.25)' : '0 6px 18px rgba(0,0,0,0.25)',
                                        }
                                    }}
                                    onClick={() => handleOpenImageModal(postDetail.imageUrl)}
                                />
                            )}
                        </Box>

                        {/* Right Column: Content and Actions */}
                        <Box
                            sx={{
                                flex: { xs: 'none', md: 2 }, // Take full width on xs, 2 parts on md+
                                p: { xs: 0, md: 1 }, // Add some padding on medium+
                                display: 'flex',
                                flexDirection: 'column', // Stack content and actions vertically
                                justifyContent: 'space-between', // Space out content and the bottom actions
                                minHeight: '100%', // Ensure the right column takes full height
                            }}
                        >
                            <Box>
                                {/* Title and Author */}
                                <Typography variant="subtitle2" color={theme.palette.text.secondary}>
                                    👤 {postDetail.authorId?.fullName}
                                </Typography>
                                <Typography variant="h5" gutterBottom color={theme.palette.text.primary}>
                                    {postDetail.title}
                                </Typography>
                                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                                {/* Content */}
                                <Typography
                                    variant="body1"
                                    component="div"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: theme.palette.text.primary,
                                        mb: 2, // Add some margin below the content
                                    }}
                                    dangerouslySetInnerHTML={{ __html: postDetail.content }}
                                    ref={contentRef}
                                />
                            </Box>

                            {/* Actions: Stats and Buttons at the bottom of the right column */}
                            <Box>
                                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                                {/* Stats */}
                                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', color: theme.palette.primary.main, fontSize: '0.8rem' }}
                                        onClick={() => handleOpenComments(postDetail)}
                                    >
                                        💬 {currentCommentCount} Bình luận
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', color: theme.palette.secondary.main, fontSize: '0.8rem' }}
                                        onClick={handleOpenLikes}
                                    >
                                        ❤️ {currentLikeCount} Lượt thích
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.8rem', mt: 1, color: theme.palette.text.secondary }}
                                    >
                                        ⭐ {postDetail.ratingCount || 0} lượt đánh giá
                                    </Typography>
                                </Box>

                                {/* Button to open comment dialog */}
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        mt: 2,
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.dark,
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                    }}
                                    onClick={() => handleOpenComments(postDetail)}
                                >
                                    Viết bình luận
                                </Button>

                                {/* Like/Comment/Rating buttons */}
                                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />
                                <Box display="flex" justifyContent="space-around" mt={1}>
                                    <Button
                                        startIcon={
                                            isLikedByUser ? (
                                                <FavoriteIcon sx={{ color: 'red' }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ color: theme.palette.text.primary }} />
                                            )
                                        }
                                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                                        onClick={handleLikeToggle}
                                    >
                                        Thích
                                    </Button>
                                    <Button
                                        startIcon={<ChatBubbleOutlineIcon sx={{ color: theme.palette.text.primary }} />}
                                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                                        onClick={() => handleOpenComments(postDetail)}
                                    >
                                        Bình luận
                                    </Button>
                                    <Button
                                        startIcon={<StarBorderIcon sx={{ color: theme.palette.text.primary }} />}
                                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                                        onClick={() => { /* Logic for rating */ }}
                                    >
                                        Đánh giá
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box> {/* End Main Content Area */}

                    {/* --- Các bài viết tương tự --- */}
                    <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        Các bài viết tương tự
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            gap: 2,
                            pb: 1,
                            '&::-webkit-scrollbar': { height: '8px' },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                        }}
                    >
                        {dummyRelatedPosts.map((relatedPost) => (
                            <Card
                                key={relatedPost.id}
                                sx={{
                                    minWidth: 180, maxWidth: 180, boxShadow: 2, borderRadius: 2,
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                                    cursor: 'pointer', flexShrink: 0,
                                    bgcolor: theme.palette.background.default, color: theme.palette.text.primary,
                                }}
                                onClick={() => window.location.href = relatedPost.link}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image={relatedPost.thumbnail}
                                    alt={relatedPost.title}
                                    sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                                />
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography
                                        variant="subtitle2" component="div" noWrap
                                        sx={{
                                            fontWeight: 'medium', color: theme.palette.text.primary,
                                            '&:hover': { color: theme.palette.primary.main }
                                        }}
                                    >
                                        {relatedPost.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Image Modal */}
                    <Dialog
                        open={openImageModal}
                        onClose={handleCloseImageModal}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                transition: theme.transitions.create(['background-color', 'color'], {
                                    duration: theme.transitions.duration.standard,
                                }),
                            }
                        }}
                    >
                        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            Xem ảnh
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseImageModal}
                                sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.action.active }}
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
                                borderColor: theme.palette.divider,
                            }}
                        >
                            <img
                                src={modalImageSrc}
                                alt="Zoomed"
                                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Comment Dialog */}
                    <CommentDialog
                        open={openComments}
                        onClose={handleCloseComments}
                        post={selectedPost}
                        user={user}
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
                        mode={mode}
                    />
                </Box>
            )}
        </Box>
    );
};

export default PostDetailSingleImage;