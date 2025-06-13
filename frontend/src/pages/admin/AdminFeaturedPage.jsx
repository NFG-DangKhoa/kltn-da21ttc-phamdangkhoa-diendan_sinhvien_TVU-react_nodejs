import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    Chip,
    Avatar,
    Button,
    Alert,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Refresh as RefreshIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminFeaturedPage = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const [postsRes, topicsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/featured/posts', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/admin/featured/topics', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (postsRes.data.success) {
                setPosts(postsRes.data.data.posts);
            }

            if (topicsRes.data.success) {
                setTopics(topicsRes.data.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Không thể tải dữ liệu');
            setLoading(false);
        }
    };

    const handlePostFeaturedChange = async (postId, featured) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/admin/featured/posts/${postId}`,
                { featured },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, featured } : post
                ));
                setSuccess(response.data.message);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Error updating post:', error);
            setError('Không thể cập nhật bài viết');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleTopicTrendingChange = async (topicId, trending) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/admin/featured/topics/${topicId}`,
                { trending },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setTopics(topics.map(topic =>
                    topic._id === topicId ? { ...topic, trending } : topic
                ));
                setSuccess(response.data.message);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Error updating topic:', error);
            setError('Không thể cập nhật chủ đề');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBulkUpdatePosts = async (featured) => {
        if (selectedPosts.length === 0) {
            setError('Vui lòng chọn ít nhất một bài viết');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/admin/featured/bulk-update-posts',
                { postIds: selectedPosts, featured },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setPosts(posts.map(post =>
                    selectedPosts.includes(post._id) ? { ...post, featured } : post
                ));
                setSelectedPosts([]);
                setSuccess(response.data.message);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Error bulk updating posts:', error);
            setError('Không thể cập nhật hàng loạt bài viết');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBulkUpdateTopics = async (trending) => {
        if (selectedTopics.length === 0) {
            setError('Vui lòng chọn ít nhất một chủ đề');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/admin/featured/bulk-update-topics',
                { topicIds: selectedTopics, trending },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setTopics(topics.map(topic =>
                    selectedTopics.includes(topic._id) ? { ...topic, trending } : topic
                ));
                setSelectedTopics([]);
                setSuccess(response.data.message);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            console.error('Error bulk updating topics:', error);
            setError('Không thể cập nhật hàng loạt chủ đề');
            setTimeout(() => setError(null), 3000);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num?.toString() || '0';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    ⭐ Quản lý Nổi bật & Thịnh hành
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchData}
                    disabled={loading}
                >
                    Làm mới
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<StarIcon />}
                        label="Bài viết nổi bật"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<TrendingUpIcon />}
                        label="Chủ đề thịnh hành"
                        iconPosition="start"
                    />
                </Tabs>

                {/* Posts Tab */}
                {currentTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleBulkUpdatePosts(true)}
                                disabled={selectedPosts.length === 0}
                            >
                                Đánh dấu nổi bật ({selectedPosts.length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleBulkUpdatePosts(false)}
                                disabled={selectedPosts.length === 0}
                            >
                                Bỏ nổi bật ({selectedPosts.length})
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedPosts.length > 0 && selectedPosts.length < posts.length}
                                                checked={posts.length > 0 && selectedPosts.length === posts.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPosts(posts.map(p => p._id));
                                                    } else {
                                                        setSelectedPosts([]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>Bài viết</TableCell>
                                        <TableCell>Tác giả</TableCell>
                                        <TableCell>Chủ đề</TableCell>
                                        <TableCell>Thống kê</TableCell>
                                        <TableCell>Ngày tạo</TableCell>
                                        <TableCell>Nổi bật</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post._id}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedPosts.includes(post._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPosts([...selectedPosts, post._id]);
                                                        } else {
                                                            setSelectedPosts(selectedPosts.filter(id => id !== post._id));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                    {post.thumbnailImage && (
                                                        <Box
                                                            component="img"
                                                            src={post.thumbnailImage}
                                                            alt={post.title}
                                                            sx={{
                                                                width: 60,
                                                                height: 40,
                                                                objectFit: 'cover',
                                                                borderRadius: 1,
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                    )}
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {post.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {post.excerpt || (post.content?.substring(0, 100) + '...')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar
                                                        src={post.authorId?.avatarUrl}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {post.authorId?.fullName?.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {post.authorId?.fullName || 'Ẩn danh'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={post.topicId?.name || 'Chưa phân loại'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: post.topicId?.color || '#2196F3',
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        icon={<VisibilityIcon />}
                                                        label={formatNumber(post.views)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        icon={<CommentIcon />}
                                                        label={formatNumber(post.commentCount)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        icon={<FavoriteIcon />}
                                                        label={formatNumber(post.likeCount)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(post.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={post.featured || false}
                                                    onChange={(e) => handlePostFeaturedChange(post._id, e.target.checked)}
                                                    color="warning"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Topics Tab */}
                {currentTab === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleBulkUpdateTopics(true)}
                                disabled={selectedTopics.length === 0}
                            >
                                Đánh dấu thịnh hành ({selectedTopics.length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleBulkUpdateTopics(false)}
                                disabled={selectedTopics.length === 0}
                            >
                                Bỏ thịnh hành ({selectedTopics.length})
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            {topics.map((topic) => (
                                <Grid item xs={12} sm={6} md={4} key={topic._id}>
                                    <Card
                                        sx={{
                                            position: 'relative',
                                            border: selectedTopics.includes(topic._id) ? 2 : 1,
                                            borderColor: selectedTopics.includes(topic._id) ? 'primary.main' : 'divider'
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                                                <Checkbox
                                                    checked={selectedTopics.includes(topic._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTopics([...selectedTopics, topic._id]);
                                                        } else {
                                                            setSelectedTopics(selectedTopics.filter(id => id !== topic._id));
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: '50%',
                                                        bgcolor: topic.color || '#2196F3',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2,
                                                        color: 'white',
                                                        fontSize: '1.5rem'
                                                    }}
                                                >
                                                    {topic.category === 'academic' ? '📚' :
                                                        topic.category === 'social' ? '👥' :
                                                            topic.category === 'career' ? '💼' :
                                                                topic.category === 'event' ? '🎉' : '💬'}
                                                </Box>

                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                    {topic.name}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {topic.description}
                                                </Typography>

                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                                                    <Chip
                                                        label={`${topic.postCount || 0} bài viết`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                    {topic.recentPostCount > 0 && (
                                                        <Chip
                                                            label={`+${topic.recentPostCount} tuần này`}
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>

                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={topic.trending || false}
                                                            onChange={(e) => handleTopicTrendingChange(topic._id, e.target.checked)}
                                                            color="error"
                                                        />
                                                    }
                                                    label="Thịnh hành"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default AdminFeaturedPage;
