import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
    Chip,
    Stack,
    useTheme // Import useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Thêm prop isDarkMode vào component
const PostCard = ({ post, isDarkMode }) => {
    const navigate = useNavigate();
    const theme = useTheme(); // Lấy theme object hiện tại

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
                <Typography
                    variant="caption"
                    // Sử dụng text.secondary cho thông tin lượt xem/ngày đăng
                    color={theme.palette.text.secondary}
                >
                    Lượt xem: {post.views} - Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
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