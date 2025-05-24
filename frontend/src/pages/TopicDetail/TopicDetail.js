import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';



const TopicDetail = () => {
    const { topicId } = useParams();
    const [detailedPosts, setDetailedPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        tags: ''
    });

    const [topic, setTopic] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [showComments, setShowComments] = useState({});
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
                setDetailedPosts(postsRes.data);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
            }

        };

        fetchData();
    }, [topicId]);

    const handlePostSubmit = async (postWithUserId) => {
        try {
            await axios.post(`http://localhost:5000/api/posts/crr`, {
                ...postWithUserId,
                topicId,
            });
            const postsRes = await axios.get(`http://localhost:5000/api/posts/topic-details/${topicId}`);
            setDetailedPosts(postsRes.data);
            setNewPost({ title: '', content: '', tags: '' });
        } catch (err) {
            console.error('Lỗi khi đăng bài viết:', err);
        }
    };



    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // ✅ Sau useEffect, kiểm tra đăng nhập
    if (!user) return <Navigate to="/login" replace />;

    return (
        <Box sx={{ flexGrow: 1, p: 2, mt: 0, backgroundColor: '#f0f4f8' }}>
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
