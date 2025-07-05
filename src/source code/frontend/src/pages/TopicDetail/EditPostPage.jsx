// frontend/src/pages/TopicDetail/EditPostPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostForm from './CenterColumn/PostForm'; // <--- Đảm bảo đường dẫn này đúng
import { Box, Typography } from '@mui/material'; // <--- DÒNG QUAN TRỌNG BẠN CẦN KIỂM TRA LẠI

const EditPostPage = ({ user, darkMode }) => {
    const { postId } = useParams(); // Lấy postId từ URL
    const navigate = useNavigate();
    const [postData, setPostData] = useState(null); // Dữ liệu bài viết để chỉnh sửa
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPostData(response.data.post); // Giả sử API trả về { post: {...} }
            } catch (err) {
                console.error('Error fetching post for editing:', err);
                setError('Không thể tải bài viết để chỉnh sửa.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleUpdatePost = async (updatedPost) => {
        try {
            const token = localStorage.getItem('token');
            // Gửi dữ liệu cập nhật lên backend
            await axios.put(`http://localhost:5000/api/posts/${postId}`, updatedPost, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Bài viết đã được cập nhật thành công!');
            navigate(`/posts/detail?postId=${postId}`); // Quay về trang chi tiết bài viết
        } catch (err) {
            console.error('Error updating post:', err);
            alert('Cập nhật bài viết thất bại. Vui lòng thử lại.');
        }
    };

    if (loading) return <Typography>Đang tải bài viết...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!postData) return <Typography>Không tìm thấy bài viết.</Typography>;

    return (
        <Box sx={{ p: 4, backgroundColor: darkMode ? '#1a1a1a' : '#fff', color: darkMode ? '#eee' : '#333' }}>
            <Typography variant="h5" sx={{ mb: 3, color: darkMode ? '#fff' : '#000' }}>Chỉnh sửa bài viết</Typography>
            <PostForm
                user={user}
                newPost={{ title: postData.title, content: postData.content, tags: postData.tags || [], topicId: postData.topicId }} // Truyền dữ liệu hiện tại
                setNewPost={() => { }} // Không cần set new post ở đây
                handlePostSubmit={handleUpdatePost} // Xử lý submit cho việc cập nhật
                isEditMode={true} // Báo hiệu là chế độ chỉnh sửa
                darkMode={darkMode}
            />
        </Box>
    );
};

export default EditPostPage;