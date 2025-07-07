import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
    Chip,
    Stack,
    useTheme,
    Box,
    Rating
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleOutline, ThumbUpAltOutlined } from '@mui/icons-material';

// Thêm prop isDarkMode vào component
const PostCard = ({ post, isDarkMode }) => {
    const navigate = useNavigate();
    const theme = useTheme(); // Lấy theme object hiện tại

    const averageRating = post.averageRating || 0;

    return (
        <Card
            sx={{
                marginY: 2,
                // Sử dụng background.paper cho nền Card
                backgroundColor: theme.palette.background.paper,
                // Box shadow tùy chỉnh theo isDarkMode
                boxShadow: isDarkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                transition: 'background-color 0.4s ease, box-shadow 0.2s ease',
                '&:hover': {
                    boxShadow: isDarkMode ? '0px 6px 12px rgba(0,0,0,0.4)' : '0px 6px 12px rgba(0,0,0,0.15)',
                },
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    component="div"
                    // Sử dụng text.primary cho tiêu đề bài viết
                    color={theme.palette.text.primary}
                >
                    {post.title}
                </Typography>
                <Typography
                    variant="body2"
                    // Sử dụng text.secondary cho nội dung tóm tắt
                    color={theme.palette.text.secondary}
                    sx={{ marginY: 1 }}
                >
                    {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', marginY: 1 }}>
                    {post.tags && post.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            size="small"
                            // Màu chip sẽ tự động thay đổi theo theme.primary.main
                            color="primary"
                            sx={{
                                // Tùy chỉnh màu chữ chip nếu cần, mặc định Material-UI xử lý tốt
                                // color: theme.palette.primary.contrastText,
                                // backgroundColor: theme.palette.primary.main,
                            }}
                        />
                    ))}
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <ChatBubbleOutline sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                                {post.commentCount || 0}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <ThumbUpAltOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                                {post.likeCount || 0}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Rating
                                name="read-only"
                                value={averageRating}
                                readOnly
                                precision={0.5}
                                size="small"
                            />
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                                ({post.ratingCount || 0})
                            </Typography>
                        </Stack>
                    </Stack>
                    <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}
                    >
                        {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    onClick={() => navigate(`/posts/${post._id}`)}
                    sx={{
                        // Sử dụng primary.main cho màu chữ nút
                        color: theme.palette.primary.main,
                        '&:hover': {
                            // Hover effect sử dụng primary.light với độ trong suốt
                            backgroundColor: theme.palette.primary.light + '1A', // 10% opacity
                        },
                    }}
                >
                    Xem chi tiết
                </Button>
            </CardActions>
        </Card>
    );
};

export default PostCard;
