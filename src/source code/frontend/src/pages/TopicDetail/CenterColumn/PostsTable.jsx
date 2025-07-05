import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Tooltip,
    Avatar,
    Chip,
    useTheme,
    alpha,
    Zoom,
    Skeleton,
    Pagination
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Comment, ThumbUp, Star } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

// Helper function to construct full URL for images
const constructUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `http://localhost:5000${path}`;
};

const TableSkeleton = () => (
    [...Array(5)].map((_, index) => (
        <TableRow key={index}>
            <TableCell>
                <Skeleton variant="text" width="80%" />
            </TableCell>
            <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Skeleton variant="rectangular" width={50} height={24} />
                    <Skeleton variant="rectangular" width={50} height={24} />
                    <Skeleton variant="rectangular" width={50} height={24} />
                </Box>
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ ml: 1.5, flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                    </Box>
                </Box>
            </TableCell>
        </TableRow>
    ))
);

const PostsTable = ({ posts, topicId, loading }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const paginatedPosts = posts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleRowClick = (postId) => {
        navigate(`/posts/detail?topicId=${topicId}&postId=${postId}`);
    };

    const handleAuthorClick = (e, authorId) => {
        e.stopPropagation(); // Prevent row click when clicking on the author
        navigate(`/profile/${authorId}`);
    };

    return (
        <TableContainer
            component={Paper}
            sx={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                background: darkMode ? theme.palette.grey[900] : '#ffffff',
                overflow: 'hidden'
            }}
        >
            <Table aria-label="posts table">
                <TableHead
                    sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`,
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                >
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                fontSize: '0.95rem',
                                py: 2
                            }}
                        >
                            B
                            ài viết
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                fontSize: '0.95rem',
                                py: 2
                            }}
                        >
                            Tương tác
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                fontSize: '0.95rem',
                                py: 2
                            }}
                        >
                            Tác giả & Thời gian
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableSkeleton />
                    ) : posts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary" mb={1}>
                                    Chưa có bài viết nào
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Hãy là người đầu tiên đăng bài trong chủ đề này!
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedPosts.map((post, index) => (
                            <Zoom in={true} timeout={300 + index * 50} key={post._id}>
                                <TableRow
                                    hover
                                    onClick={() => handleRowClick(post._id)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            transform: 'translateX(4px)',
                                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                                        },
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ py: 2.5 }}>
                                        <Box>
                                            <Typography
                                                variant="body1"
                                                fontWeight="600"
                                                color={darkMode ? '#e4e6eb' : '#1c1e21'}
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.4,
                                                    mb: 0.5,
                                                    '&:hover': {
                                                        color: theme.palette.primary.main
                                                    }
                                                }}
                                            >
                                                {post.title}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Tooltip title="Bình luận">
                                                <Chip
                                                    icon={<Comment sx={{ fontSize: '0.9rem' }} />}
                                                    label={post.commentCount || 0}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: alpha(theme.palette.info.main, 0.3),
                                                        color: theme.palette.info.main,
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.info.main, 0.1)
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Lượt thích">
                                                <Chip
                                                    icon={<ThumbUp sx={{ fontSize: '0.9rem' }} />}
                                                    label={post.likeCount || 0}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                                        color: theme.palette.success.main,
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.success.main, 0.1)
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Đánh giá trung bình">
                                                <Chip
                                                    icon={<Star sx={{ fontSize: '0.9rem' }} />}
                                                    label={post.averageRating ? post.averageRating.toFixed(1) : '0.0'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: alpha(theme.palette.warning.main, 0.3),
                                                        color: theme.palette.warning.main,
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.warning.main, 0.1)
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 2.5 }}>
                                        {post.authorId ? (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    borderRadius: 2,
                                                    p: 1,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                        transform: 'translateX(2px)',
                                                        '& .author-name': {
                                                            color: theme.palette.primary.main,
                                                            textDecoration: 'underline'
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => handleAuthorClick(e, post.authorId._id)}
                                            >
                                                <Avatar
                                                    src={constructUrl(post.authorId.avatarUrl)}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        mr: 1.5,
                                                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                        boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`
                                                    }}
                                                >
                                                    {post.authorId.fullName?.[0] || 'U'}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography
                                                        className="author-name"
                                                        variant="body2"
                                                        fontWeight="600"
                                                        color={darkMode ? '#e4e6eb' : '#1c1e21'}
                                                        sx={{
                                                            transition: 'all 0.2s ease',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {post.authorId.fullName || 'Người dùng'}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: 'block', mt: 0.25 }}
                                                    >
                                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        mr: 1.5,
                                                        bgcolor: alpha(theme.palette.grey[500], 0.3)
                                                    }}
                                                >
                                                    ?
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                                                        Người dùng ẩn danh
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </Zoom>
                        ))
                    )}
                </TableBody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                    count={Math.ceil(posts.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    sx={{
                        '& .Mui-selected': {
                            backgroundColor: `${theme.palette.primary.main} !important`,
                            color: '#fff',
                        },
                    }}
                />
            </Box>
        </TableContainer>
    );
};

export default PostsTable;
