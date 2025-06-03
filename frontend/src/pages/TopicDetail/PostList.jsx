import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Avatar,
    Box,
    Chip,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    Pagination,
} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    Forum as ForumIcon,
    Search as SearchIcon,
} from '@mui/icons-material';

// Dữ liệu giả định cho các bài viết
const dummyPosts = [
    {
        id: 1,
        title: 'Cách tối ưu hiệu suất ứng dụng React Hooks',
        author: 'Nguyễn Văn A',
        avatar: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=A',
        date: '2025-05-30',
        excerpt: 'Tìm hiểu các kỹ thuật và mẹo để tối ưu hóa hiệu suất khi sử dụng React Hooks trong ứng dụng của bạn...',
        tags: ['React', 'Hooks', 'Performance'],
        comments: 15,
    },
    {
        id: 2,
        title: 'Hướng dẫn sử dụng Redux Toolkit cho dự án lớn',
        author: 'Trần Thị B',
        avatar: 'https://via.placeholder.com/40/33A1FF/FFFFFF?text=B',
        date: '2025-05-28',
        excerpt: 'Redux Toolkit giúp đơn giản hóa việc quản lý state trong các ứng dụng React phức tạp. Khám phá cách triển khai hiệu quả...',
        tags: ['Redux', 'State Management', 'Toolkit'],
        comments: 22,
    },
    {
        id: 3,
        title: 'Xây dựng RESTful API với Node.js và Express',
        author: 'Phạm Minh C',
        avatar: 'https://via.placeholder.com/40/33FF57/FFFFFF?text=C',
        date: '2025-05-25',
        excerpt: 'Bài viết này sẽ hướng dẫn bạn từng bước xây dựng một RESTful API mạnh mẽ bằng Node.js, Express và MongoDB...',
        tags: ['Node.js', 'Express', 'API', 'MongoDB'],
        comments: 8,
    },
    {
        id: 4,
        title: 'Component Design Patterns trong React',
        author: 'Lê Thị D',
        avatar: 'https://via.placeholder.com/40/FF33E0/FFFFFF?text=D',
        date: '2025-05-22',
        excerpt: 'Khám phá các mẫu thiết kế phổ biến để xây dựng các component React linh hoạt, tái sử dụng và dễ bảo trì...',
        tags: ['React', 'Design Patterns', 'Components'],
        comments: 18,
    },
    {
        id: 5,
        title: 'Deploy ứng dụng React lên Vercel và Netlify',
        author: 'Hoàng Văn E',
        avatar: 'https://via.placeholder.com/40/E0FF33/FFFFFF?text=E',
        date: '2025-05-20',
        excerpt: 'Hướng dẫn chi tiết cách triển khai ứng dụng React của bạn lên các nền tảng hosting miễn phí và dễ sử dụng như Vercel và Netlify...',
        tags: ['Deployment', 'Vercel', 'Netlify', 'React'],
        comments: 10,
    },
    {
        id: 6,
        title: 'Tìm hiểu về Next.js cho Server-Side Rendering',
        author: 'Nguyễn Văn A',
        avatar: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=A',
        date: '2025-05-18',
        excerpt: 'Next.js là một framework React mạnh mẽ cho phép bạn xây dựng các ứng dụng React với Server-Side Rendering (SSR)...',
        tags: ['Next.js', 'SSR', 'React'],
        comments: 12,
    },
];

const POSTS_PER_PAGE = 5; // Số lượng bài viết mỗi trang

function PostList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState(dummyPosts);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const newFilteredPosts = dummyPosts.filter(post =>
            post.title.toLowerCase().includes(lowercasedFilter) ||
            post.author.toLowerCase().includes(lowercasedFilter) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredPosts(newFilteredPosts);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    }, [searchTerm]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Diễn Đàn Công Nghệ
                </Typography>
                <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
            </Box>

            <Grid container spacing={3}>
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <Grid item xs={12} key={post.id}>
                            <Card
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': { transform: 'translateY(-5px)' },
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        flexGrow: 1,
                                    }}
                                >
                                    <CardContent sx={{ pb: 1 }}>
                                        <Typography variant="h6" component="h2" sx={{ fontWeight: '600', mb: 1, color: 'text.primary' }}>
                                            {post.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar src={post.avatar} alt={post.author} sx={{ width: 24, height: 24, mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {post.author}
                                            </Typography>
                                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 2, mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {post.date}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                            {post.excerpt}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            {post.tags.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ borderRadius: '4px' }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ForumIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {post.comments} bình luận
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            sx={{ textTransform: 'none', borderRadius: '20px' }}
                                        >
                                            Đọc thêm
                                        </Button>
                                    </CardActions>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            Không tìm thấy bài viết nào phù hợp.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {filteredPosts.length > POSTS_PER_PAGE && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                        size="large"
                    />
                </Box>
            )}
        </Container>
    );
}

export default PostList;