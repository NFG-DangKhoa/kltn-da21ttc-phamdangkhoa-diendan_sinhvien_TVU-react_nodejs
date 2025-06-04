// TopicDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn/CenterColumn';
import RightColumn from './RightColumn';
import CustomBreadcrumbs from '../../components/CustomBreadcrumbs';

const TopicDetail = () => {
    const { topicId } = useParams();
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [topic, setTopic] = useState(null);
    // Thay đổi trạng thái loading để bao gồm cả việc tải topic và posts
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});
    const { user } = useContext(AuthContext);

    const theme = useTheme();

    // Effect để tải thông tin chủ đề
    useEffect(() => {
        const fetchTopic = async () => {
            try {
                setLoadingTopic(true); // Bắt đầu tải topic
                const topicRes = await axios.get(`http://localhost:5000/api/topics/topics/${topicId}`);
                setTopic(topicRes.data);
                setError(null); // Reset lỗi nếu thành công
            } catch (err) {
                console.error('Lỗi khi tải thông tin chủ đề:', err);
                setError('Không thể tải thông tin chủ đề. Vui lòng thử lại sau hoặc chủ đề không tồn tại.');
            } finally {
                setLoadingTopic(false); // Kết thúc tải topic
            }
        };
        if (topicId) { // Đảm bảo topicId tồn tại trước khi fetch
            fetchTopic();
        }
    }, [topicId]);

    // Effect để tải bài viết chi tiết
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true); // Bắt đầu tải posts
                const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                setDetailedPosts(postsRes.data);
                setError(null); // Reset lỗi nếu thành công
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu bài viết:', err);
                // Giữ nguyên lỗi cũ nếu lỗi tải topic đã có, hoặc set lỗi mới nếu đây là lỗi đầu tiên
                setError(prevError => prevError || 'Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoadingPosts(false); // Kết thúc tải posts
            }
        };
        if (topicId) { // Đảm bảo topicId tồn tại trước khi fetch
            fetchPosts();
        }
    }, [topicId]);

    const handlePostSubmit = async (postWithUserId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found. User is not logged in.");
                alert("Bạn cần đăng nhập để đăng bài viết.");
                return;
            }
            await axios.post(
                `http://localhost:5000/api/posts/cr`,
                {
                    ...postWithUserId,
                    topicId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // Sau khi đăng bài thành công, tải lại danh sách bài viết
            const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
            setDetailedPosts(postsRes.data);
            setNewPost({ title: '', content: '', tags: '' });
        } catch (err) {
            console.error('Lỗi khi đăng bài viết:', err);
            alert('Có lỗi xảy ra khi đăng bài viết. Vui lòng thử lại.');
        }
    };

    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Chuyển hướng nếu người dùng chưa đăng nhập
    if (!user) return <Navigate to="/login" replace />;

    // Hiển thị trạng thái tải hoặc lỗi ban đầu
    // Đợi cả topic và posts tải xong
    if (loadingTopic || loadingPosts) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', mt: 8 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải dữ liệu chủ đề...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', mt: 8 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    // Nếu không có lỗi và đã tải xong, hiển thị nội dung
    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 2,
                mt: 8,
                minHeight: '100vh',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: theme.palette.background.default,
                transition: 'background-color 0.4s ease',
            }}
        >
            <Box sx={{ mb: 3, ml: 16 }}>
                {/* Đảm bảo topic đã có dữ liệu trước khi truy cập topic.name */}
                {/* topic đã được đảm bảo có dữ liệu do có logic loading ở trên */}
                <CustomBreadcrumbs topicName={topic ? topic.name : ''} />
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <LeftColumn user={user} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CenterColumn
                        user={user}
                        topic={topic}
                        topicId={topicId}
                        newPost={newPost}
                        setNewPost={setNewPost}
                        handlePostSubmit={handlePostSubmit}
                        detailedPosts={detailedPosts}
                        setDetailedPosts={setDetailedPosts}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        showReplies={showReplies}
                        toggleReplies={toggleReplies}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <RightColumn />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TopicDetail;