import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Grid, Tabs, Tab } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ActivityCard from "./ActivityCard";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const UserActivity = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                // Fetch posts with author details
                const postsRes = await axios.get(`http://localhost:5000/api/users/posts?authorId=${userId}`, config);
                console.log('Posts response:', postsRes.data);

                // Fetch user comments
                const commentsRes = await axios.get(`http://localhost:5000/api/users/comments?authorId=${userId}`, config);
                console.log('Comments response:', commentsRes.data);

                // Fetch user likes
                const likesRes = await axios.get(`http://localhost:5000/api/users/likes?userId=${userId}`, config);// Process and transform the data                console.log('Raw posts data:', postsRes.data);
                // Build a map from postId to topicId for quick lookup
                const postIdToTopicId = {};
                (Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.posts || []).forEach(post => {
                    let topicId = post.topicId;
                    if (topicId && typeof topicId === 'object' && topicId._id) topicId = topicId._id;
                    postIdToTopicId[post._id] = topicId;
                });

                const posts = (Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.posts || []).map(post => {
                    let topicId = post.topicId;
                    if (topicId && typeof topicId === 'object' && topicId._id) topicId = topicId._id;
                    return {
                        type: "post",
                        title: post.title || "Bài viết không có tiêu đề",
                        content: post.content || '',
                        timestamp: post.createdAt || new Date().toISOString(),
                        likes: post.likeCount || 0,
                        comments: post.commentCount || 0,
                        link: `/posts/${post._id}`,
                        topic: post.topicId,
                        topicId, // always string or undefined
                        status: post.status,
                        _id: post._id
                    };
                });

                const comments = commentsRes.data.map(comment => {
                    let topicId = postIdToTopicId[comment.postId];
                    if (topicId && typeof topicId === 'object' && topicId._id) topicId = topicId._id;
                    return {
                        type: "comment",
                        title: `Bình luận về \"${comment.postTitle || 'Bài viết'}\"`,
                        content: comment.content,
                        timestamp: comment.createdAt,
                        likes: comment.likes?.length || 0,
                        comments: 0,
                        link: `/posts/${comment.postId}#comment-${comment._id}`,
                        postId: comment.postId,
                        topicId // always string or undefined
                    };
                });

                const likes = likesRes.data.map(like => ({
                    type: "like",
                    title: like.postId ? "Đã thích bài viết" : "Đã thích bình luận",
                    content: like.postId
                        ? `Đã thích bài viết "${like.postTitle || 'Không có tiêu đề'}"`
                        : `Đã thích bình luận của ${like.commentAuthor || 'ai đó'}`,
                    timestamp: like.createdAt,
                    link: like.postId
                        ? `/posts/${like.postId}`
                        : `/posts/${like.commentPostId}#comment-${like.commentId}`,
                    targetId: like.postId || like.commentId
                }));

                // Combine all activities and sort by timestamp
                const allActivities = [...posts, ...comments, ...likes]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setActivities(allActivities);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching activities:", error);
                setError("Không thể tải hoạt động.");
                setLoading(false);
            }
        };

        if (userId) {
            fetchActivities();
        }
    }, [userId]); const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filterActivities = () => {
        if (!activities.length) return [];
        switch (activeTab) {
            case 0: // Posts
                return activities.filter(act => act.type === 'post');
            case 1: // Comments
                return activities.filter(act => act.type === 'comment');
            case 2: // Likes
                return activities.filter(act => act.type === 'like');
            default:
                return activities;
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const filteredActivities = filterActivities();

    if (!filteredActivities.length) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography align="center">Chưa có hoạt động nào.</Typography>
            </Box>
        );
    } return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                variant="fullWidth"
                sx={{ mb: 2 }}
            >
                <Tab
                    icon={<PostAddIcon />}
                    label={`Bài viết (${activities.filter(a => a.type === 'post').length})`}
                    sx={{ minHeight: 'auto', py: 2 }}
                />
                <Tab
                    icon={<ChatBubbleOutlineIcon />}
                    label={`Bình luận (${activities.filter(a => a.type === 'comment').length})`}
                    sx={{ minHeight: 'auto', py: 2 }}
                />
                <Tab
                    icon={<ThumbUpIcon />}
                    label={`Lượt thích (${activities.filter(a => a.type === 'like').length})`}
                    sx={{ minHeight: 'auto', py: 2 }}
                />
            </Tabs>

            <Box sx={{ py: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : filteredActivities.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                        Không có hoạt động nào trong mục này
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {filteredActivities.map((activity) => (
                            <Grid item xs={12} sm={6} md={4} key={activity._id || activity.timestamp}>
                                <div
                                    style={{ cursor: 'pointer', height: '100%' }}
                                    onClick={() => {
                                        // Điều hướng đúng format PostDetail: /posts/detail?topicId=...&postId=...
                                        if (activity.type === 'post' || activity.type === 'comment') {
                                            const postId = activity.type === 'post' ? activity._id : activity.postId;
                                            const topicId = activity.topicId;
                                            if (postId && topicId) {
                                                navigate(`/posts/detail?topicId=${topicId}&postId=${postId}`, { replace: true });
                                            } else if (postId) {
                                                // fallback if topicId missing
                                                navigate(`/posts/detail?postId=${postId}`, { replace: true });
                                            }
                                        } else if (activity.type === 'like') {
                                            // Like có thể là post hoặc comment
                                            if (activity.link && activity.link.startsWith('/posts/')) {
                                                // Nếu là like bài viết hoặc bình luận, lấy postId từ link
                                                const match = activity.link.match(/\/posts\/(\w+)/);
                                                if (match) {
                                                    navigate(`/posts/detail?postId=${match[1]}`, { replace: true });
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <ActivityCard {...activity} />
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default UserActivity;